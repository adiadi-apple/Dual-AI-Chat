# 学习 H5 聊天应用 - Learn H5 Chat

这是一个简单的学习项目，用来了解如何从零开始构建一个 H5 聊天界面，并集成不同的 AI API。

## 🎯 项目目标

- ✅ 学习如何搭建简单的 React + TypeScript 聊天界面
- ✅ 理解如何接入不同的 AI API（OpenAI、Google Gemini）
- ✅ 掌握 Vercel 部署流程
- ✅ 构建可复用的聊天组件

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
- **OpenAI 支持**: 使用 GPT-3.5 Turbo / GPT-4
- **Google Gemini 支持**: 使用 Gemini 模型
- 可配置的 API 端点和模型
- 会话历史管理

### 3. 设置管理
- 动态切换 AI 提供商
- 配置 API 密钥
- 自定义模型选择
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

### 方式 1：GitHub 集成

1. 将代码推送到 GitHub
2. 访问 [https://vercel.com](https://vercel.com)
3. 点击 "New Project"
4. 导入 GitHub 仓库
5. 选择 `learn-h5-chat` 文件夹作为 Root Directory
6. 部署完成！

### 方式 2：Vercel CLI

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

## 📚 学习资源

### 需要的知识
- HTML / CSS / JavaScript 基础
- React Hooks 概念
- 异步编程 (async/await)
- REST API 调用

### 推荐阅读
- [React 官方文档](https://react.dev)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Google Gemini API 文档](https://ai.google.dev)
- [Vite 文档](https://vitejs.dev)

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
