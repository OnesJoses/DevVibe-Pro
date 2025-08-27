import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const isProd = args[0] === '--production'

console.log('Starting build script...')

// Clean dist directory
try {
  await rimraf('dist')
  console.log('Cleaned dist directory')
} catch (e) {
  console.log('Could not clean dist:', e.message)
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
  loader: {
    '.html': 'copy',
    '.png': 'file',
  },
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
}

if (isProd) {
  console.log('Building for production...')
  await esbuild.build(esbuildOpts)
  console.log('Production build complete!')
} else {
  console.log('Starting development server...')
  try {
    const ctx = await esbuild.context(esbuildOpts)
    console.log('Created esbuild context')
    
    await ctx.watch()
    console.log('Started file watcher')
    
    const result = await ctx.serve({ 
      port: 5174,
      host: '127.0.0.1'
    })
    
    console.log(`Development server running on:`)
    console.log(`http://127.0.0.1:${result.port}`)
    
    // Keep the process alive
    process.on('SIGTERM', async () => {
      console.log('Shutting down...')
      await ctx.dispose()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('Error starting development server:', error)
    process.exit(1)
  }
}
