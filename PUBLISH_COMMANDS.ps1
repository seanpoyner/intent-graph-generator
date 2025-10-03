# Quick Publish Script for IntentGraph MCP Server
# Run each command manually or execute this script

Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  IntentGraph MCP Server - Publish to npm  " -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify build
Write-Host "Step 1: Verifying build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before publishing." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 2: Run tests
Write-Host "Step 2: Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Fix errors before publishing." -ForegroundColor Red
    exit 1
}
Write-Host "✅ All tests passed" -ForegroundColor Green
Write-Host ""

# Step 3: Preview package
Write-Host "Step 3: Previewing package contents..." -ForegroundColor Yellow
npm pack --dry-run
Write-Host ""

# Step 4: Check if logged in
Write-Host "Step 4: Checking npm login status..." -ForegroundColor Yellow
$npmUser = npm whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to npm" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run: " -NoNewline -ForegroundColor White
    Write-Host "npm login" -ForegroundColor Green
    Write-Host "Then run this script again." -ForegroundColor White
    exit 1
} else {
    Write-Host "✅ Logged in as: $npmUser" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check package name availability
Write-Host "Step 5: Checking package name availability..." -ForegroundColor Yellow
$packageCheck = npm view intent-graph-mcp-server 2>&1
if ($packageCheck -match "404") {
    Write-Host "✅ Package name 'intent-graph-mcp-server' is available!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Package name may already exist. Check output:" -ForegroundColor Yellow
    Write-Host $packageCheck -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Publish cancelled." -ForegroundColor Yellow
        exit 0
    }
}
Write-Host ""

# Step 6: Confirm publish
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Ready to Publish!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Package: " -NoNewline -ForegroundColor White
Write-Host "intent-graph-mcp-server@1.0.0" -ForegroundColor Cyan
Write-Host "Registry: " -NoNewline -ForegroundColor White
Write-Host "https://registry.npmjs.org" -ForegroundColor Cyan
Write-Host "User: " -NoNewline -ForegroundColor White
Write-Host "$npmUser" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Publish to npm? (yes/no)"

if ($confirm -eq "yes") {
    Write-Host ""
    Write-Host "Publishing..." -ForegroundColor Yellow
    npm publish --access public
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  ✅ Successfully Published!" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Your package is now live at:" -ForegroundColor White
        Write-Host "https://www.npmjs.com/package/intent-graph-mcp-server" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Users can install with:" -ForegroundColor White
        Write-Host "  npm install intent-graph-mcp-server" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Create GitHub release v1.0.0" -ForegroundColor White
        Write-Host "  2. Tag the commit: git tag v1.0.0 && git push --tags" -ForegroundColor White
        Write-Host "  3. Announce on social media" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Publish failed!" -ForegroundColor Red
        Write-Host "Check the error message above." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Publish cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To publish manually, run:" -ForegroundColor White
    Write-Host "  npm publish --access public" -ForegroundColor Green
}

