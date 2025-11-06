interface ApiConfig {
  provider: 'openai' | 'gemini'
  apiKey: string
  baseUrl: string
  model: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CallAIParams {
  message: string
  config: ApiConfig
  conversationHistory: Message[]
}

export async function callAI({ message, config, conversationHistory }: CallAIParams): Promise<string> {
  if (config.provider === 'openai') {
    return callOpenAI(message, config, conversationHistory)
  } else if (config.provider === 'gemini') {
    return callGemini(message, config, conversationHistory)
  } else {
    throw new Error('未支持的 AI 提供商')
  }
}

async function callOpenAI(message: string, config: ApiConfig, conversationHistory: Message[]): Promise<string> {
  const url = `${config.baseUrl}/chat/completions`

  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: message }
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || '调用 OpenAI API 失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(message: string, config: ApiConfig, conversationHistory: Message[]): Promise<string> {
  const url = `${config.baseUrl}chat/completions`

  const messages = [
    ...conversationHistory,
    { role: 'user', content: message }
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || '调用 Gemini API 失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
