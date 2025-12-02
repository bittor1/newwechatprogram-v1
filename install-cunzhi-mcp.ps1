# Cunzhi MCP Installation Script for PowerShell
# 寸止MCP PowerShell安装脚本

Write-Host "正在安装寸止MCP..." -ForegroundColor Green
Write-Host ""

# Check if already installed
try {
    $cunzhiVersion = & cunzhi --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 寸止MCP已安装" -ForegroundColor Green
        Write-Host "版本: $cunzhiVersion"
        exit 0
    }
} catch {
    # Cunzhi not found, continue with installation instructions
}

Write-Host "✗ 寸止MCP未安装" -ForegroundColor Red
Write-Host ""
Write-Host "请按照以下步骤手动安装:" -ForegroundColor Yellow
Write-Host "1. 访问 https://github.com/imhuso/cunzhi" -ForegroundColor Cyan
Write-Host "2. 下载适合Windows的压缩包" -ForegroundColor Cyan
Write-Host "3. 解压到 C:\tools\cunzhi\" -ForegroundColor Cyan
Write-Host "4. 将 C:\tools\cunzhi\ 添加到系统PATH环境变量" -ForegroundColor Cyan
Write-Host "5. 重新打开PowerShell窗口" -ForegroundColor Cyan
Write-Host "6. 运行: cunzhi --init" -ForegroundColor Cyan
Write-Host ""

# Create directory
if (!(Test-Path "C:\tools\cunzhi")) {
    Write-Host "创建目录 C:\tools\cunzhi\" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "C:\tools\cunzhi" -Force | Out-Null
}

Write-Host ""
Write-Host "安装完成后，请重启Cursor编辑器以加载MCP配置。" -ForegroundColor Green
Write-Host "配置文件位置: .cursor\mcp.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
Read-Host
