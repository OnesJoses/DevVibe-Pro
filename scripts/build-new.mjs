import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const isProd = args.includes('--production')

console.log('[build-new] Starting build script...')

try {
  await rimraf('dist')
  console.log('[build-new] Cleaned dist directory')
} catch (e) {
  console.log('[build-new] Could not clean dist:', e?.message || e)
}

const esbuildOpts = {
  color: true,
  entryPoints: ['src/main.tsx', 'index.html'],
  outdir: 'dist',
  entryNames: '[name]',
  write: true,
  bundle: true,
  format: 'iife',
  sourcemap: isProd ? false : 'linked',
  minify: isProd,
  treeShaking: true,
  jsx: 'automatic',
  loader: { '.html': 'copy', '.png': 'file' },
  plugins: [
    stylePlugin({ postcss: { plugins: [tailwindcss, autoprefixer] } }),
  ],
}

if (isProd) {
  console.log('[build-new] Building for production...')
  await esbuild.build(esbuildOpts)
  console.log('[build-new] Production build complete!')
} else {
  console.log('[build-new] Starting development server...')
  const ctx = await esbuild.context(esbuildOpts)
  await ctx.watch()
  const { hosts, port } = await ctx.serve({ port: 5173 })
  console.log('[build-new] Running on:')
  for (const h of hosts) console.log(`http://${h}:${port}`)
  process.on('SIGTERM', async () => {
    console.log('[build-new] Shutting down...')
    await ctx.dispose()
    process.exit(0)
  })
}
