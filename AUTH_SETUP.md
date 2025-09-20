# Authentication Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Provider
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

## Features Implemented

✅ **NextAuth.js Integration**

- Google OAuth provider
- Database sessions with Prisma
- User management with credits system

✅ **Authentication Components**

- Login/Logout buttons
- User menu with profile info
- Credit display
- Pro user badge

✅ **Protected API Routes**

- `/api/removeBg` - Requires authentication
- `/api/credits/add` - Add credits to user
- `/api/credits/deduct` - Deduct credits from user
- `/api/user-subscription` - Get user subscription info
- `/api/update-subscription` - Update user subscription

✅ **Database Schema**

- Extended User model with NextAuth fields
- Account and Session tables for OAuth
- VerificationToken table for email verification

## Usage

1. Users can sign in with Google
2. User data is automatically synced with your existing User model
3. Credits and subscription status are preserved
4. All API routes are protected and require authentication
5. User menu shows credits and Pro status

## Next Steps

1. Set up Google OAuth provider
2. Add environment variables
3. Test authentication flow
4. Customize UI components as needed
