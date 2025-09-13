#!/usr/bin/env powershell
# 🚀 Build and Deploy Script for Croatian Labor Law Checker
# Version: 2.2.1

param(
    [string]$Environment = "dev",
    [switch]$Clean = $false,
    [switch]$Test = $false
)

Write-Host "🚀 CROATIAN LABOR LAW CHECKER - BUILD SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Clean Build: $Clean" -ForegroundColor Yellow
Write-Host "Run Tests: $Test" -ForegroundColor Yellow
Write-Host ""

# Create build directories
$buildDir = "build\$Environment"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

if ($Clean) {
    Write-Host "🧹 CLEANING BUILD DIRECTORY" -ForegroundColor Green
    Remove-Item -Path "$buildDir\*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "📁 COPYING CORE FILES" -ForegroundColor Green
# Copy essential files
$filesToCopy = @(
    "index.html",
    "manifest.json",
    "sw.js",
    "robots.txt",
    "sitemap.xml"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $buildDir -Force
        Write-Host "  ✅ Copied $file"
    }
}

Write-Host "`n📁 COPYING DIRECTORIES" -ForegroundColor Green
# Copy directories
$dirsToCopu = @(
    "src",
    "public",
    "docs",
    "assets"
)

foreach ($dir in $dirsToCopu) {
    if (Test-Path $dir) {
        Copy-Item -Path $dir -Destination $buildDir -Recurse -Force
        Write-Host "  ✅ Copied $dir"
    }
}

# Environment-specific optimizations
switch ($Environment) {
    "prod" {
        Write-Host "`n🎯 PRODUCTION OPTIMIZATIONS" -ForegroundColor Magenta
        
        # Minify CSS (basic)
        Write-Host "  🎨 Optimizing CSS files..."
        Get-ChildItem -Path "$buildDir\src\styles\*.css" -Recurse | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            # Basic minification: remove comments and extra whitespace
            $content = $content -replace '/\*[\s\S]*?\*/', ''
            $content = $content -replace '\s+', ' '
            $content = $content.Trim()
            Set-Content -Path $_.FullName -Value $content
            Write-Host "    ✅ Optimized $($_.Name)"
        }
        
        # Remove source maps and debug files
        Get-ChildItem -Path $buildDir -Include "*.map", "*debug*", "*test*" -Recurse | Remove-Item -Force
        Write-Host "  🗑️ Removed debug files and source maps"
    }
    
    "dev" {
        Write-Host "`n🛠️ DEVELOPMENT BUILD" -ForegroundColor Blue
        Write-Host "  ✅ Keeping all debug and source files"
    }
    
    "test" {
        Write-Host "`n🧪 TEST BUILD" -ForegroundColor Green
        Write-Host "  ✅ Including test files for automated testing"
    }
}

if ($Test) {
    Write-Host "`n🧪 RUNNING TESTS" -ForegroundColor Yellow
    
    # Check if all essential files exist
    $essentialFiles = @(
        "$buildDir\index.html",
        "$buildDir\src\scripts\main.js",
        "$buildDir\src\search-engine\SearchEngine.js",
        "$buildDir\src\search-engine\SearchManager.js"
    )
    
    $allFilesExist = $true
    foreach ($file in $essentialFiles) {
        if (Test-Path $file) {
            Write-Host "  ✅ $file exists"
        } else {
            Write-Host "  ❌ $file missing" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Host "  🎉 All essential files present!"
    } else {
        Write-Host "  ⚠️ Some files are missing!"
        exit 1
    }
}

Write-Host "`n📊 BUILD SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan
$buildSize = (Get-ChildItem -Path $buildDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Build Directory: $buildDir"
Write-Host "Build Size: $([math]::Round($buildSize, 2)) MB"
Write-Host "Files: $(Get-ChildItem -Path $buildDir -Recurse -File | Measure-Object | Select-Object -ExpandProperty Count)"

Write-Host "`n🎉 BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "Ready for deployment to $Environment environment" -ForegroundColor Green
