import '../styles/ChatMessage.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.content.split('\n').map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
      <div className="message-time">
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}
