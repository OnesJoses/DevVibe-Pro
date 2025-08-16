# DevVibe Pro

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

## Deploy to Netlify

This repo includes `netlify.toml` so you can deploy without extra setup.

- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing: configured via redirects to serve `/index.html`

### Option A: Connect GitHub
1. Push this repo to GitHub.
2. In Netlify, "Add new site" → "Import an existing project".
3. Select your repo.
4. Build settings will auto-populate from `netlify.toml`.
5. Deploy.

### Option B: Netlify CLI (optional)
```powershell
npm install -g netlify-cli
netlify login
netlify init # pick a team & site name
netlify deploy --build --prod
```

That’s it — your app will be live with client-side routing working on refreshes.
