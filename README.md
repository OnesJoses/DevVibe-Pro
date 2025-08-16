# DevVibe Pro (lean)

Static React + TypeScript app built with esbuild and Tailwind.

## Local Development

```powershell
npm install
npm run dev
```

App serves at the URL printed in the terminal (e.g., http://127.0.0.1:8000).

## Build

```powershell
npm run build
```

Outputs to `dist/`.

## Deploy to Vercel

This repo includes `vercel.json` so Vercel knows the output directory (dist) and SPA fallback.

Steps:
1. Push this repo to GitHub.
2. In Vercel, Import Project → Framework Preset: Other → Root: `./`.
3. Build & Output:
	- Install Command: npm ci
	- Build Command: npm run vercel-build
	- Output Directory: dist
4. Deploy.

After deploy, add a domain in Project Settings → Domains (optional).
