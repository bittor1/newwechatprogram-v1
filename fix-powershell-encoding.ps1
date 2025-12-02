# 修复PowerShell编码问题
# Fix PowerShell Encoding Issue

Write-Host "正在修复PowerShell编码设置..." -ForegroundColor Green
Write-Host ""

# 设置当前会话为UTF-8
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "✓ 当前会话已设置为UTF-8" -ForegroundColor Green

# 检查PowerShell配置文件
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path -Parent $profilePath

Write-Host ""
Write-Host "正在配置永久性UTF-8编码..." -ForegroundColor Yellow

# 创建配置文件目录（如果不存在）
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "✓ 创建配置文件目录: $profileDir" -ForegroundColor Green
}

# 检查配置文件是否存在
if (!(Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
    Write-Host "✓ 创建PowerShell配置文件: $profilePath" -ForegroundColor Green
}

# 检查是否已经配置了UTF-8
$profileContent = Get-Content $profilePath -ErrorAction SilentlyContinue
$hasUtf8Config = $profileContent | Select-String -Pattern "OutputEncoding.*UTF8" -Quiet

if (!$hasUtf8Config) {
    # 添加UTF-8配置
    $utf8Config = @"

# 设置UTF-8编码以支持中文显示
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
`$OutputEncoding = [System.Text.Encoding]::UTF8
"@
    Add-Content -Path $profilePath -Value $utf8Config
    Write-Host "✓ 已添加UTF-8配置到PowerShell配置文件" -ForegroundColor Green
} else {
    Write-Host "✓ PowerShell配置文件已包含UTF-8设置" -ForegroundColor Green
}

Write-Host ""
Write-Host "编码修复完成！" -ForegroundColor Green
Write-Host "当前代码页: $(chcp)" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试中文显示: 正在安装寸止MCP ✓" -ForegroundColor Green
Write-Host ""
Write-Host "注意: 新的PowerShell窗口将自动使用UTF-8编码" -ForegroundColor Yellow
