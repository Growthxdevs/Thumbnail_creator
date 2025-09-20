# Vercel Deployment Guide

## 🔧 **Required Environment Variables**

Make sure these environment variables are set in your Vercel project dashboard:

### **Required Variables:**

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - A random secret for NextAuth.js
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

### **Optional Variables:**

- `PRISMA_QUERY_ENGINE_LIBRARY` - Set to `1` (already configured in vercel.json)

## 🚀 **Deployment Steps**

1. **Set Environment Variables in Vercel:**

   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables listed above

2. **Deploy the Code:**

   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push origin main
   ```

3. **Monitor the Deployment:**
   - Check the Vercel dashboard for build logs
   - The build should now complete successfully

## 🔍 **Troubleshooting**

### **If Build Still Fails:**

1. **Check Environment Variables:**

   ```bash
   # Run this locally to verify your .env file
   node scripts/check-env.js
   ```

2. **Verify Database Connection:**

   ```bash
   # Test database connection locally
   node scripts/test-db-connection.js
   ```

3. **Check Vercel Build Logs:**
   - Look for specific error messages in the Vercel dashboard
   - Common issues:
     - Missing environment variables
     - Database connection issues
     - Prisma client generation problems

### **Common Issues & Solutions:**

- **"DATABASE_URL not set"**: Ensure the environment variable is set in Vercel
- **"Prisma client not found"**: The postinstall script should handle this automatically
- **"Prepared statement already exists"**: Fixed with the retry logic in db-utils.ts

## 📋 **Pre-Deployment Checklist**

- [ ] All environment variables are set in Vercel
- [ ] Local build passes (`npm run build`)
- [ ] Database is accessible from Vercel
- [ ] Google OAuth is configured for production domain
- [ ] NextAuth secret is set and secure

## 🎯 **Expected Results**

After successful deployment:

- ✅ Build completes without errors
- ✅ `/editor` route works after authentication
- ✅ No more "prepared statement already exists" errors
- ✅ Database operations work reliably
- ✅ NextAuth sessions persist correctly
