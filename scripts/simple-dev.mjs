import * as esbuild from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

console.log('Simple dev server starting...')

try {
  const ctx = await esbuild.context({
  absWorkingDir: process.cwd(),
  logLevel: 'info',
    entryPoints: ['src/main.tsx', 'index.html'],
    outdir: 'dist',
    write: true,
    bundle: true,
    format: 'iife',
    jsx: 'automatic',
    sourcemap: 'linked',
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@/': path.resolve(process.cwd(), 'src') + path.sep,
    },
    loader: { '.html': 'copy', '.png': 'file' },
    plugins: [
      {
        name: 'debug-start',
        setup(build) {
          build.onStart(() => {
            console.log('[esbuild] build start, alias plugin active')
          })
        },
      },
      // Resolve "@/" to the local src folder
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
      stylePlugin({ postcss: { plugins: [tailwindcss, autoprefixer] } }),
    ],
  })

  await ctx.watch()
  const candidates = [Number(process.env.PORT) || 5173, 5174, 5175]
  let served = null
  let lastError = null
  for (const cand of candidates) {
    try {
      served = await ctx.serve({ port: cand })
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
  console.log('Server running on:')
  hosts.forEach((host) => console.log(`  http://${host}:${port}`))
} catch (error) {
  console.error('Error starting simple dev server:', error)
  process.exit(1)
}
