# MCP工具安装和配置指南

## 1. 寸止MCP (Cunzhi MCP)

### 安装方法

**Windows用户：**
1. 访问 [寸止MCP GitHub仓库](https://github.com/imhuso/cunzhi)
2. 下载适合Windows的压缩包
3. 解压到合适位置（如 `C:\tools\cunzhi\`）
4. 将可执行文件路径添加到系统PATH环境变量
5. 在PowerShell中运行：`cunzhi --init`

**macOS用户：**
```bash
brew tap imhuso/cunzhi && brew install cunzhi
```

**Linux用户：**
1. 从GitHub下载对应系统的压缩包
2. 解压并添加到PATH
3. 运行 `cunzhi --init`

### 功能说明
寸止MCP旨在增强AI对话的连贯性，防止对话过早结束，确保对话的持续性和深入性。

## 2. Context7 MCP

### 安装方法

Context7 MCP已通过npm包管理器配置，无需额外安装。

### 获取API密钥（可选）
1. 访问 [Context7 Dashboard](https://context7.com/dashboard)
2. 创建账户并获取API密钥
3. 将API密钥添加到 `.cursor/mcp.json` 文件中的 `CONTEXT7_API_KEY` 字段

### 功能说明
Context7 MCP为AI编程助手提供实时、版本特定的文档和代码示例，确保生成的代码始终与最新的技术文档同步。

## 3. 使用方法

### 寸止MCP
在对话中输入 `zhi` 即可调用寸止MCP提供的工具。

### Context7 MCP
在向AI提问时，在问题末尾添加触发指令 `use context7`，例如：
```
创建一个基本的Next.js项目，使用应用程序路由。use context7
```

## 4. 配置文件位置
- 项目级配置：`.cursor/mcp.json`
- 全局配置：`~/.cursor/mcp.json`

## 5. 验证安装
安装完成后，重启Cursor编辑器，MCP服务器将自动启动。

