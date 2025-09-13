#!/usr/bin/env powershell
# 🧹 Cleanup Script for Croatian Labor Law Checker
# Automated file organization and cleanup

Write-Host "🧹 CROATIAN LABOR LAW CHECKER - CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Function to create directory if it doesn't exist
function New-DirectoryIfNeeded {
    param($Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
        Write-Host "  📁 Created directory: $Path" -ForegroundColor Green
    }
}

# Function to move files with pattern
function Move-FilesWithPattern {
    param($Pattern, $Destination, $Description)
    
    $files = Get-ChildItem -Name $Pattern -ErrorAction SilentlyContinue
    if ($files) {
        New-DirectoryIfNeeded $Destination
        foreach ($file in $files) {
            Move-Item -Path $file -Destination $Destination -Force
            Write-Host "  ✅ Moved $file to $Destination" -ForegroundColor Green
        }
        $fileCount = $files.Count
        Write-Host "  📊 ${Description}: $fileCount files moved" -ForegroundColor Yellow
    }
}

# Step 1: Create archive structure
Write-Host "`n📁 CREATING ARCHIVE STRUCTURE" -ForegroundColor Blue
New-DirectoryIfNeeded "archive"
New-DirectoryIfNeeded "archive\debug-scripts"
New-DirectoryIfNeeded "archive\test-scripts"
New-DirectoryIfNeeded "archive\old-versions"
New-DirectoryIfNeeded "archive\backups"
New-DirectoryIfNeeded "archive\temp-files"

# Step 2: Archive debug files
Write-Host "`n🔍 ARCHIVING DEBUG FILES" -ForegroundColor Blue
Move-FilesWithPattern "*debug*" "archive\debug-scripts" "Debug files"
Move-FilesWithPattern "console-*.js" "archive\debug-scripts" "Console diagnostic files"
Move-FilesWithPattern "inspect-*.js" "archive\debug-scripts" "Inspection scripts"
Move-FilesWithPattern "investigate-*.js" "archive\debug-scripts" "Investigation scripts"

# Step 3: Archive test files
Write-Host "`n🧪 ARCHIVING TEST FILES" -ForegroundColor Blue
Move-FilesWithPattern "*test*" "archive\test-scripts" "Test files"
Move-FilesWithPattern "structure-test.*" "archive\test-scripts" "Structure test files"
Move-FilesWithPattern "execute-*.html" "archive\test-scripts" "Execute test files"

# Step 4: Archive temporary and old files
Write-Host "`n📋 ARCHIVING TEMPORARY FILES" -ForegroundColor Blue
Move-FilesWithPattern "*.tmp" "archive\temp-files" "Temporary files"
Move-FilesWithPattern "*.bak" "archive\temp-files" "Backup files"
Move-FilesWithPattern "*.old" "archive\temp-files" "Old files"
Move-FilesWithPattern "*REPORT*.md" "archive\old-versions" "Report files"
Move-FilesWithPattern "*FIX*.md" "archive\old-versions" "Fix documentation"
Move-FilesWithPattern "*PROBLEM*.md" "archive\old-versions" "Problem reports"

# Step 5: Clean up empty directories
Write-Host "`n🗑️ REMOVING EMPTY DIRECTORIES" -ForegroundColor Red
$emptyDirs = Get-ChildItem -Directory -Recurse | Where-Object { $_.GetFiles().Count -eq 0 -and $_.GetDirectories().Count -eq 0 -and $_.Name -ne '.git' }
foreach ($dir in $emptyDirs) {
    Remove-Item $dir.FullName -Force
    Write-Host "  🗑️ Removed empty directory: $($dir.Name)" -ForegroundColor Red
}

# Step 6: Update .gitignore if needed
Write-Host "`n📝 UPDATING .GITIGNORE" -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
build/
dist/
temp/

# Archive and temporary files
archive/
*.tmp
*.bak
*.old
*.log

# IDE and editor files
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Cache directories
.cache/
.parcel-cache/
.next/
.nuxt/
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host "  ✅ Updated .gitignore with comprehensive patterns" -ForegroundColor Green

# Step 7: Generate cleanup report
Write-Host "`n📊 GENERATING CLEANUP REPORT" -ForegroundColor Magenta

$reportLines = @()
$reportLines += "# 🧹 CLEANUP REPORT - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")"
$reportLines += ""
$reportLines += "## Files Organized"
$reportLines += ""

if (Test-Path "archive\debug-scripts") {
    $reportLines += "### Debug Scripts Archived:"
    Get-ChildItem -Path "archive\debug-scripts" -Name | ForEach-Object { $reportLines += "- $_" }
    $reportLines += ""
}

if (Test-Path "archive\test-scripts") {
    $reportLines += "### Test Scripts Archived:"
    Get-ChildItem -Path "archive\test-scripts" -Name | ForEach-Object { $reportLines += "- $_" }
    $reportLines += ""
}

if (Test-Path "archive\old-versions") {
    $reportLines += "### Old Versions Archived:"
    Get-ChildItem -Path "archive\old-versions" -Name | ForEach-Object { $reportLines += "- $_" }
    $reportLines += ""
}

$reportLines += "## Current Project Structure"
$reportLines += ""
$reportLines += "### Root Directory:"
Get-ChildItem -Name | Where-Object { $_ -notmatch "node_modules|archive" } | ForEach-Object { $reportLines += "- $_" }
$reportLines += ""

$reportLines += "### Source Directory:"
if (Test-Path "src") {
    Get-ChildItem -Path "src" -Directory -Name | ForEach-Object { $reportLines += "- src/$_" }
}
$reportLines += ""

$reportLines += "## Statistics"
$archivedCount = if (Test-Path "archive") { (Get-ChildItem -Path "archive" -Recurse -File | Measure-Object).Count } else { 0 }
$rootFileCount = (Get-ChildItem -File | Where-Object { $_.Name -notmatch "package-lock|node_modules" } | Measure-Object).Count
$sourceFileCount = if (Test-Path "src") { (Get-ChildItem -Path "src" -Recurse -File | Measure-Object).Count } else { 0 }
$projectSize = [math]::Round(((Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|archive" } | Measure-Object -Property Length -Sum).Sum / 1MB), 2)

$reportLines += "- **Total archived files:** $archivedCount"
$reportLines += "- **Current root files:** $rootFileCount"
$reportLines += "- **Source files:** $sourceFileCount"
$reportLines += "- **Project size:** $projectSize MB"
$reportLines += ""
$reportLines += "## Next Steps"
$reportLines += "1. ✅ Project structure is now clean and organized"
$reportLines += "2. ✅ Debug and test files are safely archived"
$reportLines += "3. ✅ Ready for development and production builds"
$reportLines += "4. ✅ .gitignore updated with comprehensive patterns"

$reportLines | Out-File -FilePath "CLEANUP_REPORT.md" -Encoding UTF8
Write-Host "  📄 Cleanup report saved to CLEANUP_REPORT.md" -ForegroundColor Green

Write-Host "`n🎉 CLEANUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "✅ Project is now clean and organized" -ForegroundColor Green
Write-Host "✅ All debug and test files are safely archived" -ForegroundColor Green
Write-Host "✅ Empty directories removed" -ForegroundColor Green
Write-Host "✅ .gitignore updated" -ForegroundColor Green
Write-Host "✅ Cleanup report generated" -ForegroundColor Green
