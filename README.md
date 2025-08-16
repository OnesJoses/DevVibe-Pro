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

## Deploy to AWS Amplify Hosting (recommended)

This repo includes `amplify.yml` so Amplify can build the app automatically.

Steps:
1. Push to GitHub (main branch).
2. AWS Console → Amplify Hosting → Get started → Connect app → GitHub → select repo/branch.
3. Amplify detects `amplify.yml` and builds with:
	- preBuild: npm ci
	- build: npm run build
	- artifacts: dist/**
4. After first deploy, add a rewrite rule in Amplify → Rewrites and redirects:
	- Source: /<*>
	- Target: /index.html
	- Type: 200 (Rewrite)
5. Domain: Amplify → Domain management → Add domain → onesmus-workspace-site.com (and www). SSL is issued automatically.

## Deploy to AWS S3 (eu-north-1)

This repo includes a PowerShell script to deploy the SPA to an S3 website endpoint with correct SPA fallback.

1) Prereqs: Install AWS CLI and run `aws configure` with creds that can write to S3, and create your bucket.
2) Run deploy:

```powershell
# Replace with your bucket name
$env:S3_BUCKET = "your-unique-bucket-name"
npm run build
powershell -ExecutionPolicy Bypass -File scripts/deploy-s3.ps1 -BucketName $env:S3_BUCKET -Region eu-north-1 -MakePublic
```

The script:
- Configures S3 static website hosting with index.html for both index and error (SPA routing)
- Uploads all assets with long cache headers, index.html with no-cache
- Optionally invalidates CloudFront if you pass -DistributionId

Website endpoint format:
http://<bucket>.s3-website.eu-north-1.amazonaws.com
