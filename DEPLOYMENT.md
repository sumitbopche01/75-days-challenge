# Production Deployment Checklist for 75days.harinext.com

## 🚀 Pre-Deployment Steps

### 1. Environment Variables Setup

⚠️ **Critical**: Ensure all environment variables are properly configured in
your hosting platform (Vercel/Netlify/etc.):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://75days.harinext.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth Credentials
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Supabase Configuration
# ✅ Updated to use correct project URL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-hereYELhwT9RRlhUEyQEME3eIFgJDU
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

### 2. Configuration Validation

✅ **New Feature**: The app now validates all environment variables on startup
and will show clear error messages if any are missing.

### 3. Google Cloud Console Setup

1. Go to
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   `https://75days.harinext.com/api/auth/callback/google`
4. Save changes

### 4. Database Setup (Supabase)

✅ **Configuration Updated**:

- Database schema is ready in `database/schema.sql`
- RLS policies removed (using service key authentication)
- API keys are production-ready
- Project URL corrected to: `https://wqzlhfmjhpfxkabgnqwi.supabase.co`

### 5. Build & Deploy Commands

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

### Core Functionality Tests:

- [ ] App loads at https://75days.harinext.com
- [ ] Environment variables are properly loaded (check console for validation
      messages)
- [ ] Manual name entry works and saves to database
- [ ] Google OAuth sign-in works
- [ ] Task creation/completion works and syncs to database
- [ ] Data persists between sessions (stored in Supabase)
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] Mobile responsive design

### Database Integration Tests:

- [ ] `GET /api/users/profile` - User profile retrieval
- [ ] `POST /api/users/profile` - User creation
- [ ] `GET /api/challenges` - Challenge data retrieval
- [ ] `POST /api/challenges` - Challenge creation
- [ ] `GET /api/tasks/custom` - Custom tasks retrieval
- [ ] `POST /api/tasks/custom` - Task creation
- [ ] Task completion tracking in database

### Configuration Tests:

- [ ] All environment variables are loaded correctly
- [ ] Supabase connection works (check network tab)
- [ ] Google OAuth redirect URIs are correct
- [ ] Error messages are user-friendly (not raw API errors)

## 🛠 Troubleshooting

### Common Issues:

1. **Environment Variable Validation Errors**
   - Check all required variables are set in your deployment platform
   - Verify no typos in variable names
   - Ensure `NEXTAUTH_URL` matches your domain exactly

2. **Supabase Connection Issues**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Check that service role key has proper permissions
   - Ensure database schema is properly deployed

3. **Google OAuth Not Working**
   - Check redirect URI in Google Console matches exactly
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Ensure OAuth consent screen is properly configured

4. **Database Sync Issues**
   - Check network tab for failed API calls
   - Verify user authentication is working
   - Check Supabase logs for database errors

5. **PWA Not Installing**
   - Verify HTTPS is enabled
   - Check manifest.json is accessible
   - Ensure service worker is registered

## 🔐 Security Checklist

- ✅ Environment variables are not exposed in client-side code
- ✅ Service role key is only used in server-side API routes
- ✅ Secure cookies enabled in production
- ✅ HTTPS enforcement
- ✅ JWT token encryption
- ✅ API route protection with authentication
- ✅ Input validation on all API endpoints

## 📱 PWA Features Enabled

- ✅ Offline support
- ✅ App install prompt
- ✅ Background sync
- ✅ Push notifications ready
- ✅ Responsive design
- ✅ App shortcuts

## 🚀 Performance Optimizations

- ✅ Environment variable validation reduces startup errors
- ✅ Supabase as primary storage (faster than localStorage fallbacks)
- ✅ Proper error handling prevents UI freezing
- ✅ Optimized API calls with proper caching

## 📊 Monitoring

After deployment, monitor:

- Application startup logs for configuration errors
- API response times and error rates
- Database query performance
- User authentication success rates
- PWA install rates and usage

---

**Good luck with your deployment! 🚀**
