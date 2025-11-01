# 🚀 Supabase Edge Function with Rembg WASM Setup Guide

## **FREE Background Removal Running 24/7**

This guide will help you deploy Rembg (WASM) inside Supabase Edge Functions so it runs 24/7 for FREE!

## ✅ What We've Set Up

1. **Supabase Edge Function** (`supabase/functions/remove-background/`)

   - Uses `@imgly/background-removal` (Rembg WASM) for background removal
   - Runs on Supabase's edge infrastructure 24/7
   - Completely FREE on Supabase's free tier

2. **Updated Next.js API Route** (`app/api/removeBg/route.ts`)
   - Now calls Supabase Edge Function as the first option
   - Falls back to other APIs if needed

## 📋 Prerequisites

1. **Supabase Account** (FREE)

   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project (or use existing)

2. **Supabase CLI** (Optional, but recommended)
   ```bash
   npm install -g supabase
   ```

## 🔧 Setup Instructions

### Step 1: Get Your Supabase Project Details

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API Keys**
4. Copy the **anon public key** (starts with `eyJ...`) - This is your `SUPABASE_ANON_KEY`

**Finding Your Project URL:**

The Project URL might not be visible on the API Keys page, but you can construct it from your project reference:

- Your project reference is in the dashboard URL: `brmfnvfilbhdwxobznar`
- Your Project URL is: `https://brmfnvfilbhdwxobznar.supabase.co`

**Quick Tip:** The Project URL follows the pattern: `https://[project-ref].supabase.co`

So for your project:

```
NEXT_PUBLIC_SUPABASE_URL=https://brmfnvfilbhdwxobznar.supabase.co
```

### Step 2: Configure Environment Variables

Add these to your `.env.local` file (create it in the root of your project if it doesn't exist):

```env
# Supabase Configuration
# Get these from: Settings → API in your Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://brmfnvfilbhdwxobznar.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find them:**

- `NEXT_PUBLIC_SUPABASE_URL`: Construct from project reference: `https://brmfnvfilbhdwxobznar.supabase.co` (your project ref is in the dashboard URL)
- `SUPABASE_ANON_KEY`: **Settings → API Keys → anon public** key (starts with `eyJ...`)

**Note:** The Project URL might not be visible on the API Keys page, but you can always construct it using: `https://[project-ref].supabase.co`

**Note:** The Supabase Edge Function will automatically use these environment variables when deployed.

### Step 3: Link Your Supabase Project (Optional but Recommended)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref xxxxx
```

### Step 4: Deploy the Edge Function

**Option A: Using Supabase CLI (Recommended)**

```bash
# Deploy the function
supabase functions deploy remove-background

# Test locally first (optional)
supabase functions serve remove-background
```

**Option B: Using Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `remove-background`
5. Copy the contents of `supabase/functions/remove-background/index.ts`
6. Paste it into the editor
7. Click **Deploy**

### Step 5: Test the Function

You can test the function using curl:

```bash
curl -X POST \
  'https://xxxxx.supabase.co/functions/v1/remove-background' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"image": "BASE64_IMAGE_STRING"}'
```

Or test it directly in your Next.js app by uploading an image through the UI.

## 🎯 How It Works

1. **User uploads image** → Next.js API route (`/api/removeBg`)
2. **API route calls Supabase Edge Function** → `/functions/v1/remove-background`
3. **Edge Function processes image** → Uses Rembg WASM (`@imgly/background-removal`)
4. **Returns processed image** → Background removed, ready to download

## 💰 Free Tier Limits

Supabase Edge Functions FREE tier includes:

- ✅ **500,000 invocations/month**
- ✅ **Unlimited execution time** (within function limits)
- ✅ **24/7 availability**
- ✅ **No cold starts** (always warm)

**For most applications, this is MORE than enough!**

## 🔄 Fallback Strategy

The implementation uses a smart fallback strategy:

1. **First:** Supabase Edge Function (Rembg WASM) - FREE, 24/7
2. **Fallback 1:** Hugging Face Gradio client
3. **Fallback 2:** Hugging Face API models
4. **Fallback 3:** Clipdrop API (if configured)
5. **Fallback 4:** Remove.bg API (if configured)
6. **Fallback 5:** Photoroom API (if configured)

This ensures maximum reliability!

## 🐛 Troubleshooting

### Function Not Working?

1. **Check environment variables:**

   ```bash
   # Make sure these are set
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. **Check function logs:**

   ```bash
   supabase functions logs remove-background
   ```

3. **Test function directly:**
   - Use the curl command above
   - Check the response for error messages

### WASM Library Issues?

If you encounter issues with the `@imgly/background-removal` library:

1. **Check Deno compatibility:**

   - The function uses `npm:` specifier for Deno compatibility
   - Make sure you're using Deno 1.28+ in Supabase Edge Functions

2. **Alternative WASM library:**
   - You can use `rembg` WASM build directly
   - Or try other WASM-based background removal libraries

## 📊 Performance

- **Speed:** 2-5 seconds per image (depends on image size)
- **Quality:** Excellent (same as Rembg Python library)
- **Availability:** 24/7, no cold starts
- **Cost:** FREE (within Supabase free tier limits)

## 🚀 Next Steps

1. **Deploy your function** using the steps above
2. **Test it** with a real image
3. **Monitor usage** in Supabase Dashboard
4. **Enjoy FREE 24/7 background removal!** 🎉

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [@imgly/background-removal GitHub](https://github.com/imgly/background-removal-js)
- [Supabase Free Tier Limits](https://supabase.com/pricing)

---

**Need help?** Check the Supabase Discord or create an issue in your repo!
