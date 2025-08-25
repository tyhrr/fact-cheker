#!/bin/bash

# Setup script para Croatian Labor Law Fact Checker
# Configuración automática para GitHub Pages

echo "🚀 Configurando Croatian Labor Law Fact Checker para GitHub Pages..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    print_error "No se encontró index.html. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

print_status "Directorio del proyecto verificado"

# Verificar archivos esenciales
REQUIRED_FILES=("index.html" "manifest.json" "sw.js" "css/style.css" "js/main.js")

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Archivo encontrado: $file"
    else
        print_error "Archivo faltante: $file"
        exit 1
    fi
done

# Verificar configuración GitHub Pages
if [ -f "_config.yml" ]; then
    print_status "Configuración Jekyll encontrada"
else
    print_warning "No se encontró _config.yml (opcional)"
fi

if [ -f "robots.txt" ]; then
    print_status "robots.txt encontrado"
else
    print_warning "No se encontró robots.txt (recomendado)"
fi

if [ -f "sitemap.xml" ]; then
    print_status "sitemap.xml encontrado"
else
    print_warning "No se encontró sitemap.xml (recomendado)"
fi

# Verificar GitHub Actions
if [ -f ".github/workflows/deploy.yml" ]; then
    print_status "GitHub Actions configurado"
else
    print_warning "No se encontró configuración de GitHub Actions"
fi

# Verificar estructura de archivos
print_info "Verificando estructura de directorios..."

REQUIRED_DIRS=("css" "js" "assets" "data")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "Directorio encontrado: $dir"
    else
        print_error "Directorio faltante: $dir"
        exit 1
    fi
done

# Verificar archivos de seguridad
if [ -f "js/security.js" ]; then
    print_status "Módulo de seguridad encontrado"
else
    print_warning "No se encontró js/security.js (recomendado)"
fi

if [ -f "js/gdpr.js" ]; then
    print_status "Módulo GDPR encontrado"
else
    print_warning "No se encontró js/gdpr.js (recomendado)"
fi

# Verificar que no hay archivos sensibles
SENSITIVE_FILES=(".env" "config.ini" "database.sql" "private.key")

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_error "⚠️  ARCHIVO SENSIBLE ENCONTRADO: $file - ELIMINAR ANTES DE SUBIR"
        exit 1
    fi
done

print_status "No se encontraron archivos sensibles"

# Verificar tamaño de archivos (GitHub tiene límite de 100MB por archivo)
print_info "Verificando tamaño de archivos..."

large_files=$(find . -size +50M -type f 2>/dev/null)
if [ ! -z "$large_files" ]; then
    print_warning "Archivos grandes encontrados (>50MB):"
    echo "$large_files"
    print_warning "GitHub Pages tiene límite de 100MB por archivo"
else
    print_status "Tamaños de archivo verificados"
fi

# Verificar sintaxis JSON
print_info "Verificando sintaxis JSON..."

JSON_FILES=("manifest.json" "data/translations.json" "package.json")

for file in "${JSON_FILES[@]}"; do
    if [ -f "$file" ]; then
        if command -v python3 &> /dev/null; then
            if python3 -m json.tool "$file" >/dev/null 2>&1; then
                print_status "JSON válido: $file"
            else
                print_error "JSON inválido: $file"
                exit 1
            fi
        else
            print_warning "Python3 no disponible para verificar JSON"
        fi
    fi
done

# Resumen final
echo ""
echo "🎉 ¡Configuración completada!"
echo ""
print_info "Próximos pasos para deployment en GitHub Pages:"
echo "1. Subir código a GitHub: git add . && git commit -m 'Initial commit' && git push"
echo "2. Ir a Settings > Pages en tu repositorio"
echo "3. Seleccionar Source: 'Deploy from a branch'"
echo "4. Seleccionar Branch: 'main' y folder: '/ (root)'"
echo "5. Click 'Save'"
echo ""
print_info "Tu sitio estará disponible en:"
echo "https://[tu-usuario].github.io/[nombre-repositorio]/"
echo ""
print_status "¡Listo para GitHub Pages! 🚀"
