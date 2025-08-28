import { createRoot } from 'react-dom/client'
import './shadcn.css'
import App from './App'

function removeFallback() {
	const el = document.querySelector('#app .boot-fallback')
	if (el && el.parentElement) el.parentElement.removeChild(el)
}

try {
	const appEl = document.getElementById('app')
	if (!appEl) throw new Error('Root element #app not found')
	const root = createRoot(appEl)
	root.render(<App />)
	removeFallback()
} catch (e) {
	console.error('Failed to bootstrap React app:', e)
	const appEl = document.getElementById('app')
	if (appEl) {
		appEl.innerHTML = '<div style="padding:16px;text-align:center">Failed to load the app. Check the console for details.</div>'
	}
}
