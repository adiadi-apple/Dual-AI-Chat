import { useState } from 'react'
import ChatContainer from './components/ChatContainer'
import SettingsPanel from './components/SettingsPanel'
import './App.css'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfig, setApiConfig] = useState({
    provider: 'openai' as 'openai' | 'gemini',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  })

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>🤖 学习 H5 聊天</h1>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ 设置
        </button>
      </header>

      <div className="app-content">
        <ChatContainer apiConfig={apiConfig} />
        {showSettings && (
          <SettingsPanel 
            apiConfig={apiConfig}
            onConfigChange={setApiConfig}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  )
}
