# Contributing to Rankora

Thank you for your interest in contributing to Rankora! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/rankora.git
   cd rankora
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Fill in your actual values
   ```

## 📋 Development Guidelines

### Code Style
- We use TypeScript for type safety
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
Use clear and descriptive commit messages:
- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update README`
- `refactor: improve code structure`
- `test: add unit tests`

### Branch Naming
- `feature/feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for documentation
- `refactor/component-name` for refactoring

## 🔄 Pull Request Process

1. **Create a new branch** for your feature/fix
2. **Make your changes** following the guidelines above
3. **Test your changes** thoroughly
4. **Update documentation** if necessary
5. **Submit a pull request** with a clear description

### PR Requirements
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No sensitive information exposed

## 🐛 Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/OS information
- Error messages from console

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Environment Variables Required
- `VITE_PAYPAL_CLIENT_ID` - PayPal Client ID
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 📖 Project Structure

```
src/
├── components/         # React components
├── lib/               # Utility libraries
├── utils/             # Helper functions
├── config/            # Configuration files
└── index.css          # Global styles
```

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Performance optimizations
- [ ] Accessibility enhancements
- [ ] Test coverage

### Medium Priority
- [ ] New analysis features
- [ ] UI/UX improvements
- [ ] Documentation improvements
- [ ] Bug fixes

### Low Priority
- [ ] Code refactoring
- [ ] Developer experience improvements

## 💡 Feature Requests

Before implementing a new feature:
1. **Check existing issues** to avoid duplicates
2. **Create an issue** to discuss the feature
3. **Wait for approval** from maintainers
4. **Implement and submit PR**

## 🚫 What Not to Contribute

Please avoid:
- Breaking changes without discussion
- Features that don't align with project goals
- Code that violates our style guidelines
- Commits with sensitive information

## 📞 Getting Help

If you need help:
- Check existing [documentation](README.md)
- Search [existing issues](https://github.com/yourusername/rankora/issues)
- Create a new issue with the `question` label
- Join our community discussions

## 📜 Code of Conduct

Be respectful and professional in all interactions. We're building an inclusive community where everyone can contribute.

## 🏆 Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Rankora! 🚀
