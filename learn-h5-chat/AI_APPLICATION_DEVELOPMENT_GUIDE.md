# 从开发者到AI应用开发者 - 完整学习指南

> 本指南为已掌握React的开发者设计，帮助你快速学习AI应用开发的核心知识点。

## 📚 目录
1. [核心概念](#核心概念)
2. [API接入模式](#api接入模式)
3. [通用化AI模型集成](#通用化ai模型集成)
4. [流式输出实现](#流式输出实现)
5. [现代AI模型生态](#现代ai模型生态)
6. [最佳实践](#最佳实践)
7. [完整代码示例](#完整代码示例)

---

## 核心概念

### 1. AI API调用的本质
所有AI API本质上都是HTTP请求：
```
用户输入 → 构建请求 → 发送到API → 获取响应 → 展示结果
```

### 2. 三大AI API提供商对比

| 特性 | Google Gemini | OpenAI | 开源/自托管 |
|------|---------------|--------|-----------|
| 接口协议 | Google GenAI SDK / REST | OpenAI SDK / REST | OpenAI兼容格式 |
| 主要模型 | Gemini 2.5系列 | GPT-4系列 | Llama、Mistral等 |
| 特殊功能 | 思考预算(Think) | Vision API | 本地部署 |
| 流式输出 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 启动成本 | 低(免费层) | 按量付费 | 0(自托管) |

### 3. 关键术语

- **模型(Model)**: AI处理引擎的标识符，如 `gpt-4-turbo`、`gemini-2.5-pro`
- **API密钥(API Key)**: 认证凭证，用于标识调用者
- **温度(Temperature)**: 0-2，控制响应的创意度（低=确定，高=创意）
- **Token**: 文本的最小处理单位，1个token≈4个英文字符或1个中文字
- **流式响应(Streaming)**: 逐字返回结果，而非等待完整响应

---

## API接入模式

### 模式1: 直接REST API调用（推荐学习）

所有现代AI API都支持HTTP REST调用，这是最基础的集成方式。

```typescript
// 核心模式：发送请求 → 处理响应
async function callAI(userMessage: string) {
  const response = await fetch('https://api.provider.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: '你是一个有帮助的助手' },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })
  
  const data = await response.json()
  return data.choices[0].message.content
}
```

### 模式2: OpenAI兼容API（本地+云服务通用）

这是现在的工业标准。所有兼容的API使用**相同的请求格式**：

```typescript
// 适用于：OpenAI、Ollama、LM Studio、Mistral、Together等
const providers = {
  'openai': 'https://api.openai.com/v1',
  'ollama': 'http://localhost:11434/v1',
  'lm-studio': 'http://localhost:1234/v1',
  'mistral': 'https://api.mistral.ai/v1',
  'together': 'https://api.together.xyz/v1'
}

async function callOpenAICompatibleAPI(
  message: string,
  baseUrl: string,
  modelId: string,
  apiKey?: string
) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: message }]
    })
  })
  
  return (await response.json()).choices[0].message.content
}
```

### 模式3: 官方SDK（生产环境首选）

每个提供商都提供SDK，用于类型安全和错误处理：

```typescript
// Google Gemini SDK
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const model = genAI.models.getModel('gemini-2.5-pro')
const response = await model.generateContent({ contents: 'Your message' })

// OpenAI SDK
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const response = await client.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Your message' }]
})
```

---

## 通用化AI模型集成

### 关键问题：如何处理不同模型的差异？

不同模型的API有细微差异，我们需要一个**适配层**来统一它们。

### 解决方案：工厂模式 + 适配器

```typescript
// 1. 定义通用接口
interface AIProvider {
  callAI(params: CallParams): Promise<AIResponse>
}

interface CallParams {
  message: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

interface AIResponse {
  text: string
  durationMs: number
  error?: string
}

// 2. 为每个提供商实现适配器
class OpenAIAdapter implements AIProvider {
  constructor(private apiKey: string, private baseUrl: string) {}
  
  async callAI(params: CallParams): Promise<AIResponse> {
    const startTime = performance.now()
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
            { role: 'user', content: params.message }
          ],
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 1000
        })
      })
      
      const data = await response.json()
      return {
        text: data.choices[0].message.content,
        durationMs: performance.now() - startTime
      }
    } catch (error) {
      return {
        text: `错误: ${error.message}`,
        durationMs: performance.now() - startTime,
        error: error.name
      }
    }
  }
}

class GeminiAdapter implements AIProvider {
  constructor(private apiKey: string) {}
  
  async callAI(params: CallParams): Promise<AIResponse> {
    const startTime = performance.now()
    try {
      const genAI = new GoogleGenAI({ apiKey: this.apiKey })
      const model = genAI.models.getModel('gemini-2.5-pro')
      
      const response = await model.generateContent({
        contents: params.message,
        systemInstruction: params.systemPrompt,
        config: {
          temperature: params.temperature,
          maxOutputTokens: params.maxTokens
        }
      })
      
      return {
        text: response.text,
        durationMs: performance.now() - startTime
      }
    } catch (error) {
      return {
        text: `错误: ${error.message}`,
        durationMs: performance.now() - startTime,
        error: error.name
      }
    }
  }
}

// 3. 工厂函数
function createAIProvider(config: {
  provider: 'openai' | 'gemini'
  apiKey: string
  baseUrl?: string
  modelId?: string
}): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIAdapter(config.apiKey, config.baseUrl || '', config.modelId || '')
    case 'gemini':
      return new GeminiAdapter(config.apiKey)
    default:
      throw new Error('不支持的提供商')
  }
}

// 4. 使用
const provider = createAIProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: 'https://api.openai.com/v1'
})

const response = await provider.callAI({
  message: '你好',
  systemPrompt: '你是一个有帮助的助手'
})
```

### 模型能力检测

```typescript
interface ModelCapabilities {
  supportsVision: boolean
  supportsStreaming: boolean
  supportsSystemPrompt: boolean
  maxTokens: number
  costPer1MTokens: {
    input: number
    output: number
  }
}

const modelCapabilities: Record<string, ModelCapabilities> = {
  'gpt-4-turbo': {
    supportsVision: true,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 128000,
    costPer1MTokens: { input: 10, output: 30 }
  },
  'gemini-2.5-pro': {
    supportsVision: true,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 1000000,
    costPer1MTokens: { input: 1.25, output: 2.5 }
  },
  'llama3': {
    supportsVision: false,
    supportsStreaming: true,
    supportsSystemPrompt: true,
    maxTokens: 8192,
    costPer1MTokens: { input: 0, output: 0 }
  }
}

function canUseFeature(modelId: string, feature: 'vision' | 'streaming'): boolean {
  const caps = modelCapabilities[modelId]
  if (feature === 'vision') return caps?.supportsVision ?? false
  if (feature === 'streaming') return caps?.supportsStreaming ?? false
  return false
}
```

---

## 流式输出实现

### 为什么需要流式输出？

- **用户体验**: 实时看到AI在"思考"而不是死等
- **用于长文本**: 1000+token的响应无需等待全部完成
- **成本优化**: 可以提前停止流式响应

### 流式API基础

所有支持流式的API都使用Server-Sent Events (SSE) 格式：

```
data: {"choices":[{"delta":{"content":"你"}}]}
data: {"choices":[{"delta":{"content":"好"}}]}
data: {"choices":[{"delta":{"content":"吗"}}]}
data: [DONE]
```

### 实现流式调用

```typescript
// 通用流式调用函数
async function* streamAI(
  message: string,
  provider: 'openai' | 'gemini',
  config: { apiKey: string; baseUrl: string; model: string }
): AsyncGenerator<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: message }],
      stream: true // 关键：启用流式模式
    })
  })

  if (!response.ok) {
    throw new Error(`API错误: ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// 在React中使用
function ChatComponent() {
  const [text, setText] = useState('')
  
  async function handleStream() {
    setText('') // 清空之前的内容
    
    for await (const chunk of streamAI('你好', 'openai', {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4-turbo'
    })) {
      setText(prev => prev + chunk)
    }
  }
  
  return (
    <>
      <button onClick={handleStream}>发送</button>
      <div>{text}</div>
    </>
  )
}
```

### 流式输出 + TypeScript类型安全

```typescript
interface StreamOptions {
  onChunk?: (chunk: string) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal // 支持中断
}

async function streamAIWithCallbacks(
  message: string,
  config: AIConfig,
  options: StreamOptions
): Promise<string> {
  const chunks: string[] = []
  
  try {
    for await (const chunk of streamAI(message, config)) {
      chunks.push(chunk)
      options.onChunk?.(chunk)
      
      // 支持中断
      if (options.signal?.aborted) {
        throw new Error('流式输出已中断')
      }
    }
    
    options.onComplete?.()
    return chunks.join('')
  } catch (error) {
    options.onError?.(error as Error)
    throw error
  }
}
```

---

## 现代AI模型生态

### 2024-2025 最新模型速查表

#### 顶级推理模型（高智力、高成本）

| 模型 | 提供商 | 发布 | 特点 | API费用 |
|------|--------|------|------|---------|
| **GPT-4o** | OpenAI | 2024/11 | 多模态、快速、准确 | $5/$15 per 1M tokens |
| **Gemini 2.5 Pro** | Google | 2025/01 | 思考预算、超长上下文 | $1.25/$2.5 per 1M tokens |
| **Claude 3.5 Sonnet** | Anthropic | 2024/10 | 推理强、安全性好 | $3/$15 per 1M tokens |
| **Llama 3.1 405B** | Meta | 2024/07 | 开源、自托管、免费 | 自托管成本 |

#### 平衡模型（性价比最优）

| 模型 | 提供商 | 特点 |
|------|--------|------|
| **GPT-4o mini** | OpenAI | 轻量级、成本低 |
| **Gemini 2.5 Flash** | Google | 超快速、低成本 |
| **Claude 3 Haiku** | Anthropic | 精简版Claude |
| **Mistral 7B/8x7B** | Mistral | 开源、高效 |

#### 特化模型

| 用途 | 推荐模型 | 特点 |
|------|---------|------|
| **长文档处理** | Gemini 2.5 Pro (2M tokens) | 百万token上下文 |
| **代码生成** | GPT-4 Turbo / Claude | 代码能力强 |
| **本地部署** | Llama 3.1 / Mistral | 开源、自托管 |
| **实时应用** | GPT-4o mini / Gemini Flash | 快速、低成本 |
| **多模态** | GPT-4o / Gemini 2.5 Pro | 图像、音频处理 |

### 模型参数配置

```typescript
interface ModelConfig {
  modelId: string
  temperature?: number    // 0-2, 默认0.7
  topP?: number          // 0-1, 默认1
  topK?: number          // 1-40, 默认40
  maxTokens?: number
  frequencyPenalty?: number // OpenAI
  presencePenalty?: number  // OpenAI
  thinkingBudget?: number   // Gemini专用
}

// 针对不同场景的参数预设
const paramPresets = {
  // 精确、事实性回答
  precise: {
    temperature: 0.1,
    topP: 0.9,
    maxTokens: 1000
  },
  // 平衡的创意回答
  balanced: {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 1500
  },
  // 高创意回答
  creative: {
    temperature: 1.5,
    topP: 0.95,
    maxTokens: 2000
  },
  // 深度思考（仅Gemini）
  deepThinking: {
    temperature: 0.5,
    thinkingBudget: 24576,
    maxTokens: 4000
  }
}
```

### 如何选择模型？

```typescript
function selectBestModel(useCase: string): string {
  const selection: Record<string, string> = {
    'simple-qa': 'gpt-4o-mini',           // 成本最低
    'complex-reasoning': 'gemini-2.5-pro', // 思考能力强
    'code-generation': 'gpt-4-turbo',     // 代码最优
    'long-document': 'gemini-2.5-pro',    // 百万token上下文
    'cost-sensitive': 'gemini-2.5-flash', // 性价比最优
    'local-deployment': 'llama3.1',        // 本地免费
    'real-time-app': 'gpt-4o-mini',       // 最快
  }
  
  return selection[useCase] || 'gpt-4o-mini'
}
```

---

## 最佳实践

### 1. 错误处理与重试

```typescript
async function callAIWithRetry(
  apiCall: () => Promise<string>,
  maxRetries = 3,
  delayMs = 1000
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      // 指数退避
      const delay = delayMs * Math.pow(2, attempt - 1)
      console.log(`重试 ${attempt}/${maxRetries}，延迟 ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

### 2. 成本优化

```typescript
// 估算token数量
function estimateTokens(text: string): number {
  // 粗略估计：英文1token≈4字符，中文1token≈1字符
  const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishCharCount = text.replace(/[\u4e00-\u9fa5]/g, '').length
  return Math.ceil(chineseCharCount + englishCharCount / 4)
}

// 计算成本
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  modelId: string
): number {
  const prices: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo': { input: 10, output: 30 },
    'gemini-2.5-pro': { input: 1.25, output: 2.5 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 }
  }
  
  const price = prices[modelId] || { input: 0, output: 0 }
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000
}
```

### 3. 缓存策略

```typescript
interface CacheEntry {
  query: string
  response: string
  timestamp: number
  modelId: string
}

class AIResponseCache {
  private cache: CacheEntry[] = []
  private maxSize = 100
  private ttlMs = 24 * 60 * 60 * 1000 // 24小时
  
  async get(query: string, modelId: string): Promise<string | null> {
    const entry = this.cache.find(
      e => e.query === query && 
           e.modelId === modelId && 
           Date.now() - e.timestamp < this.ttlMs
    )
    return entry?.response || null
  }
  
  set(query: string, response: string, modelId: string) {
    this.cache.push({
      query,
      response,
      modelId,
      timestamp: Date.now()
    })
    
    // 限制缓存大小
    if (this.cache.length > this.maxSize) {
      this.cache.shift()
    }
  }
}
```

### 4. 日志与监控

```typescript
interface APICallMetrics {
  modelId: string
  inputTokens: number
  outputTokens: number
  durationMs: number
  cost: number
  timestamp: number
  success: boolean
  errorType?: string
}

class APIMetricsCollector {
  private metrics: APICallMetrics[] = []
  
  record(metric: APICallMetrics) {
    this.metrics.push(metric)
    this.logToAnalytics(metric)
  }
  
  getStats() {
    return {
      totalCalls: this.metrics.length,
      totalCost: this.metrics.reduce((sum, m) => sum + m.cost, 0),
      avgDurationMs: this.metrics.reduce((sum, m) => sum + m.durationMs, 0) / this.metrics.length,
      successRate: this.metrics.filter(m => m.success).length / this.metrics.length,
      costByModel: this.groupByCost()
    }
  }
  
  private groupByCost() {
    return Object.fromEntries(
      Object.entries(
        this.metrics.reduce((acc, m) => {
          acc[m.modelId] = (acc[m.modelId] || 0) + m.cost
          return acc
        }, {} as Record<string, number>)
      )
    )
  }
  
  private logToAnalytics(metric: APICallMetrics) {
    console.log(`[API Call] ${metric.modelId} - ${metric.durationMs}ms - $${metric.cost.toFixed(6)}`)
  }
}
```

---

## 完整代码示例

### 示例1：简单聊天应用

```typescript
// src/services/aiService.ts
export interface AIConfig {
  provider: 'openai' | 'gemini'
  apiKey: string
  baseUrl?: string
  modelId: string
}

export async function chat(
  message: string,
  config: AIConfig,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  if (config.provider === 'openai') {
    return callOpenAIAPI(message, config, history)
  } else if (config.provider === 'gemini') {
    return callGeminiAPI(message, config, history)
  }
  throw new Error('不支持的提供商')
}

async function callOpenAIAPI(
  message: string,
  config: AIConfig,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const response = await fetch(`${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [...history, { role: 'user' as const, content: message }],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API调用失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGeminiAPI(
  message: string,
  config: AIConfig,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // 如果使用官方SDK
  if (typeof window === 'undefined') {
    const { GoogleGenAI } = await import('@google/genai')
    const genAI = new GoogleGenAI({ apiKey: config.apiKey })
    const model = genAI.models.getModel(config.modelId)
    
    const response = await model.generateContent({
      contents: message
    })
    
    return response.text
  }
  
  // 浏览器环境，使用REST API
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
```

### 示例2：带流式输出的React组件

```typescript
// src/components/ChatBox.tsx
import { useState } from 'react'
import { streamAI } from '../services/streamService'

export function ChatBox() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  async function handleSend() {
    if (!input.trim()) return

    setLoading(true)
    setOutput('')
    const controller = new AbortController()
    setAbortController(controller)

    try {
      for await (const chunk of streamAI(input, {
        provider: 'openai',
        apiKey: process.env.REACT_APP_OPENAI_KEY || '',
        baseUrl: 'https://api.openai.com/v1',
        modelId: 'gpt-4o'
      }, controller.signal)) {
        setOutput(prev => prev + chunk)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setOutput(prev => prev + `\n\n[错误] ${error.message}`)
      }
    } finally {
      setLoading(false)
      setAbortController(null)
    }
  }

  function handleStop() {
    abortController?.abort()
  }

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入你的问题..."
        className="w-full p-3 border rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          发送
        </button>
        {loading && (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            停止
          </button>
        )}
      </div>
      {loading && <div className="text-gray-500">处理中...</div>}
      <div className="p-4 bg-gray-100 rounded min-h-24 whitespace-pre-wrap">
        {output || '(等待响应)'}
      </div>
    </div>
  )
}
```

---

## 学习路径建议

### Week 1: 基础概念
- [ ] 理解HTTP API调用基础
- [ ] 学习OpenAI兼容API格式
- [ ] 实现简单的非流式API调用

### Week 2: 进阶集成
- [ ] 实现流式输出
- [ ] 学习适配器模式统一不同API
- [ ] 处理错误和重试

### Week 3: 生产就绪
- [ ] 添加缓存机制
- [ ] 实现成本监控
- [ ] 部署到Vercel

### Week 4: 优化与实践
- [ ] 多模型选择逻辑
- [ ] 性能优化（令牌计算、成本估算）
- [ ] 构建你的第一个AI应用

---

## 快速参考

### 获取API密钥
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Gemini**: https://aistudio.google.com/app/apikey
- **Anthropic Claude**: https://console.anthropic.com/
- **Ollama**: 本地部署，无需密钥

### 常用命令
```bash
# 启动本地Ollama
ollama serve

# 启动LM Studio API服务器
# (通过LM Studio GUI)

# 测试API连接
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

### 费用估算工具

```typescript
// 快速计算成本
const costs = {
  'gpt-4-turbo': { in: 10, out: 30 },      // 每百万tokens
  'gpt-4o': { in: 5, out: 15 },
  'gpt-4o-mini': { in: 0.15, out: 0.60 },
  'gemini-2.5-pro': { in: 1.25, out: 2.5 },
  'gemini-2.5-flash': { in: 0.075, out: 0.30 }
}

function estimateCost(input: number, output: number, model: string) {
  const rate = costs[model] || { in: 1, out: 1 }
  return ((input * rate.in + output * rate.out) / 1_000_000).toFixed(6)
}
```

---

## 相关资源

- 📖 [OpenAI API文档](https://platform.openai.com/docs)
- 📖 [Google Gemini API文档](https://ai.google.dev/docs)
- 📖 [Anthropic Claude文档](https://docs.anthropic.com/)
- 🔧 [Ollama官网](https://ollama.ai/)
- 🔧 [LM Studio](https://lmstudio.ai/)
- 📚 [原项目代码](../dual-ai-chat/) - 完整的生产级实现

---

**准备好开始AI之旅了吗？下一步：选择一个提供商，获取API密钥，构建你的第一个AI应用！**
