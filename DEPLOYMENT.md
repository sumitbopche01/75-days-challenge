# Production Deployment Checklist for 75days.harinext.com

## 🚀 Pre-Deployment Steps

### 1. Environment Variables Setup

Set these in your hosting platform (Vercel/Netlify/etc.):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://75days.harinext.com
NEXTAUTH_SECRET=4451d634a9ad7c61746b0478f616feab1af960469685fb341e568826998d4605

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wqzlhfmjhpfxkabgnqwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDU1NjksImV4cCI6MjA1MDQ4MTU2OX0.VKzELrOGEiHCUjYQ7YELhwT9RRlhUEyQEME3eIFgJDU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxemxoZm1qaHBmeGthYmducXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDkwNTU2OSwiZXhwIjoyMDUwNDgxNTY5fQ.yYQdLdZFOGDkT2ztGNWNpEhPqxHQgm6JzjBW3sSNpPw
```

### 2. Google Cloud Console Setup

1. Go to
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   `https://75days.harinext.com/api/auth/callback/google`
4. Save changes

### 3. Database Setup (Supabase)

✅ Already configured - no changes needed

- Database schema is ready
- RLS policies removed (using service key authentication)
- API keys are production-ready

### 4. Build & Deploy Commands

For **Vercel**:

```bash
npm run build
# Vercel will handle deployment automatically
```

For **Netlify**:

```bash
npm run build
npm run export  # If using static export
```

For **Custom Server**:

```bash
npm run build
npm start
```

## 🔍 Post-Deployment Testing

### Test These Features:

- [ ] App loads at https://75days.harinext.com
- [ ] Manual name entry works
- [ ] Google OAuth sign-in works
- [ ] Task creation/completion works
- [ ] Data persists between sessions
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] Mobile responsive design

### API Endpoints to Test:

- [ ] `GET /api/users/profile` - User profile retrieval
- [ ] `POST /api/users/profile` - User creation
- [ ] `GET /api/challenges` - Challenge data
- [ ] `GET /api/tasks/custom` - Custom tasks
- [ ] `POST /api/tasks/custom` - Task creation

## 🛠 Troubleshooting

### Common Issues:

1. **NextAuth JWT Error**
   - Ensure `NEXTAUTH_SECRET` is set
   - Verify `NEXTAUTH_URL` matches your domain

2. **Google OAuth Not Working**
   - Check redirect URI in Google Console
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

3. **API 401 Errors**
   - Ensure all environment variables are set
   - Check Supabase keys are correct

4. **PWA Not Installing**
   - Verify HTTPS is enabled
   - Check manifest.json is accessible
   - Ensure service worker is registered

## 📱 PWA Features Enabled

- ✅ Offline support
- ✅ App install prompt
- ✅ Background sync
- ✅ Push notifications ready
- ✅ Responsive design
- ✅ App shortcuts

## 🔐 Security Features

- ✅ Secure cookies in production
- ✅ HTTPS enforcement
- ✅ JWT token encryption
- ✅ API route protection
- ✅ Environment variable protection
