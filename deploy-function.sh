#!/bin/bash
# Deploy Supabase Edge Function using npx (no installation needed)

echo "Step 1: Login to Supabase..."
npx supabase login

echo ""
echo "Step 2: Linking project..."
npx supabase link --project-ref brmfnvfilbhdwxobznar

echo ""
echo "Step 3: Deploying function..."
npx supabase functions deploy remove-background

echo ""
echo "✅ Deployment complete!"
echo "Your function should now be available at:"
echo "https://brmfnvfilbhdwxobznar.supabase.co/functions/v1/remove-background"

