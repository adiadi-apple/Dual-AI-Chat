# API 集成指南 - How to Integrate Different AI APIs

本指南详细说明了如何在 H5 聊天应用中集成和使用不同的 AI API。

## 📋 目录

1. [支持的 AI 提供商](#支持的-ai-提供商)
2. [OpenAI 集成](#openai-集成)
3. [Google Gemini 集成](#google-gemini-集成)
4. [自定义 API 集成](#自定义-api-集成)
5. [常见问题](#常见问题)

---

## 支持的 AI 提供商

| 提供商 | 模型 | 状态 | 难度 |
|--------|------|------|------|
| **OpenAI** | GPT-3.5, GPT-4 | ✅ 完全支持 | ⭐⭐ |
| **Google Gemini** | Gemini 1.5 | ✅ 完全支持 | ⭐⭐ |
| **Ollama** (OpenAI 兼容) | 本地模型 | ✅ 完全支持 | ⭐⭐⭐ |
| **LM Studio** (OpenAI 兼容) | 本地模型 | ✅ 完全支持 | ⭐⭐⭐ |

---

## OpenAI 集成

### 1️⃣ 获取 API 密钥

#### 步骤 1：创建 OpenAI 账户

1. 访问 [platform.openai.com](https://platform.openai.com/signup)
2. 注册或登录
3. 完成身份验证

#### 步骤 2：生成 API Key

1. 点击左侧导航 **API keys**
2. 点击 **Create new secret key**
3. 复制生成的密钥（只显示一次！）
4. 妥善保管密钥

#### 步骤 3：设置月度额度

1. 进入 **Billing** → **Usage limits**
2. 设置 **Hard limit** 防止超支

### 2️⃣ 在应用中配置

#### 方式 A：通过设置面板（推荐新手）

1. 打开应用
2. 点击右上角 ⚙️ **设置**
3. 选择 **OpenAI** 标签
4. 填入以下信息：
   - **API 密钥**: 你的 Secret Key
   - **API 基础 URL**: `https://api.openai.com/v1`
   - **模型**: 选择 `gpt-3.5-turbo` 或 `gpt-4`
5. 点击 **保存**

#### 方式 B：环境变量（推荐开发者）

在项目根目录创建 `.env.local`：

```bash
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

在 `src/App.tsx` 中使用：

```typescript
const [apiConfig, setApiConfig] = useState({
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'
})
```

### 3️⃣ 模型选择

```javascript
// 不同模型的对比
const models = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    speed: '快速 ⚡',
    cost: '便宜 💰',
    quality: '好 ✅'
  },
  'gpt-4': {
    name: 'GPT-4',
    speed: '慢 🐢',
    cost: '昂贵 💸',
    quality: '优秀 ⭐⭐⭐'
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    speed: '中等 🚀',
    cost: '适中 💵',
    quality: '优秀 ⭐⭐⭐'
  }
}
```

### 4️⃣ 估算费用

OpenAI 按 Token 计费：

```
费用 = (输入 Token × 输入价格) + (输出 Token × 输出价格)
```

**GPT-3.5 Turbo 价格** (2024年)：
- 输入: $0.50 / 百万 Token
- 输出: $1.50 / 百万 Token

**示例**：
- 对话: 输入 500 Token，输出 200 Token
- 费用: (500 × 0.0000005) + (200 × 0.0000015) = $0.0006

---

## Google Gemini 集成

### 1️⃣ 获取 API 密钥

#### 步骤 1：访问 Google AI Studio

1. 访问 [aistudio.google.com](https://aistudio.google.com)
2. 用 Google 账户登录

#### 步骤 2：获取 API Key

1. 在左侧菜单点击 **Get API key**
2. 点击 **Create API key in new project**
3. 复制生成的 API Key

#### 步骤 3：启用 API（可选）

如果需要使用 Google Cloud Console：

1. 访问 [console.cloud.google.com](https://console.cloud.google.com)
2. 创建新项目
3. 启用 **Generative Language API**

### 2️⃣ 在应用中配置

#### 方式 A：通过设置面板

1. 点击右上角 ⚙️ **设置**
2. 选择 **Google Gemini** 标签
3. 填入以下信息：
   - **API 密钥**: 你的 API Key
   - **API 基础 URL**: `https://generativelanguage.googleapis.com/v1beta/openai/`
   - **模型**: 选择 `gemini-1.5-pro` 或 `gemini-1.5-flash`
4. 点击 **保存**

#### 方式 B：环境变量

创建 `.env.local`：

```bash
VITE_GEMINI_API_KEY=your-api-key-here
VITE_GEMINI_MODEL=gemini-1.5-pro
VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

### 3️⃣ 模型选择

```javascript
const models = {
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    speed: '快速 ⚡',
    cost: '免费配额',
    quality: '优秀 ⭐⭐⭐'
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    speed: '极快 ⚡⚡',
    cost: '免费配额',
    quality: '好 ✅'
  }
}
```

### 4️⃣ 配额限制

Google Gemini 提供免费配额：

- **RPM**: 60 请求/分钟
- **TPM**: 1,000,000 Token/分钟
- **每日限制**: 1,500 请求/天

---

## 自定义 API 集成

### 支持 OpenAI 兼容 API

许多本地 LLM 框架实现了 OpenAI 兼容的 API 接口。

### 1️⃣ Ollama 集成

**Ollama** 是运行本地大语言模型的简单方式。

#### 安装 Ollama

1. 访问 [ollama.ai](https://ollama.ai)
2. 下载安装
3. 拉取模型：
   ```bash
   ollama pull llama2
   ollama pull mistral
   ```

#### 配置应用

1. 启动 Ollama：
   ```bash
   ollama serve
   ```

2. 在应用设置中：
   - **API 基础 URL**: `http://localhost:11434/v1`
   - **模型**: `llama2` 或其他已安装的模型
   - **API 密钥**: 留空

### 2️⃣ LM Studio 集成

**LM Studio** 提供图形界面来运行本地模型。

#### 安装和配置

1. 访问 [lmstudio.ai](https://lmstudio.ai)
2. 下载安装
3. 加载模型
4. 启用 **Local Server**，默认地址 `http://localhost:8000`

#### 在应用中配置

- **API 基础 URL**: `http://localhost:8000/v1`
- **模型**: 在 LM Studio 中查看
- **API 密钥**: 留空

### 3️⃣ 自定义 API 端点

如果你有其他 OpenAI 兼容的 API（如自建后端）：

#### 修改 `src/services/aiService.ts`

添加新的 API 提供商支持：

```typescript
// 添加新的 provider 类型
type ApiProvider = 'openai' | 'gemini' | 'custom'

// 添加新的调用函数
async function callCustomAPI(message: string, config: ApiConfig, conversationHistory: Message[]): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`

  const messages = [
    ...conversationHistory,
    { role: 'user', content: message }
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 根据需要添加认证头
      'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : undefined
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error('Custom API call failed')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 在 callAI 函数中添加分支
export async function callAI({ message, config, conversationHistory }: CallAIParams): Promise<string> {
  if (config.provider === 'openai') {
    return callOpenAI(message, config, conversationHistory)
  } else if (config.provider === 'gemini') {
    return callGemini(message, config, conversationHistory)
  } else if (config.provider === 'custom') {
    return callCustomAPI(message, config, conversationHistory)
  } else {
    throw new Error('Unsupported AI provider')
  }
}
```

#### 更新 UI

在 `src/components/SettingsPanel.tsx` 中添加自定义选项：

```typescript
const PROVIDERS = ['openai', 'gemini', 'custom']

const MODELS: Record<string, string[]> = {
  openai: ['gpt-3.5-turbo', 'gpt-4'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  custom: ['llama2', 'mistral', 'custom-model']
}
```

---

## 常见问题

### Q1: API 调用返回 CORS 错误

**症状**: 控制台显示 `CORS policy: No 'Access-Control-Allow-Origin' header`

**原因**: 浏览器安全限制，API 不允许跨域请求

**解决方案**:
- 使用支持 CORS 的 API（Ollama、LM Studio）
- 创建后端代理
- 使用浏览器扩展（仅开发调试）

### Q2: API 密钥泄露怎么办

**立即采取行动**:
1. 立即删除/重新生成 API Key
2. 检查账户使用情况
3. 启用 API 使用限额
4. 定期轮换密钥

### Q3: 超过 API 配额

**症状**: `429 Too Many Requests` 或 `Quota exceeded`

**解决方案**:
- 降低请求频率
- 升级 API 套餐
- 使用本地模型（Ollama）替代

### Q4: API 返回 401 Unauthorized

**症状**: `401 Unauthorized`

**可能原因**:
- API 密钥过期
- API 密钥复制错误
- 使用了错误的 API 端点

**解决方案**:
- 重新生成 API 密钥
- 检查设置中的密钥是否正确
- 确认 API 端点 URL

### Q5: 响应速度慢

**可能原因**:
- 网络连接较慢
- 使用了较大的模型（如 GPT-4）
- API 服务器负载高

**优化方案**:
- 使用更快的模型（GPT-3.5, Gemini Flash）
- 减少对话历史长度
- 使用本地模型（Ollama）

### Q6: 支持流式响应吗

**当前**: ❌ 不支持（等待完整响应后显示）

**计划功能**: ✅ 流式输出支持

---

## 最佳实践

### 1. 开发阶段

```typescript
// 使用环境变量，不要硬编码
const apiKey = import.meta.env.VITE_API_KEY
const baseUrl = import.meta.env.VITE_API_BASE_URL
```

### 2. 安全性

```typescript
// ❌ 错误
const apiKey = "sk-abc123..."

// ✅ 正确
const apiKey = import.meta.env.VITE_API_KEY

// ✅ 更安全（后端代理）
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({ message })
})
```

### 3. 错误处理

```typescript
try {
  const response = await callAI({...})
} catch (error) {
  if (error.message.includes('401')) {
    // 提示重新输入 API 密钥
  } else if (error.message.includes('429')) {
    // 提示配额限制
  } else {
    // 通用错误处理
  }
}
```

### 4. 成本控制

```typescript
// 计算 Token 使用
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// 添加验证
if (estimateTokens(message) > MAX_TOKENS) {
  throw new Error('消息过长')
}
```

---

## 相关资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Google Gemini API 文档](https://ai.google.dev)
- [Ollama 文档](https://ollama.ai)
- [LM Studio](https://lmstudio.ai)

---

## 下一步

- 📖 [部署指南](./DEPLOYMENT.md)
- 🏠 [项目主页](README.md)
- 🐛 [故障排除](./TROUBLESHOOTING.md)

---

**Happy Coding! 🚀**
