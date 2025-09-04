/**
 * Google Cloud Configuration for AI Knowledge System
 * Update these values with your actual Google Cloud project details
 */

// STEP 1: Update these values with your Google Cloud project details
export const cloudConfig = {
  // Replace with your actual Google Cloud Project ID
  projectId: 'your-project-id-here',  // e.g., 'devvibe-ai-knowledge-12345'
  
  // Replace with your actual bucket name (must be globally unique)
  bucketName: 'your-bucket-name-here',  // e.g., 'devvibe-ai-knowledge-abc123'
  
  // Path to your service account key file
  keyFilename: './google-cloud-key.json'
}

// STEP 2: For production deployment, use environment variables instead:
export const productionConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  bucketName: process.env.GOOGLE_CLOUD_BUCKET_NAME,
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) : undefined
}

// STEP 3: Choose configuration based on environment
export const getCloudConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionConfig
  }
  return cloudConfig
}

export default cloudConfig
