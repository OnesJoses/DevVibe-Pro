# Google Cloud Storage Setup for AI Knowledge System

This guide will help you set up Google Cloud Storage to persist your AI knowledge data across sessions.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Project**: Create a new Google Cloud project
3. **Billing**: Enable billing (required for storage)
4. **Storage API**: Enable Cloud Storage API

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project"
3. Name it: `devvibe-ai-knowledge`
4. Note the Project ID (e.g., `devvibe-ai-knowledge-12345`)

### 2. Enable Cloud Storage API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Cloud Storage API"
3. Click "Enable"

### 3. Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `ai-knowledge-service`
4. Role: `Storage Admin`
5. Click "Create Key" > "JSON"
6. Download the key file as `google-cloud-key.json`

### 4. Create Storage Bucket

1. Go to "Cloud Storage" > "Buckets"
2. Click "Create Bucket"
3. Name: `devvibe-ai-knowledge` (globally unique)
4. Location: Choose closest to your users
5. Storage class: `Standard`
6. Access control: `Uniform`

### 5. Configure Your Project

Update the configuration in your code:

\`\`\`typescript
// In src/lib/google-cloud-ai-storage.ts
export const defaultCloudConfig: CloudConfig = {
  projectId: 'your-actual-project-id',        // Replace with your project ID
  bucketName: 'your-actual-bucket-name',      // Replace with your bucket name
  keyFilename: './google-cloud-key.json'      // Path to your service account key
}
\`\`\`

### 6. Security Setup

#### For Development:
- Place `google-cloud-key.json` in your project root
- Add to `.gitignore`: `google-cloud-key.json`

#### For Production:
- Use environment variables instead of key file
- Set `GOOGLE_CLOUD_PROJECT_ID` and `GOOGLE_CLOUD_BUCKET_NAME`
- Use Google Cloud IAM roles for authentication

### 7. Environment Variables (Production)

Create `.env` file:
\`\`\`
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
\`\`\`

## Configuration Options

### Basic Configuration (Development)
\`\`\`typescript
const cloudConfig = {
  projectId: 'devvibe-ai-knowledge-12345',
  bucketName: 'devvibe-ai-knowledge',
  keyFilename: './google-cloud-key.json'
}
\`\`\`

### Production Configuration
\`\`\`typescript
const cloudConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  bucketName: process.env.GOOGLE_CLOUD_BUCKET_NAME,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}')
}
\`\`\`

## Cost Estimation

Google Cloud Storage pricing (as of 2024):
- **Storage**: ~$0.020 per GB/month
- **Operations**: ~$0.05 per 10,000 operations
- **Network**: Free within same region

For AI knowledge data:
- **Estimated storage**: 1-10 MB per month
- **Estimated cost**: <$0.01 per month
- **Free tier**: 5 GB/month (plenty for AI data)

## Data Structure

Your AI knowledge will be stored as:
\`\`\`
your-bucket/
├── ai-data/
│   ├── conversations.json      # All conversations
│   ├── excellent-responses.json # 5-star responses
│   ├── knowledge.json          # 4+ star knowledge
│   ├── blocked-responses.json  # Blocked bad responses
│   └── stats.json             # Usage statistics
└── backups/
    └── 2024-09-03/            # Daily backups
        ├── conversations.json
        └── ...
\`\`\`

## Benefits

✅ **Persistent**: Data survives browser clearing
✅ **Scalable**: Handles growing knowledge base
✅ **Reliable**: Google Cloud 99.9% uptime
✅ **Secure**: Enterprise-grade security
✅ **Backup**: Automatic backup system
✅ **Multi-device**: Access from anywhere
✅ **Cost-effective**: Pay only for what you use

## Testing

After setup, test with:
\`\`\`typescript
import { cloudFreshAI } from './src/lib/cloud-fresh-ai-system'

// Check connection
const status = cloudFreshAI.getConnectionStatus()
console.log('Cloud status:', status)

// Test save/load
await cloudFreshAI.saveFeedback('test question', 'test answer', 5)
const stats = await cloudFreshAI.getCloudStats()
console.log('Cloud stats:', stats)
\`\`\`

## Troubleshooting

### Common Issues:

1. **Authentication Error**
   - Check service account key file path
   - Verify IAM permissions

2. **Bucket Access Error**
   - Ensure bucket exists
   - Check bucket permissions

3. **API Not Enabled**
   - Enable Cloud Storage API in console

4. **Billing Not Enabled**
   - Enable billing in Google Cloud Console

### Debug Mode:
Set environment variable: `GOOGLE_CLOUD_DEBUG=true`

## Next Steps

1. Complete the setup above
2. Update configuration in your code
3. Test the connection
4. Deploy with cloud persistence
5. Monitor usage in Google Cloud Console

Your AI will now have persistent memory across all sessions! 🚀
