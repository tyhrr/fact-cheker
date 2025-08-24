# Croatian Labor Law Fact Checker

![Croatian Labor Law](https://img.shields.io/badge/Law-Croatian%20Labor-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)
![Security](https://img.shields.io/badge/security-Hardened-red)

## 🚀 **LIVE DEMO**
**[Croatian Labor Law Fact Checker - Live on GitHub Pages](https://tyhrr.github.io/fact-cheker/)**

---

A comprehensive web application for searching and verifying Croatian labor laws and workers' rights. Built with vanilla HTML, CSS, and JavaScript for optimal performance and accessibility.

## 🌟 Features

### Core Functionality
- **Multilingual Support**: Available in English, Spanish, and Croatian
- **Advanced Search**: Fuzzy matching, keyword highlighting, and relevance scoring
- **Comprehensive Database**: Complete Croatian labor law articles with translations
- **Real-time Suggestions**: Intelligent search suggestions as you type
- **Advanced Filtering**: Filter by section, article type, and other criteria

### User Experience
- **Neumorphic Design**: Modern, accessible black and white theme
- **Dark/Light Mode**: Automatic and manual theme switching
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Navigation**: Full keyboard accessibility support
- **Search History**: Track and revisit previous searches
- **Bookmarking**: Save important articles for later reference
- **User Feedback System**: Built-in feedback and bug reporting system
- **Legal Pages**: Comprehensive privacy policy, terms of use, and disclaimer

### Technical Features
- **Progressive Web App**: Offline functionality and app-like experience
- **Performance Optimized**: Fast loading and efficient search algorithms
- **SEO Friendly**: Proper metadata and semantic HTML structure
- **Accessibility Compliant**: WCAG 2.1 AA standards
- **Security Hardened**: XSS protection, CSP headers, input sanitization
- **GDPR Compliant**: Privacy controls and data protection
- **No Dependencies**: Pure vanilla JavaScript, no external libraries

## 🚀 Live Demo

Visit the live application: [Croatian Labor Law Fact Checker](https://your-username.github.io/fact-checker-2.1)

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🛠️ Installation

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Web server (for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fact-checker-2.1.git
   cd fact-checker-2.1
   ```

2. **Start a local web server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### GitHub Pages Deployment

1. **Fork the repository** on GitHub
2. **Enable GitHub Pages** in repository settings
3. **Select source** as "GitHub Actions"
4. **Push changes** to trigger automatic deployment

The GitHub Actions workflow will automatically:
- Validate HTML, CSS, and JavaScript
- Run accessibility tests
- Optimize assets (minification)
- Deploy to GitHub Pages
- Perform post-deployment verification

## 📖 Usage

### Basic Search
1. Enter your question in the search box
2. Use natural language (e.g., "How many vacation days?")
3. Browse results with original Croatian text and translations
4. Click language tabs to switch between Croatian and translations

### Advanced Search
1. Click "Advanced Search Options"
2. Filter by law section (General, Contracts, Working Time, etc.)
3. Filter by article type (Rights, Obligations, Procedures, Penalties)
4. Combine filters for precise results

### Keyboard Shortcuts
- **/** - Focus search input
- **Ctrl+T** - Toggle dark/light theme
- **Escape** - Close modals or suggestions
- **Tab** - Navigate through interface elements

### Language Switching
- Use the language selector in the header
- Supports English (EN), Spanish (ES), and Croatian (HR)
- All content and interface elements are translated

## 🏗️ Architecture

### File Structure
```
fact-checker-2.1/
├── index.html              # Main application
├── privacy-policy.html     # Privacy policy page
├── terms-of-use.html       # Terms of use page
├── disclaimer.html         # Legal disclaimer page
├── css/
│   ├── neumorphism.css     # Neumorphic design system
│   └── style.css           # Main stylesheet with legal page styles
├── js/
│   ├── i18n.js            # Internationalization
│   ├── database.js        # Legal database
│   ├── search.js          # Search engine
│   ├── feedback.js        # User feedback system
│   ├── security.js        # XSS protection utilities
│   ├── gdpr.js           # GDPR compliance module
│   ├── tests.js          # Security tests
│   └── main.js           # Application controller
├── data/
│   ├── croatian-labor-law.json  # Legal articles database
│   └── translations.json        # UI translations
├── assets/
│   └── icons/             # App icons and images
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment
├── _config.yml            # Jekyll configuration
├── robots.txt             # SEO directives
├── sitemap.xml            # Site structure
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── DEPLOYMENT.md          # Deployment instructions
├── FEEDBACK_SETUP.md      # Feedback system setup
├── SECURITY_FIXES.md      # Security audit results
└── README.md
```

### Component Overview

#### Core Modules
- **I18n**: Manages multilingual content and localization
- **Database**: Stores and indexes Croatian labor law articles
- **Search Engine**: Implements fuzzy search with relevance scoring
- **Feedback System**: User feedback and bug reporting functionality
- **Security Module**: XSS protection and input sanitization
- **GDPR Module**: Privacy compliance and cookie management
- **App Controller**: Coordinates all components and manages state

#### Key Technologies
- **Vanilla JavaScript**: No external dependencies
- **CSS Grid & Flexbox**: Modern, responsive layouts
- **CSS Custom Properties**: Theming and design consistency
- **Web APIs**: Local Storage, Intersection Observer, Service Worker
- **Progressive Enhancement**: Works without JavaScript

### Search Algorithm
The search engine implements:
1. **Tokenization**: Splits queries into meaningful terms
2. **Fuzzy Matching**: Levenshtein distance for typo tolerance
3. **Keyword Indexing**: Pre-built index for fast searching
4. **Relevance Scoring**: Weighted scoring based on match quality
5. **Result Highlighting**: Visual emphasis on matching terms

## 🔧 Development

### Code Standards
- **HTML**: Semantic HTML5, WCAG 2.1 AA compliance
- **CSS**: BEM methodology, mobile-first responsive design
- **JavaScript**: ES6+, functional programming patterns
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Testing
```bash
# Install development dependencies
npm install -g htmlhint stylelint eslint lighthouse-ci pa11y

# Validate HTML
htmlhint index.html

# Validate CSS
stylelint "css/**/*.css"

# Validate JavaScript
eslint "js/**/*.js"

# Test accessibility
pa11y http://localhost:8000

# Performance audit
lhci autorun
```

### Adding New Articles
1. Edit `data/croatian-labor-law.json`
2. Add article with Croatian, English, and Spanish translations
3. Include relevant keywords and tags
4. Update metadata (totalArticles, lastUpdated)

### Adding New Languages
1. Extend `js/i18n.js` translations object
2. Add language option to HTML select element
3. Update `data/translations.json` with new language strings
4. Add date/number formatting for the new locale

### Customizing Design
- Modify CSS custom properties in `:root` for global changes
- Update `css/neumorphism.css` for design system changes
- Edit `css/style.css` for layout and component styles

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add/update tests as needed
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines
- Follow accessibility best practices
- Maintain multilingual support
- Write clear, documented code
- Test across different browsers and devices
- Update README if adding new features

## 📝 Legal Disclaimer

This application provides information about Croatian labor laws for educational purposes only. The content should not be considered as legal advice. Always consult with qualified legal professionals for specific legal matters.

The legal information is based on Croatian labor law as of January 2024 and may not reflect recent changes. Users should verify current laws through official sources.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Croatian Government for providing public access to labor laws
- Open source community for inspiration and best practices
- Accessibility community for guidelines and testing tools
- Contributors who help improve this project

## 📞 Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-username/fact-checker-2.1/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/your-username/fact-checker-2.1/discussions)
- **Email**: contact@example.com for general inquiries

## 🔄 Changelog

### Version 2.1.0 (January 2024)
- ✨ Initial release
- 🌐 Multilingual support (EN/ES/HR)
- 🔍 Advanced search functionality
- 🎨 Neumorphic design system
- ♿ WCAG 2.1 AA accessibility compliance
- 📱 Progressive Web App features
- ⚡ Performance optimizations
- 🚀 GitHub Actions deployment

---

**Built with ❤️ for Croatian workers and employers**
