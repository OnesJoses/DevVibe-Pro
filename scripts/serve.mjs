#!/usr/bin/env node
// Minimal static file server for the dist folder (no dev/build tooling needed)
import http from 'http'
import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')

const args = process.argv.slice(2)
let port = 5500
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if ((a === '-p' || a === '--port') && args[i + 1]) {
    port = Number(args[i + 1]) || port
  } else if (a.startsWith('--port=')) {
    port = Number(a.split('=')[1]) || port
  }
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

const server = http.createServer((req, res) => {
  try {
    const reqUrl = decodeURI(req.url || '/')
    let filePath = path.join(distDir, reqUrl)

    // If path is a directory, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }

    // If file doesn't exist, try SPA fallback to index.html
    if (!fs.existsSync(filePath)) {
      const fallback = path.join(distDir, 'index.html')
      if (fs.existsSync(fallback)) {
        const data = fs.readFileSync(fallback)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(data)
        return
      }
      res.writeHead(404)
      res.end('404 Not Found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const type = mime[ext] || 'application/octet-stream'
    const stream = fs.createReadStream(filePath)
    res.writeHead(200, { 'Content-Type': type })
    stream.pipe(res)
  } catch (err) {
    res.writeHead(500)
    res.end('500 Internal Server Error')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist on http://localhost:${port}`)
})
