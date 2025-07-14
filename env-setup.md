# Environment Setup Instructions

To fix the authentication errors and database connectivity, you need to create a
`.env.local` file in the project root with the following variables:

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

# Supabase Configuration
# Use the correct Supabase project URL and keys
NEXT_PUBLIC_SUPABASE_URL=https://wqzlhfmjhpfxkabgnqwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDU1NjksImV4cCI6MjA1MDQ4MTU2OX0.VKzELrOGEiHCUjYQ7YELhwT9RRlhUEyQEME3eIFgJDU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkwNTU2OSwiZXhwIjoyMDUwNDgxNTY5fQ.yYQdLdZFOGDkT2ztGNWNpEhPqxHQgm6JzjBW3sSNpPw
```

## Important Notes

⚠️ **Security Warning**: Never commit `.env.local` to version control. It's
already in `.gitignore`.

✅ **Configuration Check**: The app will now validate that all required
environment variables are present and throw clear errors if they're missing.

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

## Supabase Configuration

The app uses the following Supabase configuration:

- **Project URL**: `https://wqzlhfmjhpfxkabgnqwi.supabase.co`
- **Public/Anonymous Key**: For client-side operations
- **Service Role Key**: For server-side API operations (has full access)

## Steps to Fix

1. Create the `.env.local` file with the content above
2. Replace `your-google-client-id-here` and `your-google-client-secret-here`
   with your actual Google OAuth credentials
3. Restart the development server: `npm run dev`
4. The app will now validate configuration on startup and show clear error
   messages if anything is missing

## Testing Configuration

After setting up the environment variables, you can test the configuration by:

1. Starting the development server
2. Checking the console for any configuration errors
3. Testing Google OAuth login
4. Verifying that tasks can be created and saved to the database

## Production Deployment

For production, set the same environment variables in your deployment platform
(Vercel, Netlify, etc.) and update:

- `NEXTAUTH_URL` to your production domain
- Add your production domain to Google OAuth redirect URIs
