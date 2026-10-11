import { pdf } from 'pdf-to-img'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { resolve, basename } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// Usage: node scripts/upload-pdf.mjs "path.pdf" "Company Name" "Doc Title"
const [,, pdfPath, companyName, docTitle = 'Presentation'] = process.argv

if (!pdfPath || !companyName) {
  console.error('❌ Usage: node scripts/upload-pdf.mjs "file.pdf" "Company Name" "Doc Title"')
  process.exit(1)
}

const run = async () => {
  const filePath = resolve(pdfPath)
  console.log(`\n📄 Processing: ${filePath}`)

  // 1. Get company
  const { data: company, error: cErr } = await supabase
    .from('companies')
    .select('id, name')
    .eq('name', companyName)
    .single()

  if (cErr || !company) {
    console.error(`❌ Company "${companyName}" not found`)
    process.exit(1)
  }
  console.log(`✅ Company: ${company.name} (${company.id})`)

  // 2. Upload original PDF to contracts-raw
  const pdfFileName = `${company.id}/${Date.now()}-${basename(filePath)}`
  const pdfBuffer = await readFile(filePath)

  const { error: rawErr } = await supabase.storage
    .from('contracts-raw')
    .upload(pdfFileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (rawErr) {
    console.error('❌ Failed to upload PDF:', rawErr.message)
    process.exit(1)
  }
  console.log(`✅ Uploaded PDF to contracts-raw`)

  // 3. Convert PDF to images
  console.log(`🔄 Converting PDF to images...`)
  const doc = await pdf(filePath, { scale: 2 })
  const images = []
  let pageNum = 1
  for await (const image of doc) {
    images.push({ page: pageNum, buffer: image })
    process.stdout.write(`\r   Page ${pageNum} converted`)
    pageNum++
  }
  console.log(`\n✅ Converted ${images.length} pages`)

  // 4. Create document record
  const { data: document, error: dErr } = await supabase
    .from('documents')
    .insert({
      company_id: company.id,
      title: docTitle,
      category: 'presentation',
      storage_path: pdfFileName,
      page_count: images.length
    })
    .select()
    .single()

  if (dErr) {
    console.error('❌ Failed to create document:', dErr.message)
    process.exit(1)
  }
  console.log(`✅ Document created: ${document.id}`)

  // 5. Upload each page image
  console.log(`⬆️  Uploading pages...`)
  for (const { page, buffer } of images) {
    const imgPath = `${document.id}/page-${String(page).padStart(3, '0')}.png`
    const { error: imgErr } = await supabase.storage
      .from('contracts-pages')
      .upload(imgPath, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (imgErr) {
      console.error(`\n❌ Page ${page} failed:`, imgErr.message)
      continue
    }

    await supabase.from('document_pages').insert({
      document_id: document.id,
      page_number: page,
      storage_path: imgPath
    })

    process.stdout.write(`\r   Uploaded ${page}/${images.length} pages`)
  }
  console.log(`\n✅ All pages uploaded`)

  console.log(`\n🎉 Done! Refresh your dashboard and open ${company.name}\n`)
}

run().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})