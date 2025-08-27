import * as esbuild from 'esbuild'

console.log('Simple dev server starting...')

try {
  const ctx = await esbuild.context({
    entryPoints: ['src/main.tsx'],
    outdir: 'dist',
    bundle: true,
    format: 'iife',
    jsx: 'automatic',
    sourcemap: true,
    loader: {
      '.png': 'file',
      '.css': 'css'
    }
  })

  await ctx.watch()
  const { hosts, port } = await ctx.serve({ port: 5174 })
  console.log(`Server running on:`)
  hosts.forEach((host) => {
    console.log(`  http://${host}:${port}`)
  })
} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
