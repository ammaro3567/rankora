# 🚀 Deployment Guide for Rankora

This guide will help you deploy Rankora to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] Project builds successfully (`npm run build`)
- [ ] All tests pass (`npm run lint`)
- [ ] Environment variables configured
- [ ] Webhook URLs updated in production
- [ ] Domain name configured (if applicable)

## 🌐 Deployment Options

### 1. 🟢 Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Perfect for React apps

**Steps:**
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/rankora.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect React and deploy

3. **Configure Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add your webhook URLs:
     ```
     VITE_ANALYSIS_WEBHOOK=your-webhook-url
     VITE_USER_ARTICLE_WEBHOOK=your-user-webhook-url
     VITE_COMPETITOR_ARTICLE_WEBHOOK=your-competitor-webhook-url
     ```

4. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain

### 2. 🟠 Netlify

**Steps:**
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Drag & Drop Deployment:**
   - Visit [netlify.com/drop](https://netlify.com/drop)
   - Drag the `dist` folder to deploy

3. **GitHub Integration (Recommended):**
   - Push code to GitHub
   - Connect repository on Netlify
   - Auto-deploy on every push

4. **Configure Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### 3. 📘 GitHub Pages

**Steps:**
1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/rankora"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages

### 4. 🔵 Azure Static Web Apps

**Steps:**
1. **Create Azure account**
2. **Create Static Web App resource**
3. **Connect GitHub repository**
4. **Configure build settings:**
   - App location: `/`
   - Build location: `dist`
   - Build command: `npm run build`

### 5. 🟡 Firebase Hosting

**Steps:**
1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Environment Configuration

### Production Environment Variables

Create these environment variables on your hosting platform:

```env
# Required
VITE_ANALYSIS_WEBHOOK=https://your-n8n-instance/webhook/your-analysis-id
VITE_USER_ARTICLE_WEBHOOK=https://your-n8n-instance/webhook/your-user-id  
VITE_COMPETITOR_ARTICLE_WEBHOOK=https://your-n8n-instance/webhook/your-competitor-id

# Optional
VITE_APP_NAME=Rankora
VITE_APP_URL=https://your-domain.com
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Platform-Specific Instructions

**Vercel:**
- Project Settings → Environment Variables

**Netlify:**
- Site Settings → Environment Variables

**GitHub Pages:**
- Repository Settings → Secrets and Variables → Actions

## 🔍 Post-Deployment Verification

After deployment, verify these features work:

- [ ] **Home page loads correctly**
- [ ] **Dark/Light mode toggle works**
- [ ] **AI Analysis form submits successfully**
- [ ] **Competitor comparison works**
- [ ] **Dashboard accessible after login**
- [ ] **All animations render smoothly**
- [ ] **Responsive design on mobile**
- [ ] **Webhook integrations functional**

## 🐛 Common Issues & Solutions

### Build Failures

**Issue:** `npm run build` fails
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routing Issues (404 on refresh)

**Issue:** Page refreshes show 404
**Solution:** Configure redirects (already done in `netlify.toml` and `vercel.json`)

### Environment Variables Not Working

**Issue:** Webhooks not responding
**Solution:**
- Ensure variables start with `VITE_`
- Restart deployment after adding variables
- Check variable names match exactly

### Performance Issues

**Issue:** Slow loading
**Solution:**
- Enable gzip compression on server
- Use CDN (Vercel/Netlify provide this)
- Optimize images if added

## 📊 Performance Optimization

### Lighthouse Scores Target
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 90+
- **SEO:** 90+

### Optimization Tips
- Images are optimized (WebP format recommended)
- CSS/JS minified (done by Vite)
- Gzip compression enabled
- CDN configured
- Caching headers set

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Security headers configured
- [ ] API keys not exposed in frontend
- [ ] CORS properly configured
- [ ] Content Security Policy set

## 📈 Analytics Setup (Optional)

### Google Analytics 4
1. Create GA4 property
2. Add tracking ID to environment variables
3. Implement tracking code

### Other Analytics Options
- Mixpanel
- Hotjar
- PostHog
- Plausible

---

## 🆘 Need Help?

- **Documentation Issues:** Check this README
- **Build Problems:** Review build logs
- **Runtime Errors:** Check browser console
- **Performance:** Run Lighthouse audit

**Support Channels:**
- GitHub Issues
- Email: support@rankora.com
- Discord: [Your Discord Server]

---

**Happy Deploying! 🚀**