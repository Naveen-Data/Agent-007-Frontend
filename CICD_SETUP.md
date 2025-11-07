# GitHub Actions CI/CD Setup Guide

This guide helps you configure GitHub Actions for automated deployment of the Agent 007 frontend to AWS S3 + CloudFront.

## Prerequisites

1. AWS Account with free tier access
2. GitHub repository for this project
3. Backend deployed and accessible

## Required GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

### AWS Configuration
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: `us-east-1` (or preferred region)

### S3 and CloudFront Configuration
- `S3_BUCKET_NAME`: Globally unique S3 bucket name (e.g., `agent007-frontend-yourname`)
- `CLOUDFRONT_DISTRIBUTION_ID`: Added after first deployment

### Application Configuration
- `REACT_APP_BACKEND_URL`: Your backend URL (e.g., `https://your-ec2-ip:8000`)

## Initial Setup

1. **Manual First Deployment**:
```bash
npm install
npm run build
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

2. **Add CloudFront Distribution ID** to GitHub secrets after deployment

## CI/CD Pipeline Features

The pipeline includes:
- Automated testing with Jest
- React build optimization
- S3 deployment with CloudFront cache invalidation
- Lighthouse performance testing
- Automatic rollback on failures

## Environment Variables

The build process uses these environment variables:
- `REACT_APP_BACKEND_URL`: Backend API endpoint
- `GENERATE_SOURCEMAP`: Set to `false` for production
- `INLINE_RUNTIME_CHUNK`: Set to `false` for optimization

## Monitoring

### Performance Testing
The pipeline runs Lighthouse tests and fails if:
- Performance score < 80
- Accessibility score < 90
- Best Practices score < 80
- SEO score < 80

### Health Checks
```bash
curl https://your-cloudfront-domain.cloudfront.net
```

## Troubleshooting

- Check GitHub Actions logs for build/deployment issues
- Verify S3 bucket permissions and CloudFront distribution
- Ensure backend CORS is configured for your frontend domain
- Monitor AWS free tier usage