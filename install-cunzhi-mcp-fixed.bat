@echo off
chcp 65001 >nul
echo Installing Cunzhi MCP...
echo.

REM Check if already installed
where cunzhi >nul 2>nul
if %errorlevel% == 0 (
    echo Cunzhi MCP is already installed
    cunzhi --version
    goto :end
)

echo Cunzhi MCP is not installed. Please follow these steps to install manually:
echo.
echo 1. Visit https://github.com/imhuso/cunzhi
echo 2. Download the Windows zip package
echo 3. Extract to C:\tools\cunzhi\
echo 4. Add C:\tools\cunzhi\ to system PATH environment variable
echo 5. Reopen command prompt
echo 6. Run: cunzhi --init
echo.

REM Create directory
if not exist "C:\tools\cunzhi" (
    echo Creating directory C:\tools\cunzhi\
    mkdir "C:\tools\cunzhi"
)

echo.
echo After installation, please restart Cursor editor to load MCP configuration.
echo Configuration file location: .cursor\mcp.json

:end
pause

