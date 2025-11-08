# 快速导航卡片 - 30秒快速了解

## 🚀 你应该读什么？

### 🎯 如果你想... → 读这个 → 需时

| 需求 | 文档 | 时间 |
|------|------|------|
| **快速上手写代码** | [现代模型配置指南](./MODERN_MODELS_CONFIG.md) - "快速启动三大方案" | 10分钟 |
| **理解基本原理** | [AI开发完整指南](./AI_APPLICATION_DEVELOPMENT_GUIDE.md) - 前3章 | 30分钟 |
| **实现流式输出** | [streamingService.ts](./src/services/streamingService.ts) - 直接用 | 5分钟 |
| **系统学习路线** | [学习资源索引](../AI_LEARNING_RESOURCES.md) | 20分钟 |
| **了解改动内容** | [改动总结](./WHAT_CHANGED.md) | 5分钟 |

---

## 💻 立即开始（5分钟）

### 第1步：选择一个AI提供商

```bash
# 方案A: 完全免费（推荐新手）
ollama pull llama3.1
ollama serve

# 方案B: 便宜（$0.15-0.60 per 1M tokens）
# 访问 https://platform.openai.com/api-keys
# 获取 GPT-4o mini 密钥

# 方案C: 聪慧但便宜（$1.25-2.5 per 1M tokens）
# 访问 https://aistudio.google.com/app/apikey
# 获取 Gemini 2.5 Flash 密钥
```

### 第2步：复制流式输出代码

```typescript
// 从 streamingService.ts 复制这段
import { useStream } from '../services/streamingService'

export function ChatBox() {
  const { output, loading, stream, stop } = useStream()
  
  return (
    <div>
      <button onClick={() => stream('你好', {
        provider: 'openai',
        modelId: 'gpt-4o-mini',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: process.env.REACT_APP_OPENAI_KEY
      })}>
        发送
      </button>
      <div>{output}</div>
    </div>
  )
}
```

### 第3步：运行 & 学习

```bash
npm install
npm run dev
```

---

## 📚 文档速览

### AI_APPLICATION_DEVELOPMENT_GUIDE.md (⭐ 推荐首读)
- 📖 941行完整指南
- 🎯 针对你的水平
- 📝 包含5个完整代码示例
- 🕐 60分钟深度阅读

**包含**：API模式 → 通用化集成 → 流式输出 → 模型生态 → 最佳实践

---

### MODERN_MODELS_CONFIG.md (⭐ 快速参考)
- 🔧 683行实用指南  
- 💰 成本表、模型对比
- 🚀 快速启动方案
- 🕐 30分钟快速扫读

**包含**：模型选择 → API配置 → 代码集成 → 故障排查

---

### streamingService.ts (⭐ 可直接用)
- 💾 391行生产级代码
- ✅ 支持所有主流API
- 🔌 React Hook集成
- 📚 详细中文注释

**包含**：OpenAI兼容 / Gemini / Ollama / 重试机制 / 成本计算

---

### AI_LEARNING_RESOURCES.md (根目录)
- 🗺️ 完整学习地图
- 📋 4周学习计划
- 🎓 任务清单
- 🔗 资源索引

---

## 🤖 模型快速选择

```
我想要...        →  选择这个模型      →  成本    →  获取密钥
────────────────────────────────────────────────────────
最便宜           →  GPT-4o mini      →  $0.15  →  OpenAI
最快             →  Gemini Flash     →  $0.08  →  Google
最聪慧           →  Gemini Pro       →  $1.25  →  Google  
最强编码         →  Claude Sonnet    →  $3     →  Anthropic
完全免费/离线    →  Llama3.1 (本地)  →  $0     →  Ollama
```

---

## 💡 3个最重要的概念

### 1️⃣ API密钥（5秒理解）
```
类似你的银行卡号，用于调用API时身份认证
⚠️ 不要分享，不要提交到GitHub
✅ 保存在 .env.local 文件
```

### 2️⃣ 流式输出（15秒理解）
```
✗ 传统方式：[等待中...]  [等待中...]  [等待中...] 完整响应
✓ 流式方式：你  好  吗  ？  我  很  好

效果：用户实时看到AI响应，体验更好
实现：使用 streamingService.ts
```

### 3️⃣ OpenAI兼容API（30秒理解）
```
现在的标准格式：所有API都支持这种格式
┌─────────────────────────────────┐
│  OpenAI          ✓              │
│  Ollama          ✓              │
│  LM Studio       ✓              │
│  Mistral         ✓              │
│  Together        ✓              │
│  Many others...  ✓              │
└─────────────────────────────────┘

好处：学一种格式，用于所有API！
```

---

## 🎯 你的学习路线

```
第1天 (30min)
↓
阅读本卡片 + 快速启动方案
│
↓ 
第2-3天 (2-3小时)
↓
阅读 AI_APPLICATION_DEVELOPMENT_GUIDE.md 前4章
│
↓
第4-5天 (2-3小时)
↓
实现第一个流式聊天应用 (使用 streamingService.ts)
│
↓
第6-7天 (2-3小时)
↓
支持多个AI提供商，添加模型选择器
│
↓
完成！你已掌握核心知识 🎉
```

---

## ⚡ 最常用的代码片段

### 简单调用（非流式）
```typescript
const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '你好' }]
  })
})
const data = await response.json()
console.log(data.choices[0].message.content)
```

### 流式调用（推荐）
```typescript
const { output, stream } = useStream()

stream('你好', {
  provider: 'openai',
  modelId: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: process.env.REACT_APP_OPENAI_KEY
})
```

---

## 🔗 关键链接

- 📖 [完整学习指南](./AI_APPLICATION_DEVELOPMENT_GUIDE.md)
- 🔧 [模型配置指南](./MODERN_MODELS_CONFIG.md)
- 💻 [流式输出代码](./src/services/streamingService.ts)
- 🗺️ [学习资源索引](../AI_LEARNING_RESOURCES.md)
- 📋 [改动总结](./WHAT_CHANGED.md)

---

## ❓ 常见问题（30秒答案）

**Q: 我是否需要所有的API密钥？**
A: 不需要。选1-2个就够了。建议先用Ollama（免费）或GPT-4o mini（最便宜）

**Q: 哪个文档最重要？**
A: AI_APPLICATION_DEVELOPMENT_GUIDE.md。这是理论基础。

**Q: 我能直接用streamingService.ts吗？**
A: 可以！它已经是生产级代码，包含完整注释。

**Q: 学完这些要多久？**
A: 4周系统学习，或如果只想快速上手，1-2天即可。

**Q: 这对我工作有帮助吗？**
A: 绝对有。学完后你能从"用AI"升级到"构建AI应用"。

---

## 🚀 立即行动

1. **现在就打开**：[AI_APPLICATION_DEVELOPMENT_GUIDE.md](./AI_APPLICATION_DEVELOPMENT_GUIDE.md)
2. **或者先快速尝试**：按上面的"立即开始（5分钟）"

**你准备好了吗？** 🎯

开始你的AI应用开发之旅吧！
