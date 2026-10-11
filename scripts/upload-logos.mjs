import { createClient } from '@supabase/supabase-js'
import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { resolve, join, dirname } from 'path'
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

const LOGO_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'svg']

// يدور على ملف اللوجو في فولدر معين أو الفولدرات اللي فوقه
const findLogoInFolder = async (folderPath) => {
  if (!existsSync(folderPath)) return null
  const files = await readdir(folderPath)
  for (const ext of LOGO_EXTS) {
    const match = files.find(
      (f) => f.toLowerCase() === `logo.${ext}` || f.toLowerCase().startsWith(`logo.`)
    )
    if (match) {
      const fullPath = join(folderPath, match)
      const detectedExt = match.split('.').pop().toLowerCase()
      return { path: fullPath, ext: detectedExt, filename: match }
    }
  }
  return null
}

// يدور في الفولدر + اللي فوقه (ممكن يكون Logo في الفولدر الرئيسي مش Final)
const findLogoRecursive = async (startFolder) => {
  let current = startFolder
  const rootResolved = resolve(ROOT)

  while (current.startsWith(rootResolved)) {
    const logo = await findLogoInFolder(current)
    if (logo) return logo
    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }
  return null
}

const getMimeType = (ext) => {
  const map = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return map[ext] || 'image/png'
}

const processOne = async (entry, index, total) => {
  const tag = `[${index + 1}/${total}] ${entry.company}`
  console.log(`\n${'='.repeat(60)}`)
  console.log(tag)
  console.log('='.repeat(60))

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, logo_path')
    .eq('name', entry.company)
    .single()

  if (!company) {
    console.log(`❌ Company "${entry.company}" not in DB`)
    return { skipped: true }
  }

  // Skip لو اللوجو موجود بالفعل
  if (company.logo_path) {
    console.log(`⏭️  Already has logo — skipping`)
    return { skipped: true }
  }

  // Get folder from pdf path (remove filename)
  const pdfFullPath = resolve(join(ROOT, entry.pdf))
  const folderPath = dirname(pdfFullPath)

  // Find logo
  const logo = await findLogoRecursive(folderPath)
  if (!logo) {
    console.log(`❌ No logo found near: ${folderPath}`)
    return { failed: true }
  }

  console.log(`📷 Found: ${logo.filename}`)

  // Upload
  const buffer = await readFile(logo.path)
  const storagePath = `${company.id}/logo.${logo.ext}`

  const { error: uploadErr } = await supabase.storage
    .from('contracts-logos')
    .upload(storagePath, buffer, {
      contentType: getMimeType(logo.ext),
      upsert: true,
    })

  if (uploadErr) {
    console.log(`❌ Upload failed: ${uploadErr.message}`)
    return { failed: true }
  }

  // Update DB
  const { error: updateErr } = await supabase
    .from('companies')
    .update({ logo_path: storagePath })
    .eq('id', company.id)

  if (updateErr) {
    console.log(`❌ DB update failed: ${updateErr.message}`)
    return { failed: true }
  }

  console.log(`✅ Uploaded & saved`)
  return { success: true }
}

const run = async () => {
  console.log(`\n🚀 Uploading logos for ${FOLDER_MAP.length} companies\n`)

  const results = { success: 0, skipped: 0, failed: 0 }

  for (let i = 0; i < FOLDER_MAP.length; i++) {
    try {
      const res = await processOne(FOLDER_MAP[i], i, FOLDER_MAP.length)
      if (res.success) results.success++
      else if (res.skipped) results.skipped++
      else results.failed++
    } catch (err) {
      console.log(`❌ Error: ${err.message}`)
      results.failed++
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 SUMMARY`)
  console.log('='.repeat(60))
  console.log(`✅ Success: ${results.success}`)
  console.log(`⏭️  Skipped: ${results.skipped}`)
  console.log(`❌ Failed:  ${results.failed}`)
  console.log('='.repeat(60) + '\n')
}

run().catch((err) => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})