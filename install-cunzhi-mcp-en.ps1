# Cunzhi MCP Installation Script for PowerShell
# Avoid encoding issues by using English only

Write-Host "Installing Cunzhi MCP..." -ForegroundColor Green
Write-Host ""

# Check if already installed
try {
    $cunzhiVersion = & cunzhi --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Cunzhi MCP is already installed" -ForegroundColor Green
        Write-Host "Version: $cunzhiVersion"
        exit 0
    }
} catch {
    # Cunzhi not found, continue with installation instructions
}

Write-Host "✗ Cunzhi MCP is not installed" -ForegroundColor Red
Write-Host ""
Write-Host "Please follow these steps to install manually:" -ForegroundColor Yellow
Write-Host "1. Visit https://github.com/imhuso/cunzhi" -ForegroundColor Cyan
Write-Host "2. Download the Windows zip package" -ForegroundColor Cyan
Write-Host "3. Extract to C:\tools\cunzhi\" -ForegroundColor Cyan
Write-Host "4. Add C:\tools\cunzhi\ to system PATH environment variable" -ForegroundColor Cyan
Write-Host "5. Reopen PowerShell window" -ForegroundColor Cyan
Write-Host "6. Run: cunzhi --init" -ForegroundColor Cyan
Write-Host ""

# Create directory
if (!(Test-Path "C:\tools\cunzhi")) {
    Write-Host "Creating directory C:\tools\cunzhi\" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "C:\tools\cunzhi" -Force | Out-Null
}

Write-Host ""
Write-Host "After installation, please restart Cursor editor to load MCP configuration." -ForegroundColor Green
Write-Host "Configuration file location: .cursor\mcp.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host

