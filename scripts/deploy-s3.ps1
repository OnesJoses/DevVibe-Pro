Param(
  [Parameter(Mandatory = $true)][string]$BucketName,
  [string]$Region = "eu-north-1",
  [switch]$MakePublic,
  [switch]$SkipBuild,
  [string]$DistributionId
)

function Fail($msg) { Write-Error $msg; exit 1 }

# Banner (ASCII dash to avoid encoding issues)
Write-Host ("S3 Deploy - bucket: {0}, region: {1}" -f $BucketName, $Region) -ForegroundColor Cyan

# Checks
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { Fail "AWS CLI not found. Install from https://aws.amazon.com/cli/ and run 'aws configure'." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm not found. Install Node.js from https://nodejs.org/." }

# Build
if (-not $SkipBuild) {
  Write-Host "Building project (npm run build)" -ForegroundColor Yellow
  $build = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run build" -NoNewWindow -Wait -PassThru
  if ($build.ExitCode -ne 0) { Fail ("Build failed with exit code {0}." -f $build.ExitCode) }
}

if (-not (Test-Path -Path "dist")) { Fail "dist folder not found. Build first or remove -SkipBuild." }

# Configure SPA website hosting (index.html for both index and error)
Write-Host "Configuring S3 static website hosting (SPA fallback)" -ForegroundColor Yellow
$websiteConfig = @{ IndexDocument = @{ Suffix = "index.html" }; ErrorDocument = @{ Key = "index.html" } } | ConvertTo-Json -Depth 5
$tempWebsite = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempWebsite -Value $websiteConfig -Encoding ASCII
aws s3api put-bucket-website --bucket $BucketName --region $Region --website-configuration file://$tempWebsite | Out-Null
Remove-Item $tempWebsite -Force -ErrorAction SilentlyContinue

# Optionally set public-read policy for website endpoint
if ($MakePublic) {
  Write-Host "Applying public-read bucket policy (website endpoint)" -ForegroundColor Yellow
  # Ensure Public Access Block is disabled so the policy is effective
  $pab = @{ BlockPublicAcls = $false; IgnorePublicAcls = $false; BlockPublicPolicy = $false; RestrictPublicBuckets = $false } | ConvertTo-Json
  $tempPab = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tempPab -Value $pab -Encoding ASCII
  aws s3api put-public-access-block --bucket $BucketName --region $Region --public-access-block-configuration file://$tempPab | Out-Null
  Remove-Item $tempPab -Force -ErrorAction SilentlyContinue
  $policyObj = @{ 
    Version = "2012-10-17";
    Statement = @(@{ Sid = "PublicReadGetObject"; Effect = "Allow"; Principal = "*"; Action = @("s3:GetObject"); Resource = "arn:aws:s3:::$BucketName/*" })
  }
  $policyJson = $policyObj | ConvertTo-Json -Depth 10
  $tempPolicy = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tempPolicy -Value $policyJson -Encoding ASCII
  aws s3api put-bucket-policy --bucket $BucketName --region $Region --policy file://$tempPolicy | Out-Null
  Remove-Item $tempPolicy -Force -ErrorAction SilentlyContinue
}

# Upload assets: long cache for static assets, no-cache for index.html
Write-Host "Syncing static assets (except index.html)" -ForegroundColor Yellow
aws s3 sync dist s3://$BucketName --region $Region --delete --exclude "index.html" --cache-control "public,max-age=31536000,immutable"

Write-Host "Uploading index.html with no-cache" -ForegroundColor Yellow
aws s3 cp dist/index.html s3://$BucketName/index.html --region $Region --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html; charset=utf-8"

# Optional CloudFront invalidation
if ($DistributionId) {
  Write-Host "Invalidating CloudFront distribution $DistributionId" -ForegroundColor Yellow
  aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
}

$siteUrl = "http://$BucketName.s3-website.$Region.amazonaws.com"
Write-Host 'Deployed. Website endpoint:' -ForegroundColor Green
Write-Host ("  {0}" -f $siteUrl) -ForegroundColor Green
