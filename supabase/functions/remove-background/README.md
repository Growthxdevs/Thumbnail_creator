# Remove Background Edge Function

This Supabase Edge Function uses Rembg WASM (`@imgly/background-removal`) to remove backgrounds from images.

## Features

- ✅ **Runs 24/7 for FREE** on Supabase Edge Functions
- ✅ **WASM-based** - Fast and efficient
- ✅ **No external APIs required** - Self-contained
- ✅ **500,000 invocations/month** on free tier
- ✅ **No cold starts** - Always warm

## Usage

### Request Format

```json
POST /functions/v1/remove-background
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY

{
  "image": "data:image/png;base64,..." // or just base64 string
}
```

### Response Format

```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "message": "Background removed successfully using Rembg WASM"
}
```

## Local Testing

```bash
# Serve function locally
supabase functions serve remove-background

# Test with curl
curl -X POST \
  'http://localhost:54321/functions/v1/remove-background' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"image": "BASE64_IMAGE"}'
```

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy remove-background

# Or deploy specific project
supabase functions deploy remove-background --project-ref xxxxx
```

## Environment Variables

The function uses Supabase's built-in environment variables:
- `SUPABASE_URL` - Automatically set by Supabase
- `SUPABASE_ANON_KEY` - Automatically set by Supabase

No additional configuration needed!

## Performance

- **Speed:** 2-5 seconds per image (depends on size)
- **Quality:** Excellent (same as Rembg Python)
- **Memory:** Optimized for edge runtime
- **Timeout:** 60 seconds (configurable)

## Dependencies

- `@imgly/background-removal@1.3.6` - WASM-based background removal
- Deno standard library for HTTP server

## Notes

- Handles large images with chunked base64 encoding
- CORS enabled for cross-origin requests
- Error handling with detailed messages

