# Environment Setup Instructions

To fix the authentication errors, you need to create a `.env.local` file in the
project root with the following variables:

## Required Environment Variables

Create a file named `.env.local` in your project root and add these variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=4451d634a9ad7c61746b0478f616feab1af960469685fb341e568826998d4605

# Google OAuth Credentials
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Supabase Configuration (already provided)
NEXT_PUBLIC_SUPABASE_URL=https://wqzlhfmjhpfxkabgnqwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDU1NjksImV4cCI6MjA1MDQ4MTU2OX0.VKzELrOGEiHCUjYQ7YELhwT9RRlhUEyQEME3eIFgJDU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkwNTU2OSwiZXhwIjoyMDUwNDgxNTY5fQ.yYQdLdZFOGDkT2ztGNWNpEhPqxHQgm6JzjBW3sSNpPw
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret

## Steps to Fix

1. Create the `.env.local` file with the content above
2. Replace `your-google-client-id-here` and `your-google-client-secret-here`
   with your actual Google OAuth credentials
3. Restart the development server: `npm run dev`

The app will work without Google OAuth (using manual name entry), but you'll
need the credentials for the Google sign-in feature to work.
