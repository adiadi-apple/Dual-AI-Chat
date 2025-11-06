import { useState } from 'react'
import '../styles/SettingsPanel.css'

interface ApiConfig {
  provider: 'openai' | 'gemini'
  apiKey: string
  baseUrl: string
  model: string
}

interface SettingsPanelProps {
  apiConfig: ApiConfig
  onConfigChange: (config: ApiConfig) => void
  onClose: () => void
}

const MODELS = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash']
}

export default function SettingsPanel({
  apiConfig,
  onConfigChange,
  onClose
}: SettingsPanelProps) {
  const [config, setConfig] = useState(apiConfig)

  const handleProviderChange = (provider: 'openai' | 'gemini') => {
    const newConfig = { ...config, provider }
    
    if (provider === 'openai') {
      newConfig.baseUrl = 'https://api.openai.com/v1'
      newConfig.model = 'gpt-3.5-turbo'
    } else {
      newConfig.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/'
      newConfig.model = 'gemini-1.5-pro'
    }
    
    setConfig(newConfig)
  }

  const handleSave = () => {
    onConfigChange(config)
    onClose()
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>API 配置</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>AI 提供商</label>
            <div className="provider-tabs">
              <button
                className={`tab ${config.provider === 'openai' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openai')}
              >
                OpenAI
              </button>
              <button
                className={`tab ${config.provider === 'gemini' ? 'active' : ''}`}
                onClick={() => handleProviderChange('gemini')}
              >
                Google Gemini
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="apiKey">API 密钥</label>
            <input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={`输入 ${config.provider === 'openai' ? 'OpenAI' : 'Gemini'} API 密钥`}
            />
            <small>
              {config.provider === 'openai' 
                ? '从 https://platform.openai.com/api-keys 获取'
                : '从 https://aistudio.google.com/app/apikey 获取'}
            </small>
          </div>

          <div className="setting-group">
            <label htmlFor="baseUrl">API 基础 URL</label>
            <input
              id="baseUrl"
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="API 基础 URL"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="model">模型</label>
            <select
              id="model"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
            >
              {MODELS[config.provider].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="info-box">
            <p>💡 <strong>如何获取 API 密钥？</strong></p>
            {config.provider === 'openai' ? (
              <>
                <p>1. 访问 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">OpenAI 平台</a></p>
                <p>2. 点击右上角用户头像 → API keys</p>
                <p>3. 创建新的 Secret key</p>
                <p>4. 复制并粘贴到上方密钥字段</p>
              </>
            ) : (
              <>
                <p>1. 访问 <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
                <p>2. 点击左侧 "Get API key"</p>
                <p>3. 选择 "Create API key"</p>
                <p>4. 复制并粘贴到上方密钥字段</p>
              </>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} className="btn btn-secondary">取消</button>
          <button onClick={handleSave} className="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  )
}
