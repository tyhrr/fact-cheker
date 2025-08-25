#!/bin/bash
# Validation script for Croatian Labor Law Checker structure
# Verifies all file paths and dependencies are correct

echo "🔍 VALIDATING PROJECT STRUCTURE..."
echo "=================================="

# Check main files
echo "✅ Main Files:"
[ -f "index.html" ] && echo "  ✓ index.html" || echo "  ❌ index.html MISSING"
[ -f "manifest.json" ] && echo "  ✓ manifest.json" || echo "  ❌ manifest.json MISSING"
[ -f "sw.js" ] && echo "  ✓ sw.js" || echo "  ❌ sw.js MISSING"
[ -f ".htaccess" ] && echo "  ✓ .htaccess" || echo "  ❌ .htaccess MISSING"
[ -f "package.json" ] && echo "  ✓ package.json" || echo "  ❌ package.json MISSING"

echo ""
echo "✅ Source Code:"
[ -d "src" ] && echo "  ✓ src/" || echo "  ❌ src/ MISSING"
[ -d "src/core" ] && echo "  ✓ src/core/" || echo "  ❌ src/core/ MISSING"
[ -d "src/models" ] && echo "  ✓ src/models/" || echo "  ❌ src/models/ MISSING"
[ -d "src/utils" ] && echo "  ✓ src/utils/" || echo "  ❌ src/utils/ MISSING"
[ -d "src/scripts" ] && echo "  ✓ src/scripts/" || echo "  ❌ src/scripts/ MISSING"
[ -d "src/styles" ] && echo "  ✓ src/styles/" || echo "  ❌ src/styles/ MISSING"
[ -d "src/data" ] && echo "  ✓ src/data/" || echo "  ❌ src/data/ MISSING"
[ -d "src/tests" ] && echo "  ✓ src/tests/" || echo "  ❌ src/tests/ MISSING"

echo ""
echo "✅ Public Assets:"
[ -d "public" ] && echo "  ✓ public/" || echo "  ❌ public/ MISSING"
[ -d "public/assets" ] && echo "  ✓ public/assets/" || echo "  ❌ public/assets/ MISSING"
[ -d "public/legal" ] && echo "  ✓ public/legal/" || echo "  ❌ public/legal/ MISSING"

echo ""
echo "✅ Documentation:"
[ -d "docs" ] && echo "  ✓ docs/" || echo "  ❌ docs/ MISSING"
[ -f "README.md" ] && echo "  ✓ README.md" || echo "  ❌ README.md MISSING"

echo ""
echo "✅ Configuration:"
[ -d "config" ] && echo "  ✓ config/" || echo "  ❌ config/ MISSING"
[ -f ".gitignore" ] && echo "  ✓ .gitignore" || echo "  ❌ .gitignore MISSING"

echo ""
echo "✅ Core Scripts:"
[ -f "src/scripts/main.js" ] && echo "  ✓ main.js" || echo "  ❌ main.js MISSING"
[ -f "src/scripts/search.js" ] && echo "  ✓ search.js" || echo "  ❌ search.js MISSING"

echo ""
echo "✅ Enhanced System:"
[ -f "src/core/LegalDatabase.js" ] && echo "  ✓ LegalDatabase.js" || echo "  ❌ LegalDatabase.js MISSING"
[ -f "src/core/SearchEngine.js" ] && echo "  ✓ SearchEngine.js" || echo "  ❌ SearchEngine.js MISSING"

echo ""
echo "✅ Data Files:"
[ -f "src/data/croatian-labor-law.json" ] && echo "  ✓ croatian-labor-law.json" || echo "  ❌ croatian-labor-law.json MISSING"
[ -f "src/data/translations.json" ] && echo "  ✓ translations.json" || echo "  ❌ translations.json MISSING"

echo ""
echo "🔍 CHECKING FOR REMOVED DUPLICATES..."
echo "====================================="

# Check that duplicates were removed
[ ! -d "js" ] && echo "  ✓ js/ directory removed" || echo "  ❌ js/ directory still exists"
[ ! -d "css" ] && echo "  ✓ css/ directory removed" || echo "  ❌ css/ directory still exists"
[ ! -d "assets" ] && echo "  ✓ assets/ directory removed" || echo "  ❌ assets/ directory still exists"
[ ! -d "data" ] && echo "  ✓ data/ directory removed" || echo "  ❌ data/ directory still exists"

# Check that test files were moved
[ ! -f "test-enhanced.html" ] && echo "  ✓ test-enhanced.html moved from root" || echo "  ❌ test-enhanced.html still in root"
[ ! -f "test-legal.html" ] && echo "  ✓ test-legal.html moved from root" || echo "  ❌ test-legal.html still in root"

echo ""
echo "🎯 VALIDATION COMPLETE!"
echo "======================"

# Count files in main directories
echo "📊 File counts:"
echo "  src/: $(find src -type f | wc -l) files"
echo "  public/: $(find public -type f | wc -l) files"
echo "  docs/: $(find docs -type f | wc -l) files"
echo "  config/: $(find config -type f | wc -l) files"

echo ""
echo "🚀 Project is ready for deployment!"
