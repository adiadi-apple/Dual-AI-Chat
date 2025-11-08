/**
 * 流式输出服务 - 支持所有主流AI API的流式响应
 * 
 * 使用场景：
 * - 长文本生成（提升用户体验）
 * - 实时对话（显示AI正在"思考"）
 * - 减少等待感（即时反馈）
 * 
 * 支持的提供商：OpenAI、Gemini、Ollama、LM Studio、Together等
 */

interface StreamConfig {
  provider: 'openai' | 'gemini' | 'ollama'
  apiKey?: string
  baseUrl: string
  modelId: string
}

interface StreamOptions {
  onChunk?: (chunk: string) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal // 支持取消流式输出
}

/**
 * OpenAI兼容API的流式调用（最通用）
 * 适用于：OpenAI、Ollama、LM Studio、Mistral、Together等
 * 
 * @example
 * ```typescript
 * const stream = streamOpenAICompatible('你好', {
 *   provider: 'openai',
 *   baseUrl: 'https://api.openai.com/v1',
 *   modelId: 'gpt-4o',
 *   apiKey: process.env.OPENAI_API_KEY
 * })
 * 
 * for await (const chunk of stream) {
 *   console.log(chunk)
 * }
 * ```
 */
export async function* streamOpenAICompatible(
  message: string,
  config: StreamConfig,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const requestBody = {
    model: config.modelId,
    messages: [
      { role: 'user', content: message }
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1000
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    },
    body: JSON.stringify(requestBody),
    signal
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `API error: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          // 流结束标记
          if (data === '[DONE]') {
            return
          }

          // 解析SSE数据
          if (data) {
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              // 忽略JSON解析错误（可能是不完整的数据）
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Google Gemini API的流式调用
 * 
 * @example
 * ```typescript
 * const stream = streamGemini('你好', {
 *   provider: 'gemini',
 *   baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
 *   modelId: 'gemini-2.5-pro',
 *   apiKey: process.env.GEMINI_API_KEY
 * })
 * ```
 */
export async function* streamGemini(
  message: string,
  config: StreamConfig,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const url = `${config.baseUrl}/models/${config.modelId}:streamGenerateContent?key=${config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: message }
          ]
        }
      ]
    }),
    signal
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Gemini API error: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line)
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              yield text
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

/**
 * 统一的流式调用接口
 * 根据提供商自动选择对应的流式方法
 * 
 * @example
 * ```typescript
 * const stream = stream('你好', {
 *   provider: 'openai',
 *   modelId: 'gpt-4o',
 *   apiKey: process.env.OPENAI_API_KEY,
 *   baseUrl: 'https://api.openai.com/v1'
 * })
 * 
 * for await (const chunk of stream) {
 *   setOutput(prev => prev + chunk)
 * }
 * ```
 */
export async function* stream(
  message: string,
  config: StreamConfig,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  switch (config.provider) {
    case 'gemini':
      yield* streamGemini(message, config, signal)
      break
    case 'openai':
    case 'ollama':
    default:
      yield* streamOpenAICompatible(message, config, signal)
      break
  }
}

/**
 * React Hook: useStream
 * 在React组件中使用流式输出
 * 
 * @example
 * ```typescript
 * function ChatComponent() {
 *   const { output, loading, error, stream: startStream, stop } = useStream()
 *   
 *   const handleSend = () => {
 *     startStream('你好', { provider: 'openai', ... })
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSend}>发送</button>
 *       {loading && <button onClick={stop}>停止</button>}
 *       <div>{output}</div>
 *       {error && <div className="error">{error}</div>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useStream() {
  const [output, setOutput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const startStream = async (
    message: string,
    config: StreamConfig,
    onChunk?: (chunk: string) => void
  ) => {
    setOutput('')
    setError(null)
    setLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      for await (const chunk of stream(
        message,
        config,
        abortControllerRef.current.signal
      )) {
        setOutput(prev => prev + chunk)
        onChunk?.(chunk)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const stop = () => {
    abortControllerRef.current?.abort()
  }

  return {
    output,
    loading,
    error,
    stream: startStream,
    stop
  }
}

/**
 * 高级用法：带重试和超时的流式调用
 * 
 * @example
 * ```typescript
 * const result = await streamWithRetry(
 *   '你好',
 *   config,
 *   {
 *     maxRetries: 3,
 *     timeoutMs: 30000,
 *     onChunk: (chunk) => console.log(chunk)
 *   }
 * )
 * ```
 */
export async function streamWithRetry(
  message: string,
  config: StreamConfig,
  options: {
    maxRetries?: number
    timeoutMs?: number
    onChunk?: (chunk: string) => void
    onError?: (error: Error) => void
    onComplete?: () => void
  } = {}
) {
  const maxRetries = options.maxRetries ?? 3
  const timeoutMs = options.timeoutMs ?? 30000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      for await (const chunk of stream(message, config, controller.signal)) {
        options.onChunk?.(chunk)
      }

      clearTimeout(timeoutId)
      options.onComplete?.()
      return

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        options.onError?.(new Error('请求超时'))
      }

      if (attempt === maxRetries) {
        options.onError?.(error as Error)
        throw error
      }

      // 指数退避
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * 实用工具：Token计数（粗略估计）
 * 真实token数需要通过API获取
 */
export function estimateTokens(text: string): number {
  // 粗略估计：英文 1 token ≈ 4 字符，中文 1 token ≈ 1 字符
  const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishCount = text.replace(/[\u4e00-\u9fa5]/g, '').length
  return Math.ceil(chineseCount + englishCount / 4)
}

/**
 * 成本计算器
 */
export const costCalculator = {
  // 每百万tokens的成本 (USD)
  'gpt-4o': { input: 5, output: 15 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gemini-2.5-pro': { input: 1.25, output: 2.5 },
  'gemini-2.5-flash': { input: 0.075, output: 0.30 },
  'llama3.1': { input: 0, output: 0 },
  
  calculate(inputTokens: number, outputTokens: number, modelId: string): number {
    const rate = costCalculator[modelId as keyof typeof costCalculator] || { input: 0, output: 0 }
    return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
  }
}

// React导入（仅在浏览器环境使用此服务时需要）
import * as React from 'react'
