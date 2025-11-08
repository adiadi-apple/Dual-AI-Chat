# 现代AI模型配置指南

> 本指南提供2024-2025年最新AI模型的接入方式和配置

## 📊 模型生态全景

### 顶级推理模型（推荐用于复杂问题）

#### 1. GPT-4o (OpenAI) - 2024/11发布

**特点**：多模态、最快、最全能

```typescript
const config = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  modelId: 'gpt-4o',  // 最新的通用模型
  apiKey: process.env.OPENAI_API_KEY
}

// 使用示例
await callAI('今天天气如何?', config)
```

**定价**：$5/$15 per 1M tokens  
**上下文**：128K tokens  
**特色**：最新视觉能力、最快响应

---

#### 2. Gemini 2.5 Pro (Google) - 2025/01发布

**特点**：百万token上下文、思考预算、成本低

```typescript
const config = {
  provider: 'gemini',
  modelId: 'gemini-2.5-pro',
  apiKey: process.env.GEMINI_API_KEY
}

// 使用思考预算（深度推理）
const response = await generateResponse(
  prompt,
  'gemini-2.5-pro',
  false,
  undefined,
  undefined,
  undefined,
  undefined,
  { thinkingBudget: 24576 } // 启用深度思考
)
```

**定价**：$1.25/$2.5 per 1M tokens  
**上下文**：1M tokens（最长）  
**特色**：思考预算、性价比最优

---

#### 3. Claude 3.5 Sonnet (Anthropic) - 2024/10发布

**特点**：推理强、安全性好、编码能力顶级

```typescript
// 需要安装 @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '写一个React组件' }
  ]
})
```

**定价**：$3/$15 per 1M tokens  
**上下文**：200K tokens  
**特色**：编码最强、推理严谨

---

### 平衡模型（性价比最优）

#### 4. Gemini 2.5 Flash (Google)

**最快速、最经济的选择**

```typescript
const config = {
  modelId: 'gemini-2.5-flash',
  provider: 'gemini'
}

// 实时应用、聊天机器人的首选
```

**定价**：$0.075/$0.30 per 1M tokens  
**优势**：超快、极便宜、仍然聪慧

---

#### 5. GPT-4o mini (OpenAI)

**轻量级但聪慧的选择**

```typescript
const config = {
  modelId: 'gpt-4o-mini',
  provider: 'openai'
}

// 最适合量大、对成本敏感的应用
```

**定价**：$0.15/$0.60 per 1M tokens  
**优势**：成本低、速度快、足够聪慧

---

### 本地部署模型（开源、免费）

#### 6. Llama 3.1 (Meta) - 通过Ollama

**完全免费、可离线运行**

```bash
# 安装Ollama
# https://ollama.ai

# 启动服务
ollama serve

# 下载模型（推荐）
ollama pull llama3.1:70b  # 最好的推理能力
ollama pull llama3.1      # 更小的版本
```

```typescript
const config = {
  provider: 'openai', // Ollama兼容OpenAI API格式
  baseUrl: 'http://localhost:11434/v1',
  modelId: 'llama3.1',
  apiKey: '' // Ollama不需要密钥
}

await callAI('你好', config)
```

**成本**：免费（自托管）  
**优势**：完全隐私、离线可用、无API限制

---

#### 7. Mistral Large (Mistral AI) - 通过Together.ai或自托管

**欧洲顶级开源模型**

```typescript
// 方式1：通过Together.ai API
const config = {
  provider: 'openai',
  baseUrl: 'https://api.together.xyz/v1',
  modelId: 'mistralai/Mistral-7B-Instruct-v0.1',
  apiKey: process.env.TOGETHER_API_KEY
}

// 方式2：本地Ollama
const localConfig = {
  provider: 'openai',
  baseUrl: 'http://localhost:11434/v1',
  modelId: 'mistral'
}
```

---

## 🔧 配置对比表

### 按使用场景选择

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| **简单Q&A** | gpt-4o-mini | 最便宜、足够聪慧 |
| **复杂推理** | gemini-2.5-pro | 思考预算、上下文长 |
| **编码助手** | claude-3.5-sonnet | 代码能力最强 |
| **实时聊天** | gemini-2.5-flash | 最快、最便宜 |
| **长文档处理** | gemini-2.5-pro | 百万token上下文 |
| **本地部署** | llama3.1 | 完全开源、无成本 |
| **成本最优** | gpt-4o-mini | $0.15/$0.60 |
| **最新能力** | gpt-4o | 最全能 |

---

## 📝 逐步接入指南

### Step 1: 选择提供商

