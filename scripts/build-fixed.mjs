import * as esbuild from 'esbuild'
import { rimraf } from 'rimraf'
import stylePlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

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
  define,
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
  await esbuild.build(esbuildOpts)
} else {
  const ctx = await esbuild.context(esbuildOpts)
  await ctx.watch()
  
  try {
    // Serve frontend on a fixed port (5173) to avoid conflicts with Django (8000)
    const result = await ctx.serve({ 
      port: 5173, 
      host: '127.0.0.1',
      servedir: 'dist'
    })
    console.log(`Running on:`)
    console.log(`http://127.0.0.1:${result.port}`)
    
    // Keep the process alive
    await new Promise(() => {})
  } catch (error) {
    console.error('Failed to start dev server:', error)
    // Fallback: just watch without serving
    console.log('Falling back to watch mode only...')
    await new Promise(() => {})
  }
}
