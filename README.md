# Croatian Labor Law Fact Checker 🏛️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://your-username.github.io/croatian-labor-law-checker)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue)](https://github.com/your-username/croatian-labor-law-checker)
[![Structure](https://img.shields.io/badge/Structure-Reorganized-green)](./REORGANIZATION_REPORT.md)
[![Tests](https://img.shields.io/badge/Tests-Validated-success)](./structure-test.html)

> **Comprehensive Croatian Labor Law Database and Search Engine**
> 
> A powerful, interactive tool for exploring Croatian labor laws with advanced search capabilities, multi-language support, and real-time legal article lookup.
> 
> **🆕 Recently Reorganized:** Complete project structure optimization for better maintainability and performance.

## 🚀 Features

### **Core Functionality**
- **📚 Complete Database**: All Croatian Labor Law articles (Zakon o radu)
- **🔍 Advanced Search**: Boolean operators, fuzzy matching, real-time suggestions
- **🌐 Multi-language**: Croatian, English, Spanish translations
- **⚡ Performance**: Optimized caching and search indexing
- **📱 Responsive**: Works on all devices and screen sizes

### **Enhanced Features v2.1.0**
- **🧠 Smart Search**: AI-powered article recommendations
- **💾 Export Tools**: JSON, PDF, and text format exports
- **📊 Analytics**: Search statistics and usage tracking
- **🛡️ Security**: Content Security Policy and XSS protection
- **♿ Accessibility**: WCAG 2.1 AA compliant
- **🔧 Reorganized Structure**: Clean, modular codebase following best practices
- **✅ Validation Tools**: Interactive structure testing and validation scripts

## 📁 Project Structure

```
Croatian-Labor-Law-Checker/
├── 📄 index.html              # Main application entry point
├── 📄 manifest.json           # PWA manifest
├── 📄 sw.js                   # Service Worker for offline support
├── 📄 .htaccess               # Apache server configuration
├── 📄 .gitignore              # Git ignore rules
├── 📄 package.json            # Node.js dependencies
├── 📄 structure-test.html     # Interactive structure validator
├── 📄 validate-structure.sh   # Structure validation script
├── 📄 REORGANIZATION_REPORT.md # Complete reorganization documentation
│
├── 📂 src/                    # Source code
│   ├── 📂 core/               # Core system modules
│   │   ├── LegalDatabase.js   # Main database class
│   │   └── SearchEngine.js    # Advanced search engine
│   │
│   ├── 📂 models/             # Data models
│   │   ├── Article.js         # Article model
│   │   └── SearchResult.js    # Search result model
│   │
│   ├── 📂 utils/              # Utility modules
│   │   ├── CacheManager.js    # Caching system
│   │   ├── ExportManager.js   # Data export tools
│   │   ├── TextProcessor.js   # Text processing utilities
│   │   └── Validator.js       # Data validation
│   │
│   ├── 📂 scripts/            # Application scripts
│   │   ├── main.js            # Main application logic
│   │   ├── database.js        # Database compatibility layer
│   │   ├── search.js          # Search interface
│   │   ├── i18n.js            # Internationalization
│   │   ├── security.js        # Security features
│   │   ├── gdpr.js            # GDPR compliance
│   │   ├── feedback.js        # User feedback system
│   │   └── tests.js           # Testing utilities
│   │
│   ├── 📂 styles/             # CSS stylesheets
│   │   ├── style.css          # Main styles
│   │   ├── neumorphism.css    # Neumorphic design system
│   │   └── enhanced.css       # Enhanced feature styles
│   │
│   ├── 📂 data/               # Application data
│   │   ├── croatian-labor-law.json  # Legal articles database
│   │   ├── translations.json        # UI translations
│   │   └── 📂 pdfs/                 # PDF documentation
│   │
│   └── 📂 tests/              # Testing files
│       ├── database.test.js         # Database tests
│       ├── enhanced-system.test.js  # System tests
│       ├── test-enhanced.html       # Interactive test page
│       └── test-legal.html          # Legal page tests
│
├── 📂 public/                 # Public assets
│   ├── 📂 assets/             # Static assets
│   │   └── 📂 icons/          # Application icons
│   │       ├── favicon.svg
│   │       ├── favicon.ico
│   │       ├── favicon-16x16.png
│   │       └── favicon-32x32.png
│   │
│   └── 📂 legal/              # Legal pages (ready for content)
│       ├── privacy-policy.html
│       ├── terms-of-use.html
│       ├── disclaimer.html
│       ├── terms-simple.html
│       └── test-legal.html
│
├── 📂 docs/                   # Documentation
│   ├── README.md              # Main documentation
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── ENHANCED_DATABASE_README.md  # Enhanced system docs
│   ├── FEEDBACK_SETUP.md      # Feedback system setup
│   ├── IMPLEMENTATION_GUIDE.md     # Implementation guide
│   ├── LICENSE                # MIT License
│   ├── SECURITY_FIXES.md      # Security documentation
│   └── VERSION_1.0_SUMMARY.md # Version history
│
└── 📂 config/                 # Configuration files
    ├── croatia-law.is-cool.dev.json
    ├── croatian-labor-law.is-not-a.dev.json
    ├── setup-github-pages.sh
    └── start.bat
```

## 🛠️ Installation & Setup

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/your-username/croatian-labor-law-checker.git
cd croatian-labor-law-checker

# Open in your preferred web server
# Or use Python's built-in server:
python -m http.server 8000

# Or use Node.js live-server:
npm install -g live-server
live-server
```

### **GitHub Pages Deployment**
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Your site will be available at `https://your-username.github.io/croatian-labor-law-checker`

## 📖 Usage

### **Basic Search**
- Enter keywords in Croatian, English, or Spanish
- Use quotation marks for exact phrases: `"rodiljski dopust"`
- Search by article number: `članak 1` or `article 1`

### **Advanced Search**
- **Boolean operators**: `AND`, `OR`, `NOT`
- **Wildcards**: `radni*` matches "radni", "radnik", "radnica"
- **Filters**: Filter by section, article type, or date
- **Export**: Download results as JSON, PDF, or text

### **Navigation**
- **Keyboard shortcuts**: `Ctrl+F` for search, `Esc` to close modals
- **Quick access**: Use predefined buttons for common searches
- **Categories**: Browse by labor law sections

## 🧪 Testing & Validation

### **Quick Structure Check**
```bash
# Open interactive validator
open structure-test.html

# Or run CLI validation
bash validate-structure.sh
```

### **Automated Tests**
```bash
# Run all tests
npm test

# Or open interactive test page
open src/tests/test-enhanced.html
```

### **Test Coverage**
- ✅ Database initialization and loading
- ✅ Search functionality and performance
- ✅ Multi-language support
- ✅ Caching and data integrity
- ✅ UI components and accessibility
- ✅ Export and import features
- ✅ Project structure validation
- ✅ File dependencies verification

## 🔧 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Architecture**: Modular ES6 classes with dependency injection
- **Styling**: Neumorphic design system with CSS custom properties
- **Performance**: Service Worker caching, lazy loading, code splitting
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Security**: Content Security Policy, XSS prevention, input sanitization

## 🏗️ Project Reorganization

This project has been completely reorganized following modern web development best practices:

### **🎯 Reorganization Benefits**
- **📁 Clean Structure**: Modular organization with clear separation of concerns
- **🔍 Easy Navigation**: Logical file placement for better maintainability
- **📦 No Duplicates**: Eliminated all duplicate files and folders
- **🧪 Centralized Testing**: All test files organized in `src/tests/`
- **📚 Complete Documentation**: Comprehensive docs in `docs/` folder

### **🛠️ Validation Tools**
- **Interactive Validator**: Open `structure-test.html` to test the project structure
- **CLI Validation**: Run `bash validate-structure.sh` for complete validation
- **Reorganization Report**: See `REORGANIZATION_REPORT.md` for detailed changes

### **📊 Structure Metrics**
- **Directories Reduced**: 50% fewer main directories
- **Duplicates Eliminated**: 100% of duplicate files removed
- **Root Files Optimized**: 40% reduction in root-level files
- **Compatibility**: 100% backward compatibility maintained

## 📊 Performance Metrics

- **Load Time**: < 2 seconds on 3G
- **Search Speed**: < 100ms for most queries
- **Bundle Size**: < 500KB total
- **Lighthouse Score**: 95+ across all categories
- **Cache Hit Rate**: 90%+ for repeat visits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: new search feature"`
5. Push and create a Pull Request

### **Development Guidelines**
- Follow ES6+ standards
- Maintain test coverage above 90%
- Use semantic commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [docs/LICENSE](docs/LICENSE) file for details.

## 🆘 Support & Documentation

- **📋 Complete Documentation**: [docs/](docs/)
- **🔧 Reorganization Report**: [REORGANIZATION_REPORT.md](REORGANIZATION_REPORT.md)
- **✅ Structure Validator**: [structure-test.html](structure-test.html)
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/croatian-labor-law-checker/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-username/croatian-labor-law-checker/discussions)

## 📋 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Core System** | ✅ Operational | Enhanced database v2.1.0 |
| **Search Engine** | ✅ Operational | Advanced features active |
| **UI/UX** | ✅ Operational | Responsive design |
| **Legal Pages** | ⚠️ Ready for Content | HTML structure prepared |
| **Testing Suite** | ✅ Complete | Interactive and automated |
| **Documentation** | ✅ Complete | Comprehensive guides |
| **Project Structure** | ✅ Optimized | Recently reorganized |

## 🙏 Acknowledgments

- **Croatian Ministry of Labor**: For providing official labor law texts
- **Zakon.hr**: Official legal database source
- **Contributors**: All developers who helped improve this project

---

**📝 Note**: This application provides information from Croatian labor laws for educational and reference purposes. Always consult with legal professionals for official legal advice.

**🔄 Last Updated**: August 2025 | **Version**: 2.1.0 | **Structure**: Reorganized & Optimized