```typescript
// 快速决策树
function chooseProvider(requirements: {
  budget: 'free' | 'low' | 'medium' | 'high'
  latency: 'critical' | 'normal' | 'flexible'
  complexity: 'simple' | 'medium' | 'complex'
  privacy: 'public' | 'private'
}): string {
  if (requirements.privacy === 'private') return 'ollama'
  if (requirements.budget === 'free') return 'ollama'
  
  if (requirements.latency === 'critical') return 'gpt-4o-mini'
  if (requirements.complexity === 'complex') return 'gemini-2.5-pro'
  
  return 'gpt-4o-mini' // 默认选择
}
```

---

### Step 2: 获取API密钥

#### OpenAI
```bash
# 1. 访问 https://platform.openai.com/api-keys
# 2. 点击 "Create new secret key"
# 3. 复制密钥
# 4. 保存到 .env.local
OPENAI_API_KEY=sk-proj-xxxxx
```

#### Google Gemini
```bash
# 1. 访问 https://aistudio.google.com/app/apikey
# 2. 点击 "Create API Key"
# 3. 复制密钥
GEMINI_API_KEY=xxxx
```

#### Anthropic Claude
```bash
# 1. 访问 https://console.anthropic.com/
# 2. 创建API密钥
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

#### Together.ai (用于Mistral、Llama等)
```bash
# 1. 访问 https://www.together.ai/
# 2. 创建账户并生成API密钥
TOGETHER_API_KEY=xxxx
```

---

### Step 3: 在你的项目中使用

#### 简单聊天应用

```typescript
// src/services/aiService.ts

export type ProviderType = 'openai' | 'gemini' | 'claude' | 'together' | 'ollama'

export interface AIConfig {
  provider: ProviderType
  apiKey?: string
  baseUrl?: string
  modelId: string
}

