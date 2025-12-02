@echo off
echo MCP配置验证脚本
echo ==================
echo.

echo 检查MCP配置文件...
if exist ".cursor\mcp.json" (
    echo ✓ MCP配置文件存在: .cursor\mcp.json
) else (
    echo ✗ MCP配置文件不存在
    goto :end
)

echo.
echo 检查寸止MCP...
where cunzhi >nul 2>nul
if %errorlevel% == 0 (
    echo ✓ 寸止MCP已安装
    cunzhi --version
) else (
    echo ✗ 寸止MCP未安装
    echo   请运行 install-cunzhi-mcp.bat 进行安装
)

echo.
echo 检查Context7 MCP...
npx -y @upstash/context7-mcp --help >nul 2>nul
if %errorlevel% == 0 (
    echo ✓ Context7 MCP可用
) else (
    echo ✗ Context7 MCP不可用
)

echo.
echo 配置完成！请重启Cursor编辑器以加载MCP配置。
echo.
echo 使用方法：
echo - 寸止MCP: 在对话中输入 'zhi'
echo - Context7 MCP: 在问题末尾添加 'use context7'

:end
pause

