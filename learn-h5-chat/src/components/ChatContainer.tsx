import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { callAI } from '../services/aiService'
import '../styles/ChatContainer.css'

export interface ApiConfig {
  provider: 'openai' | 'gemini'
  apiKey: string
  baseUrl: string
  model: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function ChatContainer({ apiConfig }: { apiConfig: ApiConfig }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 欢迎使用 H5 聊天学习应用！\n\n我可以帮助你学习如何构建聊天界面。请先在设置中配置 AI API 密钥，然后开始对话。',
      timestamp: Date.now()
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, newMessage])
    setLoading(true)
    setError(null)

    try {
      if (!apiConfig.apiKey) {
        throw new Error('请先在设置中配置 API 密钥')
      }

      const response = await callAI({
        message: content,
        config: apiConfig,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发生错误，请重试'
      setError(errorMessage)
      console.error('AI 调用错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '对话已清除。开始新的对话吧！',
        timestamp: Date.now()
      }
    ])
    setError(null)
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && (
          <div className="message assistant-message">
            <div className="message-content loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        {error && (
          <div className="message error-message">
            <div className="message-content">⚠️ {error}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        loading={loading}
        onClear={handleClearChat}
      />
    </div>
  )
}
