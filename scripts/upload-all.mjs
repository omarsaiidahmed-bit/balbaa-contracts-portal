import { pdf } from 'pdf-to-img'
import { createClient } from '@supabase/supabase-js'
import { readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve, basename, join } from 'path'
import dotenv from 'dotenv'
import { ROOT, FOLDER_MAP } from './folder-map.mjs'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const processOne = async (entry, index, total) => {
  const tag = `[${index + 1}/${total}] ${entry.company}`
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${tag}`)
  console.log('='.repeat(60))

  // Check if already uploaded
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('name', entry.company)
    .single()

  if (!company) {
    console.log(`❌ Company "${entry.company}" not in DB — skipping`)
    return { skipped: true, reason: 'not-in-db' }
  }

  const { data: existingDoc } = await supabase
    .from('documents')
    .select('id')
    .eq('company_id', company.id)
    .limit(1)
    .maybeSingle()

  if (existingDoc) {
    console.log(`⏭️  Already has document — skipping`)
    return { skipped: true, reason: 'already-exists' }
  }

  // Build absolute path
  const pdfPath = resolve(join(ROOT, entry.pdf))

  if (!existsSync(pdfPath)) {
    console.log(`❌ PDF not found: ${pdfPath}`)
    return { skipped: true, reason: 'pdf-missing' }
  }

  try {
    // 1. Upload original PDF
    const pdfFileName = `${company.id}/${Date.now()}-${basename(pdfPath)}`
    const pdfBuffer = await readFile(pdfPath)

    const { error: rawErr } = await supabase.storage
      .from('contracts-raw')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (rawErr) {
      console.log(`❌ Raw upload failed: ${rawErr.message}`)
      return { skipped: true, reason: 'raw-upload' }
    }
    console.log(`✅ PDF uploaded`)

    // 2. Convert to images
    console.log(`🔄 Converting PDF to images...`)
    const doc = await pdf(pdfPath, { scale: 2 })
    const images = []
    let pageNum = 1
    for await (const image of doc) {
      images.push({ page: pageNum, buffer: image })
      pageNum++
    }
    console.log(`✅ ${images.length} pages converted`)

    // 3. Create document
    const { data: document, error: dErr } = await supabase
      .from('documents')
      .insert({
        company_id: company.id,
        title: 'Presentation',
        category: 'presentation',
        storage_path: pdfFileName,
        page_count: images.length,
      })
      .select()
      .single()

    if (dErr) {
      console.log(`❌ Document create failed: ${dErr.message}`)
      return { skipped: true, reason: 'doc-create' }
    }

    // 4. Upload each page
    for (const { page, buffer } of images) {
      const imgPath = `${document.id}/page-${String(page).padStart(3, '0')}.png`
      const { error: imgErr } = await supabase.storage
        .from('contracts-pages')
        .upload(imgPath, buffer, {
          contentType: 'image/png',
          upsert: false,
        })

      if (imgErr) {
        console.log(`⚠️  Page ${page} failed: ${imgErr.message}`)
        continue
      }

      await supabase.from('document_pages').insert({
        document_id: document.id,
        page_number: page,
        storage_path: imgPath,
      })
    }

    console.log(`✅ All ${images.length} pages uploaded`)
    return { skipped: false }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
    return { skipped: true, reason: 'exception' }
  }
}

const run = async () => {
  console.log(`\n🚀 Starting bulk upload — ${FOLDER_MAP.length} companies`)
  console.log(`📂 Root: ${ROOT}\n`)

  const results = { success: 0, skipped: 0, failed: 0 }

  for (let i = 0; i < FOLDER_MAP.length; i++) {
    try {
      const res = await processOne(FOLDER_MAP[i], i, FOLDER_MAP.length)
      if (res.skipped) {
        results.skipped++
      } else {
        results.success++
      }
    } catch (err) {
      console.log(`❌ Fatal on ${FOLDER_MAP[i].company}: ${err.message}`)
      results.failed++
    }
    // Small pause to avoid rate limits
    await sleep(500)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 SUMMARY`)
  console.log('='.repeat(60))
  console.log(`✅ Success: ${results.success}`)
  console.log(`⏭️  Skipped: ${results.skipped}`)
  console.log(`❌ Failed:  ${results.failed}`)
  console.log(`📦 Total:   ${FOLDER_MAP.length}`)
  console.log(`${'='.repeat(60)}\n`)
}

run().catch((err) => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})