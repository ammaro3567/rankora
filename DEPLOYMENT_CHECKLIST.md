# 🚀 Deployment Checklist for Rankora

## ✅ Pre-Deployment Checklist

### Environment Variables
- [ ] `VITE_PAYPAL_CLIENT_ID` is set correctly in Netlify
- [ ] `VITE_SUPABASE_URL` is set correctly in Netlify
- [ ] `VITE_SUPABASE_ANON_KEY` is set correctly in Netlify
- [ ] All environment variables are properly prefixed with `VITE_`

### PayPal Configuration
- [ ] PayPal Client ID is from the correct environment (sandbox/production)
- [ ] PayPal hosted button IDs are active and configured
- [ ] PayPal webhooks are set up for subscription management
- [ ] PayPal domain settings include your Netlify domain

### Supabase Configuration
- [ ] Email authentication is enabled
- [ ] Google OAuth is configured (if using)
- [ ] Email verification is required
- [ ] RLS (Row Level Security) policies are properly set
- [ ] Database tables have correct permissions
- [ ] Email templates are configured

### Build Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18 or higher
- [ ] No build errors or warnings

### Security & Performance
- [ ] All routes redirect to index.html (SPA routing)
- [ ] Security headers are configured in netlify.toml
- [ ] HTTPS is enforced
- [ ] Content Security Policy allows PayPal domains
- [ ] Caching headers are set for static assets

## 🔧 Deployment Steps

### 1. Connect Repository to Netlify
1. Log in to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 2. Configure Environment Variables
1. Go to Site settings > Environment variables
2. Add all required environment variables:
   ```
   VITE_PAYPAL_CLIENT_ID=your_actual_paypal_client_id
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

### 3. Configure Domain (Optional)
1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings
4. Enable HTTPS (automatic)

### 4. Test Deployment
1. Trigger a manual deploy
2. Check build logs for errors
3. Test all major functionality:
   - [ ] User registration with email verification
   - [ ] Login/logout
   - [ ] PayPal payment flow
   - [ ] Admin panel (if applicable)
   - [ ] Content analysis features

## 🐛 Common Issues & Solutions

### Build Fails
- **Issue**: `npm install` fails
  - **Solution**: Clear npm cache, update package-lock.json
- **Issue**: TypeScript errors
  - **Solution**: Run `npm run type-check` locally and fix errors
- **Issue**: Linting errors
  - **Solution**: Run `npm run lint:fix` locally

### Environment Variables
- **Issue**: Variables not accessible in production
  - **Solution**: Ensure all variables start with `VITE_`
- **Issue**: PayPal buttons not loading
  - **Solution**: Check PayPal Client ID and domain configuration

### Routing Issues
- **Issue**: 404 on page refresh
  - **Solution**: Ensure `_redirects` file is in place and configured correctly
- **Issue**: Admin routes accessible to non-admin users
  - **Solution**: Check RLS policies in Supabase

### PayPal Integration
- **Issue**: Payment buttons not working
  - **Solution**: Verify Client ID, check browser console for errors
- **Issue**: Webhooks not triggering
  - **Solution**: Configure webhook URL in PayPal dashboard

### Email Verification
- **Issue**: Verification emails not sending
  - **Solution**: Check Supabase auth settings and email templates
- **Issue**: Users can access dashboard without verification
  - **Solution**: Check email confirmation logic in App.tsx

## 📊 Post-Deployment Monitoring

### Performance Checks
- [ ] Lighthouse score > 90 for Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

### Functionality Tests
- [ ] User registration flow works end-to-end
- [ ] Email verification redirects properly
- [ ] PayPal payments process successfully
- [ ] Admin panel is accessible to authorized users only
- [ ] Content analysis features work correctly

### Security Verification
- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] No sensitive data exposed in client
- [ ] CSP headers prevent XSS attacks

## 🔄 Continuous Deployment

### Automatic Deployments
- [ ] Push to main branch triggers deployment
- [ ] Deploy previews work for pull requests
- [ ] Branch deploys work for feature branches

### Monitoring
- [ ] Set up Netlify deployment notifications
- [ ] Monitor build times and success rates
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

## 📞 Support Resources

- **Netlify Documentation**: https://docs.netlify.com/
- **Supabase Documentation**: https://supabase.com/docs
- **PayPal Developer Documentation**: https://developer.paypal.com/docs/
- **Vite Build Documentation**: https://vitejs.dev/guide/build.html

---

✅ **Once all items are checked, your Rankora application should be ready for production!**