export async function chat(
  message: string,
  config: AIConfig
): Promise<string> {
  switch (config.provider) {
    case 'openai':
    case 'together':
    case 'ollama':
      return callOpenAICompatible(message, config)
    case 'gemini':
      return callGemini(message, config)
    case 'claude':
      return callClaude(message, config)
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

async function callOpenAICompatible(
  message: string,
  config: AIConfig
): Promise<string> {
  const response = await fetch(
    `${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000
      })
    }
  )

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(
  message: string,
  config: AIConfig
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.modelId}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    }
  )

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callClaude(
  message: string,
  config: AIConfig
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.modelId,
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    })
  })

  const data = await response.json()
  return data.content[0].text
}
```

#### 在React组件中使用

```typescript
// src/components/ChatBox.tsx

import { useState } from 'react'
import { chat, AIConfig } from '../services/aiService'

const presets: Record<string, AIConfig> = {
  'gpt4o': {
    provider: 'openai',
    modelId: 'gpt-4o',
    apiKey: process.env.REACT_APP_OPENAI_KEY
  },
  'gpt4o-mini': {
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    apiKey: process.env.REACT_APP_OPENAI_KEY
  },
  'gemini-pro': {
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    apiKey: process.env.REACT_APP_GEMINI_KEY
  },
  'gemini-flash': {
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    apiKey: process.env.REACT_APP_GEMINI_KEY
  },
  'claude-sonnet': {
    provider: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    apiKey: process.env.REACT_APP_CLAUDE_KEY
  },
  'ollama-llama': {
    provider: 'ollama',
    modelId: 'llama3.1',
    baseUrl: 'http://localhost:11434/v1'
  }
}

export function ChatBox() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('gpt4o-mini')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await chat(input, presets[selectedPreset])
      setOutput(response)
    } catch (error) {
      setOutput(`错误: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">选择模型</label>
        <select
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="gpt4o">GPT-4o (快速、全能)</option>
          <option value="gpt4o-mini">GPT-4o mini (便宜)</option>
          <option value="gemini-pro">Gemini 2.5 Pro (聪慧)</option>
          <option value="gemini-flash">Gemini 2.5 Flash (最快)</option>
          <option value="claude-sonnet">Claude 3.5 Sonnet (编码)</option>
          <option value="ollama-llama">本地Llama3.1 (免费)</option>
        </select>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入你的问题..."
        className="w-full p-3 border rounded min-h-24"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? '处理中...' : '发送'}
      </button>

      {output && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">响应:</h3>
          <p className="whitespace-pre-wrap">{output}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 🚀 快速启动三大方案

### 方案A：只用OpenAI（最简单）

```bash
# 1. 获取API密钥：https://platform.openai.com/api-keys
# 2. 设置环境变量
echo 'REACT_APP_OPENAI_KEY=sk-proj-xxxxx' > .env.local

# 3. 使用
const response = await chat('你好', {
  provider: 'openai',
  modelId: 'gpt-4o-mini',
  apiKey: process.env.REACT_APP_OPENAI_KEY
})
```

### 方案B：混合使用多个提供商（推荐）

```bash
# 1. 获取多个密钥
REACT_APP_OPENAI_KEY=sk-proj-xxxxx
REACT_APP_GEMINI_KEY=xxxxx
REACT_APP_TOGETHER_KEY=xxxxx

# 2. 根据需求选择提供商
// 便宜的：gpt-4o-mini
// 快的：gemini-2.5-flash
// 聪慧的：gemini-2.5-pro
```

### 方案C：本地部署（完全免费）

```bash
# 1. 安装Ollama：https://ollama.ai
# 2. 启动服务
ollama serve

# 3. 拉取模型
ollama pull llama3.1

# 4. 使用
const response = await chat('你好', {
  provider: 'ollama',
  modelId: 'llama3.1',
  baseUrl: 'http://localhost:11434/v1'
})
```

---

## 📊 成本估算工具

```typescript
interface ModelPricing {
  inputCost: number    // 每百万tokens
  outputCost: number   // 每百万tokens
}

const pricing: Record<string, ModelPricing> = {
  'gpt-4o': { inputCost: 5, outputCost: 15 },
  'gpt-4o-mini': { inputCost: 0.15, outputCost: 0.60 },
  'gemini-2.5-pro': { inputCost: 1.25, outputCost: 2.5 },
  'gemini-2.5-flash': { inputCost: 0.075, outputCost: 0.30 },
  'claude-3.5-sonnet': { inputCost: 3, outputCost: 15 },
  'llama3.1': { inputCost: 0, outputCost: 0 }
}

function estimateCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  const rate = pricing[modelId] || { inputCost: 1, outputCost: 1 }
  return (inputTokens * rate.inputCost + outputTokens * rate.outputCost) / 1_000_000
}

// 示例：1000个输入token + 500个输出token
console.log(estimateCost(1000, 500, 'gpt-4o-mini'))         // $0.000000
console.log(estimateCost(1000, 500, 'gemini-2.5-flash'))    // $0.000225
console.log(estimateCost(1000, 500, 'gpt-4o'))              // $0.000008
console.log(estimateCost(1000, 500, 'llama3.1'))            // $0.000000
```

---

## 🌐 多模型应用示例

```typescript
// src/services/multiProviderService.ts

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  model?: string
}

export class MultiProviderChat {
  private history: ConversationMessage[] = []

  async addMessage(
    userMessage: string,
    modelId: string = 'gpt-4o-mini'
  ): Promise<string> {
    this.history.push({ role: 'user', content: userMessage, model: modelId })

    // 获取不同模型的响应并比较
    const [response1, response2] = await Promise.all([
      chat(userMessage, { provider: 'openai', modelId: 'gpt-4o-mini' }),
      chat(userMessage, { provider: 'gemini', modelId: 'gemini-2.5-flash' })
    ])

    this.history.push({ role: 'assistant', content: response1, model: 'gpt-4o-mini' })

    return response1
  }

  getHistory(): ConversationMessage[] {
    return this.history
  }

  clear() {
    this.history = []
  }
}
```

---

## 🔍 故障排查

### 问题1：API密钥无效

```typescript
// 检查密钥
async function validateAPIKey(key: string, provider: string): Promise<boolean> {
  try {
    const response = await fetch(`${getEndpoint(provider)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    })
    return response.ok
  } catch {
    return false
  }
}
```

### 问题2：模型不存在

```typescript
// 列出可用模型
async function listAvailableModels(provider: string): Promise<string[]> {
  const response = await fetch(`${getEndpoint(provider)}/models`, {
    headers: { 'Authorization': `Bearer ${getApiKey(provider)}` }
  })
  const data = await response.json()
  return data.data.map((m: any) => m.id)
}
```

### 问题3：超时

```typescript
// 添加超时控制
async function chatWithTimeout(
  message: string,
  config: AIConfig,
  timeoutMs = 30000
): Promise<string> {
  return Promise.race([
    chat(message, config),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('API call timeout')), timeoutMs)
    )
  ])
}
```

---

## 📚 完整模型列表（2024-2025）

### OpenAI系
- `gpt-4-turbo` - 上一代旗舰
- `gpt-4o` - 最新全能
- `gpt-4o-mini` - 轻量级
- `gpt-3.5-turbo` - 入门级

### Google系
- `gemini-2.5-pro` - 新一代旗舰
- `gemini-2.5-flash` - 性价比之王
- `gemini-2.5-flash-lite` - 超轻量
- `gemini-2.0-flash` - 稳定版本

### Anthropic系
- `claude-3-5-sonnet-20241022` - 最新
- `claude-3-opus` - 最强推理
- `claude-3-haiku` - 轻量级

### 开源系（Ollama/Together）
- `llama3.1` - Meta最新
- `llama3.0` - 稳定版本
- `mistral` - 欧洲之星
- `neural-chat` - 轻量对话

---

**现在就选择一个模型，开始你的AI应用开发吧！** 🚀
