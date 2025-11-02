# Railway Environment Variables Setup

## Required Environment Variables

Copy these from your `config/.env.supabase` file to Railway:

### Database
- `DATABASE_URL` = `postgresql://postgres.xkkigddktnusnkmiteug:OcN315.mZoA@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL` = `postgresql://postgres.xkkigddktnusnkmiteug:OcN315.mZoA@aws-1-eu-north-1.pooler.supabase.com:5432/postgres`

### Supabase
- `SUPABASE_URL` = `https://xkkigddktnusnkmiteug.supabase.co`
- `SUPABASE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2lnZGRrdG51c25rbWl0ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjUwMjcsImV4cCI6MjA3NzEwMTAyN30.E3Ki_pvXIZBZzxHQlaiV23X910sBAqTi5CyhrRIAHmw`

### Cloudinary
- `CLOUDINARY_CLOUD_NAME` = `ocn315`

### System
- `NODE_ENV` = `production`

## Railway Deployment Steps

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add Docker configuration for Railway"
   git push origin main
   ```

2. **Create Railway Project**:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Environment Variables**:
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add all the variables listed above

4. **Deploy**:
   - Railway will automatically detect `Dockerfile` and build
   - Wait for deployment to complete
   - Click on the generated URL to access your app

## Local Docker Testing

Test the Docker build locally before deploying:

```bash
# Build the image
docker build -t dec-app .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres.xkkigddktnusnkmiteug:OcN315.mZoA@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true" \
  -e DIRECT_URL="postgresql://postgres.xkkigddktnusnkmiteug:OcN315.mZoA@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  -e SUPABASE_URL="https://xkkigddktnusnkmiteug.supabase.co" \
  -e SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2lnZGRrdG51c25rbWl0ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MjUwMjcsImV4cCI6MjA3NzEwMTAyN30.E3Ki_pvXIZBZzxHQlaiV23X910sBAqTi5CyhrRIAHmw" \
  -e CLOUDINARY_CLOUD_NAME="ocn315" \
  dec-app

# Open http://localhost:3000
```

## Troubleshooting

### Build fails
- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Check Railway build logs

### Database connection errors
- Verify DATABASE_URL is correct
- Check Supabase allows connections from Railway IPs
- Try using connection pooler (port 6543) instead of direct (5432)

### App crashes on startup
- Check Railway logs for errors
- Verify all environment variables are set
- Test locally with Docker first
