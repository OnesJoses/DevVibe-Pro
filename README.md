# DevVibe Pro (lean)

Static React + TypeScript app built with esbuild and Tailwind.
Backend: Django (DRF + JWT) under `pyserver/`.

## Local Development

```powershell
npm install
npm run dev
```

App serves at the URL printed in the terminal (e.g., http://127.0.0.1:5173).

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

Set the environment variable so the frontend calls your live Django API:

Vercel → Project Settings → Environment Variables:
- VITE_DJANGO_API_BASE = https://onesmuss-workspace.onrender.com

## Django backend (Render)

The Django app lives in `pyserver/` and is configured for Render.

Render Service (Python):
- Root Directory: `pyserver`
- Build Command:
	- `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput`
- Start Command:
	- `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`

Important env vars on Render:
- DJANGO_SECRET_KEY (generate)
- DJANGO_DEBUG=False
- DJANGO_ALLOWED_HOSTS=onesmuss-workspace.onrender.com
- DJANGO_CORS=https://onesmus-workspace-site.vercel.app
- DJANGO_CSRF=https://onesmus-workspace-site.vercel.app
