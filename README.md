# 🚀 Rankora - AI-Powered Content Analysis Tool

**Rankora** is a modern, AI-powered SaaS platform that analyzes content for Google's AI Overviews optimization. Built with React, TypeScript, and Tailwind CSS, it provides comprehensive scoring and insights to help content creators dominate search results.

## ✨ Features

### 🎯 **AI Overview Analysis**
- **Instant Analysis**: Analyze any article URL for AI Overview readiness
- **Comprehensive Scoring**: 6 key metrics scored 0-100:
  - 📖 **Readability Score** - Content clarity and accessibility
  - ✅ **Factuality Score** - Accuracy and credibility assessment  
  - 🏗️ **Structure Score** - Content organization and hierarchy
  - ❓ **Q&A Format Score** - Question-answer optimization
  - 🗃️ **Structured Data Score** - Schema markup assessment
  - 🛡️ **Authority Score** - Domain and content authority

### 🔍 **Competitor Comparison**
- **Side-by-Side Analysis**: Compare your content with competitors
- **AI-Powered Suggestions**: Get actionable recommendations to outrank competitors
- **Real-time Scoring**: Instant comparison across all metrics

### 📊 **User Dashboard**
- **Usage Tracking**: Monitor your analysis quota (2 free analyses/month)
- **Performance Analytics**: View average scores and trends
- **Account Management**: Track plan details and upgrade options
- **Recent Activity**: Quick access to past analyses

### 🎨 **Modern UI/UX**
- **Animated Background**: Beautiful cosmic animations with stars and floating elements
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Perfect experience on all devices
- **Smooth Animations**: Eye-friendly animations throughout

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Backend Integration**: n8n webhooks for AI analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd rankora
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Connect to Vercel:**
- Visit [vercel.com](https://vercel.com)
- Import your GitHub repository
- Deploy automatically

### Deploy to Netlify

1. **Build the project:**
```bash
npm run build
```

2. **Deploy dist folder:**
- Drag and drop the `dist` folder to [netlify.com/drop](https://netlify.com/drop)
- Or connect your GitHub repository

### Deploy to GitHub Pages

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json:**
```json
{
  "homepage": "https://yourusername.github.io/rankora",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy:**
```bash
npm run deploy
```

## ⚙️ Configuration

### Webhook URLs
Update webhook URLs in `src/config/webhooks.ts`:

```typescript
export const WEBHOOKS = {
  N8N_ANALYSIS_WEBHOOK: 'your-analysis-webhook-url',
  USER_ARTICLE_WEBHOOK: 'your-user-webhook-url',
  COMPETITOR_ARTICLE_WEBHOOK: 'your-competitor-webhook-url'
};
```

### Environment Variables (Optional)
Create `.env` file for sensitive configuration:

```env
VITE_ANALYSIS_WEBHOOK=your-webhook-url
VITE_API_BASE_URL=your-api-base-url
```

## 📱 Pages & Features

### 🏠 **Home Page**
- Hero section with animated background
- Feature highlights
- Call-to-action buttons
- Trust indicators and statistics

### 🔍 **AI Overview Analyzer**
- URL input for article analysis
- Real-time scoring display
- Detailed suggestions
- Export functionality

### ⚔️ **Competitor Comparison**
- Dual URL input (yours vs competitor)
- Side-by-side score comparison
- AI-powered improvement recommendations

### 💰 **Pricing**
- Free Plan: 2 analyses/month
- Pro Plan: Unlimited analyses
- Enterprise: Custom solutions

### 🏠 **Dashboard** (Logged-in Users)
- Usage statistics
- Recent analyses
- Account information
- Quick actions

## 🎨 Design System

### Color Palette
- **Primary CTA**: `#22C55E` (Vibrant Green)
- **Dark Navy**: `#0F172A` (Primary Background)
- **Light Gray**: `#94A3B8` (Secondary Text)
- **Accent Colors**: Blues, Purples, Emeralds for scoring

### Animations
- **Cosmic Theme**: Stars, shooting stars, floating orbs
- **Smooth Transitions**: 300ms duration for interactions
- **Glow Effects**: Subtle pulsing and highlighting
- **Responsive Animations**: Optimized for performance

## 🔧 Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to GitHub Pages (if configured)
```

## 📋 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open GitHub issues for bugs or feature requests
- **Contact**: [Your contact information]

## 🎯 Roadmap

- [ ] User authentication system
- [ ] Advanced analytics dashboard
- [ ] API integrations
- [ ] Mobile app
- [ ] Team collaboration features

---

**Made with ❤️ by [Your Name]**

*Empower your content with AI-driven insights and dominate Google's AI Overviews!*