# Vercel 部署指南 - Deployment Guide

本文档详细说明了如何将 H5 聊天应用部署到 Vercel。

## 📋 目录

1. [前置要求](#前置要求)
2. [部署方式](#部署方式)
3. [环境变量配置](#环境变量配置)
4. [常见问题](#常见问题)
5. [部署后测试](#部署后测试)

## 前置要求

- GitHub 账号
- Vercel 账号（免费注册于 [vercel.com](https://vercel.com)）
- Git 和 Node.js 已安装
- 代码已推送到 GitHub 仓库

## 部署方式

### 方式 1️⃣：GitHub + Vercel 自动部署（推荐）

这是最简单的方式，支持自动化部署和预览。

#### 步骤 1：推送代码到 GitHub

```bash
# 进入项目目录
cd /path/to/project

# 初始化 git（如果还没有）
git init

# 添加 remote
git remote add origin https://github.com/your-username/your-repo.git

# 推送到 main 分支
git add .
git commit -m "Initial commit: Add learn-h5-chat project"
git push -u origin main
```

#### 步骤 2：连接 GitHub 到 Vercel

1. 访问 [https://vercel.com/new](https://vercel.com/new)
2. 选择 **Import Git Repository**
3. 搜索并选择你的 GitHub 仓库
4. 点击 **Import**

#### 步骤 3：配置项目设置

在 Vercel 的项目配置页面：

1. **Project Name**: 输入项目名称（例如 `learn-h5-chat`）
2. **Framework**: 选择 **Vite**
3. **Root Directory**: 选择 `learn-h5-chat`
4. **Build Command**: 保持默认 `npm run build`
5. **Output Directory**: 保持默认 `dist`
6. **Environment Variables**: 可选配置（见下一章节）

#### 步骤 4：部署

点击 **Deploy** 按钮，等待部署完成。

完成后，你会获得一个 `.vercel.app` 的公网 URL。

---

### 方式 2️⃣：Vercel CLI 部署

使用 Vercel 命令行工具进行部署。

#### 步骤 1：安装 Vercel CLI

```bash
# 全局安装
npm install -g vercel

# 或使用 npx（无需全局安装）
npx vercel
```

#### 步骤 2：首次部署

```bash
# 进入项目目录
cd learn-h5-chat

# 执行部署命令
vercel

# 按照提示：
# 1. 选择 "Create a new project"
# 2. 输入 project name
# 3. 输入 directory（当前目录）
# 4. 确认 settings
```

#### 步骤 3：生产环境部署

```bash
# 部署到生产环境
vercel --prod
```

---

### 方式 3️⃣：Docker 容器部署（高级）

如果需要更多控制，可以使用 Docker。

#### 创建 Dockerfile

在 `learn-h5-chat` 目录下创建 `Dockerfile`：

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### 创建 .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.vercel
```

#### 部署到 Vercel（Docker）

```bash
# 使用 Vercel CLI
vercel --prod

# Vercel 会自动检测 Dockerfile 并部署
```

---

## 环境变量配置

虽然 API 密钥通常在应用中通过设置面板配置，但你可以选择在 Vercel 中设置默认值。

### 在 Vercel 控制台设置环境变量

1. 在 Vercel 项目页面选择 **Settings**
2. 进入 **Environment Variables**
3. 添加变量（示例）：

| 名称 | 值 | 说明 |
|------|-----|------|
| `REACT_APP_API_PROVIDER` | `openai` | AI 提供商 |
| `REACT_APP_DEFAULT_MODEL` | `gpt-3.5-turbo` | 默认模型 |

### 在代码中使用环境变量

在 `src/App.tsx` 中：

```typescript
const apiConfig = {
  provider: (import.meta.env.REACT_APP_API_PROVIDER as 'openai' | 'gemini') || 'openai',
  model: import.meta.env.REACT_APP_DEFAULT_MODEL || 'gpt-3.5-turbo',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1'
}
```

---

## 常见问题

### Q1: 部署失败，显示 "Build failed"

**解决方案**：
1. 检查 `package.json` 中的依赖版本
2. 清除 `node_modules` 和 `package-lock.json`
3. 重新安装：`npm install`
4. 本地测试：`npm run build`

### Q2: 应用部署后无法加载

**解决方案**：
1. 检查 `vite.config.ts` 中的 `base` 配置
2. 确保 Vercel 中的 Root Directory 设置正确
3. 检查浏览器控制台是否有错误信息

### Q3: API 调用返回 CORS 错误

**解决方案**：
- CORS 错误通常是浏览器安全限制
- 某些 AI API（如 OpenAI）不支持直接从浏览器调用
- 解决方案：创建一个后端代理或使用支持 CORS 的 API

### Q4: 如何更新已部署的应用

**解决方案**：
- 如果使用 GitHub 连接：直接 push 到分支，Vercel 自动部署
- 如果使用 Vercel CLI：再次运行 `vercel --prod`

### Q5: 如何回滚到之前的版本

**解决方案**：
1. 在 Vercel 控制台选择 **Deployments**
2. 找到之前的版本
3. 点击 **Promote to Production**

---

## 部署后测试

### 功能测试清单

- [ ] 页面能正常加载
- [ ] 聊天界面显示正常
- [ ] 设置面板可以打开/关闭
- [ ] 可以输入文本并发送
- [ ] 填入 API 密钥后能成功调用 AI
- [ ] 响应显示正常
- [ ] 移动设备上显示正常（响应式设计）

### 性能监控

在 Vercel 控制台查看：
- **Analytics**: 页面加载时间、访问量
- **Logs**: 部署和运行时日志

### 自定义域名（可选）

1. 在 Vercel 项目 Settings 中选择 **Domains**
2. 添加自定义域名
3. 按照指示配置 DNS 记录

---

## 生产环境最佳实践

### 1. 环境分离

```bash
# 开发环境
vercel --dev

# 预发布环境
vercel --prebuilt

# 生产环境
vercel --prod
```

### 2. 监控和日志

- 使用 Vercel 的 Analytics 进行性能监控
- 配置错误报告（如 Sentry）
- 定期检查日志

### 3. 安全性

- 不要在代码中暴露 API 密钥
- 使用 Vercel 环境变量管理敏感信息
- 考虑使用后端代理来保护 API 密钥

### 4. 缓存和 CDN

- Vercel 自动使用 CDN，无需额外配置
- 静态资源会自动缓存

---

## 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [React 部署文档](https://react.dev/learn/deployment)
- [如何连接自定义域](https://vercel.com/docs/concepts/projects/domains)

---

## 快速链接

- 🏠 [项目主页](README.md)
- 📖 [API 集成指南](./API_INTEGRATION.md)
- 🐛 [故障排除](./TROUBLESHOOTING.md)

---

**祝部署顺利！** 🚀

如有问题，请查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。
