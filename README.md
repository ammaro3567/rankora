# 🚀 Rankora - AI-Powered Content Analysis Platform

![GitHub stars](https://img.shields.io/github/stars/yourusername/rankora?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/rankora?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/rankora)
![GitHub license](https://img.shields.io/github/license/yourusername/rankora)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

> **🌟 Transform your content strategy with AI-powered analysis and optimization for Google's AI Overviews**

Rankora is a powerful AI-driven platform that helps content creators optimize their content for better search engine rankings and user engagement.

## 🚀 Features

- **AI-Powered Analysis**: Advanced content analysis using cutting-edge AI technology
- **Competitor Comparison**: Compare your content against competitors
- **Project Management**: Organize your content optimization projects
- **Real-time Scoring**: Get instant feedback on your content quality
- **Export Reports**: Download detailed PDF reports
- **Multiple Plans**: Flexible pricing plans for different needs

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: PayPal integration
- **Deployment**: Netlify
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rankora.git
   cd rankora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   - `VITE_PAYPAL_CLIENT_ID`: Your PayPal Client ID  
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   
   > ⚠️ **Important**: Never commit your `.env` file to version control!

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Configure environment variables in Netlify**
   - Go to Site settings > Environment variables
   - Add all variables from your `.env` file

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist folder to your hosting provider
```

## 🔧 Configuration

### PayPal Setup

1. Create a PayPal Developer account
2. Create a new application
3. Copy the Client ID to your environment variables
4. Configure webhooks for subscription management

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication (email/password + OAuth)
3. Configure email templates for verification
4. Set up database tables and policies
5. Add your project URL and keys to environment variables

## 📱 Features Overview

### Authentication
- Email/password registration and login
- Google OAuth integration
- Email verification required
- Secure session management

### Content Analysis
- AI-powered content scoring
- SEO recommendations
- Readability analysis
- Keyword optimization suggestions

### User Management
- Role-based access control (Starter, Pro, Business)
- Admin panel for user management
- Usage tracking and limits
- Subscription management

### Payment Integration
- PayPal subscription management
- Multiple pricing tiers
- Secure payment processing
- Automatic plan upgrades/downgrades

## 🔒 Security

- HTTPS enforced
- Content Security Policy headers
- XSS protection
- CSRF protection via Supabase
- Environment variable protection
- Secure authentication flows

## 📊 Performance

- Lazy loading for components
- Image optimization
- Code splitting
- Caching strategies
- CDN delivery via Netlify

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/your-username/rankora/issues)
3. Create a [new issue](https://github.com/your-username/rankora/issues/new)
4. Contact support at support@rankora.com

## 🎯 Roadmap

- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API access for developers
- [ ] Integrations with popular CMS platforms
- [ ] Multi-language support

---

Made with ❤️ by the Rankora team