import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'

const API = process.env.API_URL || 'http://localhost:4000'
const ROOT = path.resolve(process.cwd(), '..') // repo root

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

function chunk(text, max = 1200) {
  // simple paragraph/window chunker
  const paras = text.split(/\n{2,}/g)
  const out = []
  let cur = ''
  for (const p of paras) {
    if ((cur + '\n\n' + p).length > max) {
      if (cur.trim()) out.push(cur.trim())
      cur = p
    } else {
      cur = cur ? cur + '\n\n' + p : p
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function sha1(s) { return crypto.createHash('md5').update(s, 'utf8').digest('hex') }

function toTitle(fp) {
  const base = path.basename(fp).replace(/\.(md|markdown|html|txt|json)$/i, '')
  return base.replace(/[-_]/g, ' ').trim()
}

async function waitForHealth(timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${API}/health`)
      if (r.ok) return true
    } catch {}
    await new Promise(r => setTimeout(r, 750))
  }
  throw new Error('API health check timed out')
}

async function collectEntries() {
  const sources = []
  const kbDir = path.join(ROOT, 'my-ai-knowledge')
  if (fs.existsSync(kbDir)) {
    for (const fp of walk(kbDir)) {
      if (!/\.(md|markdown|html|txt|json)$/i.test(fp)) continue
      try {
        const raw = fs.readFileSync(fp, 'utf8')
        if (fp.endsWith('.json')) {
          const json = JSON.parse(raw)
          const arr = Array.isArray(json) ? json : [json]
          for (const j of arr) {
            if (!j?.content) continue
            sources.push({ title: j.title || toTitle(fp), content: j.content, source: 'json', path: fp, tags: j.tags || [] })
          }
        } else {
          const parts = chunk(raw, 1400)
          for (const c of parts) {
            sources.push({ title: toTitle(fp), content: c, source: path.extname(fp).slice(1), path: fp, tags: [] })
          }
        }
      } catch {}
    }
  }
  // Also include repo-level README/docs
  for (const fp of ['README.md', 'AI-MIGRATION-GUIDE.md', 'LOCAL-AI-KNOWLEDGE-GUIDE.md']) {
    const p = path.join(ROOT, fp)
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      for (const c of chunk(raw, 1400)) {
        sources.push({ title: toTitle(p), content: c, source: 'markdown', path: p, tags: [] })
      }
    }
  }
  // Dedupe by title + sha1(content)
  const seen = new Set()
  const deduped = []
  for (const s of sources) {
    const key = `${s.title}::${sha1(s.content)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push({ ...s, content_sha1: sha1(s.content) })
  }
  return deduped
}

async function main() {
  console.log(`Waiting for API at ${API} ...`)
  await waitForHealth()
  console.log('Collecting sources...')
  const entries = await collectEntries()
  console.log(`Prepared ${entries.length} unique chunks. Importing...`)
  const res = await fetch(`${API}/api/knowledge/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries })
  })
  if (!res.ok) {
    console.error('Import failed:', res.status, await res.text())
    process.exit(1)
  }
  const out = await res.json()
  console.log('Import result:', out)
}
main().catch(e => { console.error(e); process.exit(1) })
