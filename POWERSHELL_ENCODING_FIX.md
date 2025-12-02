# PowerShell编码问题解决方案

## 问题分析

### 根本原因
- Windows PowerShell默认使用代码页936 (GBK编码)
- UTF-8编码的文件在GBK环境下显示会出现乱码
- 批处理文件(.bat)和PowerShell脚本(.ps1)如果包含中文字符，需要特殊处理

### 具体表现
```
正确: 正在安装寸止MCP
乱码: 姝ｅ湪瀹夎瀵告MCP
```

## 解决方案

### 方案1: 临时解决（当前会话）
```powershell
# 设置UTF-8代码页
chcp 65001

# 设置输出编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

### 方案2: 永久解决（推荐）
已自动配置到PowerShell配置文件：
- 配置文件位置: `C:\Users\yessy\Documents\WindowsPowerShell\profile.ps1`
- 每次启动PowerShell时会自动设置UTF-8编码

### 方案3: 使用英文脚本
避免在批处理文件中使用中文字符，改用英文

## 验证编码设置

### 检查当前代码页
```powershell
chcp
# 应该显示: Active code page: 65001
```

### 测试中文显示
```powershell
Write-Host "测试中文显示" -ForegroundColor Green
```

## 注意事项

1. **新开的PowerShell窗口会自动应用UTF-8设置**
2. **批处理文件(.bat)仍然可能有编码问题**，建议使用PowerShell脚本(.ps1)
3. **如果在IDE中编辑脚本**，确保文件保存为UTF-8编码（带BOM或无BOM都可以）

## 状态
✅ 已修复PowerShell编码问题
✅ 已配置永久性UTF-8编码
✅ 中文可以正常显示

## 下一步
现在可以继续安装寸止MCP，不会再出现乱码问题。
