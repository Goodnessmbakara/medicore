# MediCore Deployment Guide

## Vercel Deployment

### Environment Variables Required

Set these environment variables in your Vercel dashboard:

```bash
# Database Configuration
DATABASE_URL=your-production-postgresql-url

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-for-production

# Server Configuration
NODE_ENV=production
PORT=3001

# Client URL (your Vercel domain)
CLIENT_URL=https://your-app-name.vercel.app

# API URL (same as CLIENT_URL for Vercel)
API_URL=https://your-app-name.vercel.app
```

### Database Setup

For production, you'll need a PostgreSQL database. Recommended options:

1. **Vercel Postgres** (easiest integration)
2. **Supabase** (free tier available)
3. **Neon** (serverless PostgreSQL)
4. **Railway** (simple deployment)

### Deployment Steps

1. **Connect to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all variables listed above

4. **Database Migration**:
   - The app will automatically initialize the database on first run
   - Check the logs for any database connection issues

### Post-Deployment

1. **Test the Application**:
   - Visit your Vercel URL
   - Test login with demo credentials
   - Verify all features work

2. **Monitor Logs**:
   - Check Vercel function logs for any errors
   - Monitor database connections

3. **Update DNS** (optional):
   - Add custom domain in Vercel dashboard
   - Update CLIENT_URL and API_URL accordingly

### Troubleshooting

- **Database Connection Issues**: Verify DATABASE_URL is correct
- **CORS Errors**: Ensure CLIENT_URL matches your domain
- **JWT Errors**: Check JWT_SECRET is set correctly
- **Build Failures**: Check Vercel build logs for dependency issues 