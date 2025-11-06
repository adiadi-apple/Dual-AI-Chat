import { useState, useRef } from 'react'
import '../styles/ChatInput.css'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  loading: boolean
  onClear: () => void
}

export default function ChatInput({ onSendMessage, loading, onClear }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSendMessage(input)
      setInput('')
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input-wrapper">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息... (Shift+Enter 换行)"
        disabled={loading}
        className="chat-input"
      />
      <div className="chat-input-actions">
        <button
          onClick={onClear}
          disabled={loading}
          className="btn btn-secondary"
          title="清除对话"
        >
          🗑️
        </button>
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="btn btn-primary"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  )
}
