# 🚀 Quick Deploy: Supabase Edge Function via Dashboard

Since Supabase CLI installation is failing, use the **Supabase Dashboard** instead (easiest method)!

## ✅ Step-by-Step Deployment

### 1. Go to Supabase Dashboard

Visit: https://supabase.com/dashboard/project/brmfnvfilbhdwxobznar

### 2. Navigate to Edge Functions

- Click **"Edge Functions"** in the left sidebar
- Or go directly to: https://supabase.com/dashboard/project/brmfnvfilbhdwxobznar/functions

### 3. Create New Function

1. Click **"Create a new function"** button
2. Name it: `remove-background` (exactly this name)
3. Click **"Create function"**

### 4. Copy Function Code

1. Open this file: `supabase/functions/remove-background/index.ts`
2. Copy **ALL** the code from that file
3. Paste it into the Supabase Dashboard editor

### 5. Deploy

1. Click **"Deploy"** button
2. Wait for deployment to complete (usually takes 10-30 seconds)

### 6. Test It!

Once deployed, try uploading an image again - it should work! 🎉

---

## Alternative: Install Supabase CLI (if you prefer CLI)

### Option A: Install via Scoop (Windows)

```bash
# First install Scoop (if not installed)
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option B: Use npx (No installation needed!)

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref brmfnvfilbhdwxobznar

# Deploy function
npx supabase functions deploy remove-background
```

**Note:** Using `npx` doesn't require installation - it downloads and runs Supabase CLI on-the-fly!

---

## ✅ Verify Deployment

After deploying (via Dashboard or CLI), test it:

```bash
# Test the function
curl -X POST \
  'https://brmfnvfilbhdwxobznar.supabase.co/functions/v1/remove-background' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"image": "BASE64_IMAGE"}'
```

Or just try uploading an image in your app - it should now use Supabase Edge Function!
