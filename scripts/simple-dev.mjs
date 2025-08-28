import * as esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

console.log('Simple dev server starting...')

try {
  const ctx = await esbuild.context({
    entryPoints: ['src/main.tsx', 'index.html'],
    outdir: 'dist',
    write: true,
    bundle: true,
    format: 'iife',
    jsx: 'automatic',
    sourcemap: 'linked',
    loader: { '.html': 'copy', '.png': 'file' },
    plugins: [
      stylePlugin({ postcss: { plugins: [tailwindcss, autoprefixer] } }),
    ],
  })

  await ctx.watch()
  const { hosts, port } = await ctx.serve({ port: 5173 })
  console.log('Server running on:')
  hosts.forEach((host) => console.log(`  http://${host}:${port}`))
} catch (error) {
  console.error('Error starting simple dev server:', error)
  process.exit(1)
}
