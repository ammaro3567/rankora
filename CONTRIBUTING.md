# 🤝 Contributing to Rankora

Thank you for your interest in contributing to Rankora! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)

## 🌟 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on** what's best for the community

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- Code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/rankora.git
   cd rankora
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/rankora.git
   ```

## 🛠️ Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

## 🔄 Making Changes

### Branch Naming Convention

Create a new branch for your feature or fix:

```bash
# Feature branches
git checkout -b feature/your-feature-name

# Bug fix branches  
git checkout -b fix/bug-description

# Documentation updates
git checkout -b docs/update-readme
```

### Commit Message Format

Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(analyzer): add new scoring algorithm
fix(dashboard): resolve login redirect issue
docs(readme): update deployment instructions
style(components): format code with prettier
```

## 📤 Submitting Changes

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting:**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

3. **Test your changes thoroughly**

### Pull Request Process

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Testing instructions

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement

   ## Testing
   - [ ] Tested locally
   - [ ] All tests pass
   - [ ] No linting errors

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Related Issues
   Closes #123
   ```

## 🎨 Style Guidelines

### TypeScript/React

- Use **TypeScript** for all new code
- Follow **React best practices**
- Use **functional components** with hooks
- Prefer **explicit types** over `any`

### Code Style

```typescript
// ✅ Good
interface AnalysisResult {
  readability: number;
  factuality: number;
  structure: number;
}

const analyzeContent = async (url: string): Promise<AnalysisResult> => {
  // Implementation
};

// ❌ Avoid
const analyzeContent = async (url: any) => {
  // Implementation
};
```

### CSS/Styling

- Use **Tailwind CSS** classes
- Follow **mobile-first** approach
- Use **CSS variables** for theming
- Keep animations **smooth and accessible**

```tsx
// ✅ Good
<div className="bg-card-background border border-border-color rounded-xl p-6 hover:shadow-lg transition-all duration-300">

// ❌ Avoid
<div style={{backgroundColor: '#fff', padding: '24px'}}>
```

### Component Structure

```tsx
// Component file structure
import React from 'react';
import { Icon } from 'lucide-react';

// Types/Interfaces
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Component
const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className="component-container">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

## 🧪 Testing

### Manual Testing

Before submitting, test:

- [ ] **All pages load correctly**
- [ ] **Dark/Light mode works**
- [ ] **Responsive design on mobile**
- [ ] **Form submissions work**
- [ ] **Animations are smooth**
- [ ] **No console errors**

### Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🐛 Reporting Issues

When reporting bugs, include:

1. **Clear description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** if applicable
6. **Browser/OS information**
7. **Console errors** if any

### Issue Template

```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

For new features, provide:

1. **Clear use case** and problem it solves
2. **Detailed description** of proposed solution
3. **Mockups or wireframes** if applicable
4. **Alternative solutions** considered

## 📚 Documentation

When contributing documentation:

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Update table of contents
- Check for typos and grammar

## 🏷️ Release Process

Releases follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🙋 Getting Help

Need help? Reach out via:

- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and ideas
- **Discord** (if available) for real-time chat

## 🎉 Recognition

Contributors are recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** for major features

---

**Thank you for contributing to Rankora! 🚀**

Your contributions help make content analysis better for everyone.