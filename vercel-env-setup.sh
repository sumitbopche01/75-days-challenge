#!/bin/bash
# Vercel Environment Variables Setup Script
# Run this after installing Vercel CLI: npm i -g vercel

echo "Setting up environment variables for Vercel deployment..."

# NextAuth Configuration
vercel env add NEXTAUTH_URL production
# Enter: https://75days.harinext.com

vercel env add NEXTAUTH_SECRET production
# Enter: 4451d634a9ad7c61746b0478f616feab1af960469685fb341e568826998d4605

# Google OAuth (you'll need to enter your actual credentials)
vercel env add GOOGLE_CLIENT_ID production
# Enter your Google Client ID

vercel env add GOOGLE_CLIENT_SECRET production
# Enter your Google Client Secret

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://wqzlhfmjhpfxkabgnqwi.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDU1NjksImV4cCI6MjA1MDQ4MTU2OX0.VKzELrOGEiHCUjYQ7YELhwT9RRlhUEyQEME3eIFgJDU

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkwNTU2OSwiZXhwIjoyMDUwNDgxNTY5fQ.yYQdLdZFOGDkT2ztGNWNpEhPqxHQgm6JzjBW3sSNpPw

echo "Environment variables setup complete!"
echo "Don't forget to:"
echo "1. Get your Google OAuth credentials from Google Cloud Console"
echo "2. Add the production redirect URI: https://75days.harinext.com/api/auth/callback/google"
echo "3. Deploy your app: vercel --prod" 