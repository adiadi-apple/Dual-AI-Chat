# 故障排除指南 - Troubleshooting Guide

遇到问题？本指南将帮助你快速诊断和解决常见问题。

## 📋 目录

1. [本地开发问题](#本地开发问题)
2. [部署问题](#部署问题)
3. [API 集成问题](#api-集成问题)
4. [性能问题](#性能问题)
5. [获取帮助](#获取帮助)

---

## 本地开发问题

### 🔴 问题：`npm install` 失败

**错误信息**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案**:
```bash
# 方案 1：使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 方案 2：删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 方案 3：升级 npm
npm install -g npm@latest
npm install
```

### 🔴 问题：`npm run dev` 启动失败

**错误信息**:
```
Error: ENOENT: no such file or directory
Error: Cannot find module '@vitejs/plugin-react'
```

**解决方案**:
```bash
# 确保安装了所有依赖
npm install

# 清除 vite 缓存
rm -rf node_modules/.vite

# 重新启动
npm run dev
```

### 🔴 问题：端口 5173 已被占用

**错误信息**:
```
EADDRINUSE: address already in use :::5173
```

**解决方案**:
```bash
# 方案 1：使用不同端口
npm run dev -- --port 5174

# 方案 2：杀死占用进程
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### 🔴 问题：`npm run build` 构建失败

**错误信息**:
```
error TS1005: '}' expected
error TS2304: Cannot find name 'React'
```

**解决方案**:
```bash
# 检查 TypeScript 配置
cat tsconfig.json

# 重新构建
rm -rf dist
npm run build

# 查看详细错误
npm run build -- --force
```

---

## 部署问题

### 🔴 问题：Vercel 部署失败

**错误信息**:
```
Build failed with 1 error in 12.34s
```

**诊断步骤**:
1. 查看 Vercel 部署日志
2. 检查 `Build Command` 设置
3. 确认 `Root Directory` 正确

**解决方案**:
```bash
# 本地模拟 Vercel 构建
npm run build

# 如果本地成功，问题可能是环境不同
# 尝试清除 Vercel 缓存并重新部署
```

**常见原因**:
- Node.js 版本不兼容
- 环境变量未设置
- 依赖缺失

### 🔴 问题：部署后页面空白

**症状**: 应用部署成功，但页面显示空白

**诊断步骤**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签是否有错误
3. 查看 Network 标签是否有失败的请求

**可能原因和解决方案**:

| 原因 | 解决方案 |
|------|--------|
| React 加载失败 | 检查 `index.html` 中的脚本标签 |
| 资源路径错误 | 检查 `vite.config.ts` 中的 `base` 配置 |
| 组件错误 | 检查 Console 中的具体错误信息 |

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // 根路径
  // 或
  base: '/learn-h5-chat/', // 子路径部署
})
```

### 🔴 问题：部署后样式加载失败

**症状**: 应用加载但样式丢失，显示为纯文本

**可能原因**:
- CSS 文件路径错误
- CSS 未正确打包

**解决方案**:
```bash
# 检查生成的 dist 文件夹
ls -la dist/

# 确保 CSS 文件存在
ls dist/assets/*.css

# 重新构建
npm run build -- --force
```

---

## API 集成问题

### 🔴 问题：CORS 错误

**错误信息**:
```
Access to XMLHttpRequest at 'https://api.openai.com/v1/chat/completions' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**原因**: 浏览器安全策略防止跨域请求

**解决方案**:
- ✅ 使用支持 CORS 的服务（Ollama、LM Studio）
- ✅ 创建后端代理
- ✅ 使用浏览器扩展（仅调试）

```typescript
// 后端代理示例 (Node.js + Express)
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(req.body)
  })
  const data = await response.json()
  res.json(data)
})
```

### 🔴 问题：API 密钥无效

**错误信息**:
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error"
  }
}
```

**解决方案**:
1. 验证 API 密钥是否正确复制
2. 检查 API 密钥是否过期
3. 重新生成新的 API 密钥
4. 确认使用了正确的 API 端点

**检查 API 端点**:
```typescript
// OpenAI
https://api.openai.com/v1/chat/completions

// Gemini
https://generativelanguage.googleapis.com/v1beta/openai/chat/completions

// Ollama
http://localhost:11434/v1/chat/completions
```

### 🔴 问题：超过 API 配额

**错误信息**:
```json
{
  "error": {
    "message": "You exceeded your current quota",
    "type": "insufficient_quota"
  }
}
```

**原因**: 
- 月度配额已用完
- 请求频率超过限制

**解决方案**:
1. 检查 API 使用统计
2. 升级账户或增加预算
3. 使用本地模型作为替代
4. 降低请求频率

### 🔴 问题：API 响应超时

**错误信息**:
```
Timeout waiting for API response
```

**可能原因**:
- 网络连接缓慢
- API 服务器响应慢
- 请求过大

**解决方案**:
```typescript
// 增加超时时间
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 秒

fetch(url, {
  signal: controller.signal,
  // ...
})
.finally(() => clearTimeout(timeoutId))

// 或减少输入大小
if (message.length > 5000) {
  throw new Error('消息过长，请缩短后重试')
}
```

---

## 性能问题

### 🟡 问题：应用加载慢

**症状**: 页面加载需要较长时间

**诊断工具**:
```bash
# 使用 Lighthouse
npm install -g lighthouse
lighthouse http://localhost:5173 --view

# 或在浏览器开发工具中
# 1. 打开 DevTools
# 2. 进入 Lighthouse 标签
# 3. 点击 "Analyze page load"
```

**优化方案**:
1. 代码分割
2. 懒加载组件
3. 图片优化
4. 减少依赖包大小

### 🟡 问题：应用占用内存过多

**症状**: 应用运行一段时间后变慢

**诊断**:
```bash
# 在浏览器 DevTools 中
# 1. Performance 标签
# 2. Memory 标签
# 3. 检查内存泄漏
```

**可能原因**:
- 事件监听器未移除
- 大型数据结构未释放
- 定时器未清除

### 🟡 问题：AI 响应速度慢

**可能原因**:
1. 网络连接问题
2. API 服务器负载高
3. 使用了大模型（GPT-4）
4. 对话历史过长

**解决方案**:
```typescript
// 使用更快的模型
'gpt-3.5-turbo'  // 快速
'gemini-1.5-flash'  // 极快

// 限制对话历史
const recentMessages = conversationHistory.slice(-10)

// 添加请求超时
setTimeout(() => {
  throw new Error('请求超时，请重试')
}, 30000)
```

---

## 获取帮助

### 📖 查看日志

**浏览器控制台日志**:
```
Mac: Cmd + Option + J
Windows: Ctrl + Shift + J
```

**复制错误信息时包含**:
- 完整的错误堆栈追踪
- 浏览器版本
- 操作系统
- 复现步骤

### 🔍 常见错误代码

| 代码 | 含义 | 解决方案 |
|------|------|--------|
| 400 | 请求错误 | 检查请求格式 |
| 401 | 未授权 | 检查 API 密钥 |
| 403 | 禁止访问 | 检查权限设置 |
| 404 | 未找到 | 检查 URL |
| 429 | 限流 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试 |

### 📚 推荐资源

- [MDN Web 文档](https://developer.mozilla.org)
- [React 文档](https://react.dev)
- [Vite 文档](https://vitejs.dev)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Gemini API 文档](https://ai.google.dev)

### 💬 获取社区帮助

1. **GitHub Issues**: 提交详细的问题报告
2. **Stack Overflow**: 标记相关标签求助
3. **Discord 社区**: 实时讨论

---

## 提交高效的问题报告

**包含以下信息**:
```markdown
### 问题描述
[简明扼要地说明问题]

### 复现步骤
1. ...
2. ...
3. ...

### 预期行为
[应该发生什么]

### 实际行为
[实际发生了什么]

### 环境信息
- 操作系统: [macOS/Windows/Linux]
- 浏览器: [Chrome/Firefox/Safari]
- Node 版本: [v18.0.0]
- npm 版本: [v9.0.0]

### 错误日志
[粘贴完整的错误信息]

### 截图
[如果适用]
```

---

## 快速参考

### 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview

# 清理缓存
rm -rf node_modules/.vite
rm -rf dist

# 完整重装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 环境检查

```bash
# 检查 Node 版本
node --version  # 应为 v18+

# 检查 npm 版本
npm --version  # 应为 v9+

# 检查 Git 状态
git status

# 查看依赖树
npm list
```

---

## 下一步

- 📖 [API 集成指南](./API_INTEGRATION.md)
- 🚀 [部署指南](./DEPLOYMENT.md)
- 🏠 [项目主页](README.md)

---

**还有问题？** 欢迎提交 GitHub Issue 或联系支持！ 🆘
