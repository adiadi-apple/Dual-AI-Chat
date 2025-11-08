# 学习 H5 聊天应用 - Learn H5 Chat

这是一个简化的学习项目，设计用于从普通React开发者快速过渡到AI应用开发。通过实践学习如何从零开始构建聊天界面、集成多种AI API，以及掌握流式输出等现代AI功能。

## 🚀 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadiadi-apple%2FDual-AI-Chat&project-name=learn-h5-chat&repository-name=learn-h5-chat&root-directory=learn-h5-chat)

## 🎯 项目目标

- ✅ 学习AI API接入的核心概念和通用模式
- ✅ 理解如何支持多个AI提供商（OpenAI、Gemini、本地模型等）
- ✅ 掌握流式输出(Streaming)实现，提升用户体验
- ✅ 学习不同模型间通用化集成的设计模式
- ✅ 深入理解现代AI模型生态和选型标准
- ✅ 从普通开发者成长为AI应用开发者

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建项目
npm run build

# 本地预览
npm run preview
```

## 📁 项目结构

```
learn-h5-chat/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatContainer.tsx   # 聊天容器
│   │   ├── ChatMessage.tsx     # 消息组件
│   │   ├── ChatInput.tsx       # 输入框组件
│   │   └── SettingsPanel.tsx   # 设置面板
│   ├── services/            # 服务模块
│   │   └── aiService.ts       # AI API 调用服务
│   ├── styles/              # CSS 样式
│   ├── App.tsx              # 主应用组件
│   ├── index.css            # 全局样式
│   └── main.tsx             # 入口文件
├── index.html               # HTML 模板
├── package.json
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md
```

## 🔧 功能特性

### 1. 聊天界面
- 实时消息显示
- 自动滚动到最新消息
- 支持多行文本输入
- 加载动画反馈
- 错误消息提示

### 2. AI API 集成
- **OpenAI 支持**: GPT-4o / GPT-4o mini (最新模型)
- **Google Gemini 支持**: Gemini 2.5 系列 (最新能力)
- **OpenAI兼容API**: Ollama、LM Studio、Mistral 等本地/云模型
- **Anthropic Claude 支持**: Claude 3.5 Sonnet
- 可配置的 API 端点和模型
- 会话历史管理
- 支持流式输出（逐字显示结果）

### 3. 设置管理
- 一键切换 AI 提供商和模型
- 配置 API 密钥和自定义端点
- 支持本地模型和云端API混用
- 获取 API 密钥的快速指南

## 📝 使用指南

### 1. 配置 API 密钥

#### OpenAI
1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 创建新的 Secret Key
3. 在应用设置中填入密钥

#### Google Gemini
1. 访问 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. 创建新的 API Key
3. 在应用设置中填入密钥

### 2. 开始聊天
1. 在设置中配置 API 密钥
2. 在输入框中输入问题
3. 按 Enter 发送或点击发送按钮
4. 等待 AI 响应

## 🌐 Vercel 部署

### 方式 1：一键部署（推荐）

点击上方的 "Deploy with Vercel" 按钮，即可一键部署到 Vercel。只需登录 GitHub 和 Vercel 账户，自动配置 Root Directory 为 `learn-h5-chat`。

### 方式 2：GitHub 集成

1. 将代码推送到 GitHub
2. 访问 [https://vercel.com](https://vercel.com)
3. 点击 "New Project"
4. 导入 GitHub 仓库
5. 选择 `learn-h5-chat` 文件夹作为 Root Directory
6. 部署完成！

### 方式 3：Vercel CLI

```bash
# 全局安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 🛠️ 技术栈

- **前端框架**: React 19.1.0
- **语言**: TypeScript 5.7.2
- **构建工具**: Vite 6.2.0
- **HTTP 客户端**: Fetch API
- **样式**: CSS 3

## 📚 完整学习指南

### 针对React开发者的AI应用开发学习资料

本项目提供两份专为你设计的完整学习指南：

#### 1. 📖 [AI 应用开发完整指南](./AI_APPLICATION_DEVELOPMENT_GUIDE.md) ⭐ **推荐阅读**

涵盖核心知识点：
- **API接入模式** - 3种集成方式对比与实践
- **通用化AI模型集成** - 适配器模式、工厂模式实现
- **流式输出实现** - 实时显示AI响应的完整代码
- **现代AI模型生态** - 2024-2025年最新模型对比与选型
- **最佳实践** - 错误处理、成本优化、缓存策略、监控指标
- **完整代码示例** - 从简单到复杂的分步实现

#### 2. 🔧 [现代AI模型配置指南](./MODERN_MODELS_CONFIG.md) ⭐ **快速参考**

实用的配置与部署指南：
- **模型选择工具** - 按场景快速选择最优模型
- **4大主流提供商** - OpenAI、Google、Anthropic、Meta
- **本地部署方案** - Ollama、LM Studio 完整配置
- **逐步接入教程** - 从获取密钥到代码集成
- **成本估算工具** - 快速计算API调用成本
- **故障排查指南** - 常见问题解决方案

### 学习路径建议（4周）

**第1周：基础概念**
- [ ] 理解 HTTP API 和 REST 架构
- [ ] 学习 OpenAI 兼容 API 格式
- [ ] 实现第一个非流式 API 调用

**第2周：进阶集成**
- [ ] 实现流式输出(Streaming)
- [ ] 学习适配器模式统一不同 API
- [ ] 处理错误和重试逻辑

**第3周：生产就绪**
- [ ] 添加缓存机制
- [ ] 实现成本监控
- [ ] 支持多个 AI 提供商切换

**第4周：优化与部署**
- [ ] 部署到 Vercel / Docker
- [ ] 性能优化和监控
- [ ] 构建你的第一个 AI 应用

### 前置知识要求
- ✅ React Hooks 和状态管理
- ✅ 异步编程 (async/await、Promise)
- ✅ 基础 HTTP API 概念
- ✅ TypeScript 基础

### 快速链接
- 📖 [OpenAI 官方 API 文档](https://platform.openai.com/docs)
- 📖 [Google Gemini API 文档](https://ai.google.dev/docs)
- 📖 [Anthropic Claude 文档](https://docs.anthropic.com/)
- 🔧 [Ollama - 本地模型](https://ollama.ai/)
- 📊 [AI 模型对比](https://www.lmsys.org/blog/2024-05-25-cv-llm/)
- 🎓 [原项目完整实现代码](../dual-ai-chat/) - 生产级参考

## 🐛 常见问题

### Q: 显示 "请先在设置中配置 API 密钥"
**A**: 点击右上角 ⚙️ 设置按钮，填入你的 API 密钥。

### Q: 收到 CORS 错误
**A**: 这是浏览器安全限制。某些 API 可能需要后端代理。

### Q: API 调用很慢
**A**: 检查网络连接，或减少输入文本长度。

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📞 联系方式

如有问题，请提交 GitHub Issues。

---

**Happy Learning! 🚀**
