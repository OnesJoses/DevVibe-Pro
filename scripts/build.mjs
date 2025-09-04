import * as esbuild from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

console.log('DevVibe build script: alias support enabled')

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

await rimraf('dist')

// Define environment variables for the client
const define = {}
for (const key in process.env) {
  if (key.startsWith('VITE_')) {
    define[`import.meta.env.${key}`] = JSON.stringify(process.env[key])
  }
}
// Also define import.meta.env.MODE
define['import.meta.env.MODE'] = JSON.stringify(isProd ? 'production' : 'development')

/**
 * @type {esbuild.BuildOptions}
 */
const esbuildOpts = {
  absWorkingDir: process.cwd(),
  logLevel: 'info',
  color: true,
  entryPoints: ['src/main.tsx', 'index.html'],
  outdir: 'dist',
  entryNames: '[name]',
  write: true,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  sourcemap: isProd ? false : 'linked',
  minify: isProd,
  treeShaking: true,
  jsx: 'automatic',
  define,
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  external: ['node:*', 'fs', 'path', 'crypto', 'http', 'https', 'url', 'os'],
  alias: {
    '@': path.resolve(process.cwd(), 'src'),
  },
  loader: {
    '.html': 'copy',
    '.png': 'file',
  },
  plugins: [
    {
      name: 'debug-start',
      setup(build) {
        build.onStart(() => {
          console.log('[esbuild] build start, alias plugin active')
        })
      },
    },
    // Resolve "@/" to the local src folder (e.g., "@/lib/x" -> "<cwd>/src/lib/x")
    {
      name: 'alias-at-prefix',
      setup(build) {
        build.onResolve({ filter: /^@\/.*/ }, (args) => {
          const base = path.resolve(process.cwd(), 'src', args.path.slice(2))
          console.log('[alias] resolving', args.path, '->', base)
          const candidates = [
            base,
            `${base}.ts`,
            `${base}.tsx`,
            `${base}.js`,
            `${base}.jsx`,
            path.join(base, 'index.ts'),
            path.join(base, 'index.tsx'),
            path.join(base, 'index.js'),
            path.join(base, 'index.jsx'),
          ]
          const found = candidates.find((p) => fs.existsSync(p))
          if (found) {
            console.log('[alias] -> found', found)
          } else {
            console.log('[alias] -> not found; using base path')
          }
          return { path: found || base, namespace: 'file' }
        })
      },
    },
    stylePlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
}

if (isProd) {
  await esbuild.build(esbuildOpts)
} else {
  const ctx = await esbuild.context(esbuildOpts)
  await ctx.watch()

  // Robust dev server: try PORT env or 5173, fallback to 5174/5175 if busy
  const candidates = [
    Number(process.env.PORT) || 5173,
    5174,
    5175,
  ]

  let served = null
  let lastError = null
  for (const cand of candidates) {
    try {
      served = await ctx.serve({ port: cand, host: '127.0.0.1' })
      break
    } catch (err) {
      lastError = err
    }
  }

  if (!served) {
    console.error('\n❌ Failed to start dev server on ports', candidates.join(', '))
    if (lastError) console.error('Reason:', lastError?.message || lastError)
    console.error('Tip: Close any process using those ports or set PORT=5180')
    process.exit(1)
  }

  const { hosts, port } = served
  console.log('Running on:')
  hosts.forEach((host) => console.log(`http://${host}:${port}`))
  await new Promise(() => {})
}
