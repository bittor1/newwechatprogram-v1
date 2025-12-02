@echo off
echo 正在安装寸止MCP...
echo.

REM 检查是否已安装
where cunzhi >nul 2>nul
if %errorlevel% == 0 (
    echo 寸止MCP已安装
    cunzhi --version
    goto :end
)

echo 寸止MCP未安装，请按照以下步骤手动安装：
echo.
echo 1. 访问 https://github.com/imhuso/cunzhi
echo 2. 下载适合Windows的压缩包
echo 3. 解压到 C:\tools\cunzhi\
echo 4. 将 C:\tools\cunzhi\ 添加到系统PATH环境变量
echo 5. 重新打开命令行窗口
echo 6. 运行: cunzhi --init
echo.

REM 创建目录
if not exist "C:\tools\cunzhi" (
    echo 创建目录 C:\tools\cunzhi\
    mkdir "C:\tools\cunzhi"
)

echo.
echo 安装完成后，请重启Cursor编辑器以加载MCP配置。
echo 配置文件位置: .cursor\mcp.json

:end
pause

