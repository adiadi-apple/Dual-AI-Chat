# Dual AI Chat - 两个AI+用户对话功能 一步一步实现教学

## 📚 目录

1. [系统概览](#系统概览)
2. [核心概念](#核心概念)
3. [从零开始构建](#从零开始构建)
4. [模块详解](#模块详解)
5. [完整实现示例](#完整实现示例)
6. [常见问题解答](#常见问题解答)

---

## 系统概览

### 什么是 Dual AI Chat？

Dual AI Chat 是一个创新的 AI 对话系统，特点是：

- **两个独立的AI角色**：
  - **Cognito（逻辑型AI）**: 专注于分析、逻辑、准确性
  - **Muse（创意型AI）**: 专注于创意、多角度思考、挑战性观点

- **对话流程**：
  1. 用户提交问题
  2. Cognito 提出初步观点
  3. Muse 提出质疑和另外的角度
  4. 两个AI继续讨论到达共识
  5. Cognito 给出最终答案

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面 (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  输入框 (ChatInput) │ 消息气泡 (MessageBubble)      │   │
│  │  便签板 (Notepad)  │ 设置面板 (SettingsModal)      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────────────────┘
                 │
    ┌────────────┴─────────────┐
    │   Chat Logic Layer        │
    │  (useChatLogic Hook)      │
    └────────────┬──────────────┘
                 │
    ┌────────────┴─────────────────────┐
    │                                   │
    ▼                                   ▼
┌─────────────┐                   ┌─────────────┐
│   Gemini    │                   │   OpenAI    │
│   Service   │                   │   Service   │
└─────────────┘                   └─────────────┘
    │                                   │
    ▼                                   ▼
  Google AI API                    OpenAI API/兼容API
```

---

## 核心概念

### 1. 消息类型系统

应用使用两个核心的 enum 类型来组织消息流：

#### MessageSender（消息发送者）
```typescript
enum MessageSender {
  User = '用户',           // 用户输入的消息
  Cognito = 'Cognito',     // 逻辑型AI
  Muse = 'Muse',          // 创意型AI
  System = '系统'          // 系统通知
}
```

#### MessagePurpose（消息目的）
```typescript
enum MessagePurpose {
  UserInput = 'user-input',           // 用户输入
  SystemNotification = 'system-notification',  // 系统通知
  CognitoToMuse = 'cognito-to-muse',  // Cognito 发给 Muse 的消息（不显示给用户）
  MuseToCognito = 'muse-to-cognito',  // Muse 发给 Cognito 的消息（不显示给用户）
  FinalResponse = 'final-response'    // Cognito 的最终答案（显示给用户）
}
```

### 2. 完整的消息对象

```typescript
interface ChatMessage {
  id: string;                    // 唯一标识符
  text: string;                  // 消息内容
  sender: MessageSender;         // 谁发送的
  purpose: MessagePurpose;       // 消息的用途
  timestamp: Date;               // 时间戳
  durationMs?: number;           // AI生成耗时（毫秒）
  image?: {                      // 可选的图像
    dataUrl: string;             // base64 URL
    name: string;
    type: string;
  };
}
```

### 3. 讨论模式

系统支持两种讨论模式：

#### 模式 A: AI驱动模式（AiDriven）
- AI 自主决定何时结束讨论
- 适合处理复杂问题
- Cognito 和 Muse 会自动判断何时达成共识

#### 模式 B: 固定轮次模式（FixedTurns）
- 指定 Cognito 和 Muse 之间对话的轮次
- 更可控，结果更一致
- 适合处理需要多个角度审视的问题

---

## 从零开始构建

### 步骤 1: 项目初始化

#### 1.1 创建项目结构

```bash
mkdir my-dual-ai-chat
cd my-dual-ai-chat
npm init -y
```

#### 1.2 安装依赖

```bash
npm install react react-dom
npm install @google/genai         # 用于 Gemini API
npm install typescript            # TypeScript 支持
npm install vite                  # 构建工具
npm install -D @types/react @types/react-dom
```

#### 1.3 配置 TypeScript

创建 `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  }
}
```

### 步骤 2: 定义类型系统

创建 `types.ts`:

```typescript
// 消息发送者枚举
export enum MessageSender {
  User = '用户',
  Cognito = 'Cognito',
  Muse = 'Muse',
  System = '系统',
}

// 消息目的枚举
export enum MessagePurpose {
  UserInput = 'user-input',
  SystemNotification = 'system-notification',
  CognitoToMuse = 'cognito-to-muse',
  MuseToCognito = 'muse-to-cognito',
  FinalResponse = 'final-response',
}

// 聊天消息接口
export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  purpose: MessagePurpose;
  timestamp: Date;
  durationMs?: number;
  image?: {
    dataUrl: string;
    name: string;
    type: string;
  };
}

// 讨论模式枚举
export enum DiscussionMode {
  FixedTurns = 'fixed',
  AiDriven = 'ai-driven',
}
```

### 步骤 3: 创建 API 服务层

#### 3.1 Gemini 服务 - `services/geminiService.ts`

```typescript
import { GoogleGenAI } from "@google/genai";

interface GeminiResponsePayload {
  text: string;
  durationMs: number;
  error?: string;
}

export const generateResponse = async (
  prompt: string,
  modelName: string,
  apiKey: string,
  systemInstruction?: string,
  thinkingConfig?: { thinkingBudget: number }
): Promise<GeminiResponsePayload> => {
  const startTime = performance.now();
  
  try {
    if (!apiKey) {
      return { 
        text: "API 密钥未配置", 
        durationMs: performance.now() - startTime,
        error: "API key not configured"
      };
    }

    const genAI = new GoogleGenAI({ apiKey });

    const configForApi: any = {};
    if (systemInstruction) {
      configForApi.systemInstruction = systemInstruction;
    }
    if (thinkingConfig) {
      configForApi.thinkingConfig = thinkingConfig;
    }

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: Object.keys(configForApi).length > 0 ? configForApi : undefined,
    });

    const durationMs = performance.now() - startTime;
    return { text: response.text, durationMs };

  } catch (error) {
    const durationMs = performance.now() - startTime;
    let errorMessage = "与AI通信时发生错误";
    
    if (error instanceof Error) {
      errorMessage = `错误: ${error.message}`;
    }
    
    return { 
      text: errorMessage, 
      durationMs, 
      error: "API call failed"
    };
  }
};
```

#### 3.2 OpenAI 兼容服务 - `services/openaiService.ts`

```typescript
interface OpenAIResponse {
  text: string;
  durationMs: number;
  error?: string;
}

export const generateOpenAiResponse = async (
  prompt: string,
  modelId: string,
  apiKey: string,
  apiBaseUrl: string,
  systemInstruction?: string
): Promise<OpenAIResponse> => {
  const startTime = performance.now();
  
  try {
    if (!apiKey) {
      return {
        text: "OpenAI API 密钥未配置",
        durationMs: performance.now() - startTime,
        error: "API key not configured"
      };
    }

    const url = `${apiBaseUrl}/chat/completions`;

    const messages: any[] = [];
    
    if (systemInstruction) {
      messages.push({
        role: "system",
        content: systemInstruction
      });
    }

    messages.push({
      role: "user",
      content: prompt
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    const durationMs = performance.now() - startTime;
    return { text, durationMs };

  } catch (error) {
    const durationMs = performance.now() - startTime;
    let errorMessage = "与OpenAI通信时发生错误";
    
    if (error instanceof Error) {
      errorMessage = `错误: ${error.message}`;
    }
    
    return {
      text: errorMessage,
      durationMs,
      error: "API call failed"
    };
  }
};
```

### 步骤 4: 创建核心 Hook - Chat Logic

创建 `hooks/useChatLogic.ts`:

```typescript
import { useState, useRef, useCallback } from 'react';
import { ChatMessage, MessageSender, MessagePurpose, DiscussionMode } from '../types';
import { generateResponse as generateGeminiResponse } from '../services/geminiService';
import { generateOpenAiResponse } from '../services/openaiService';

interface UseChatLogicProps {
  addMessage: (
    text: string,
    sender: MessageSender,
    purpose: MessagePurpose,
    durationMs?: number
  ) => void;
  
  // 模型配置
  cognitoModelName: string;
  museModelName: string;
  apiKey: string;
  
  // 系统提示词
  cognitoSystemPrompt: string;
  museSystemPrompt: string;
  
  // 讨论配置
  discussionMode: DiscussionMode;
  manualFixedTurns: number;
}

export const useChatLogic = ({
  addMessage,
  cognitoModelName,
  museModelName,
  apiKey,
  cognitoSystemPrompt,
  museSystemPrompt,
  discussionMode,
  manualFixedTurns,
}: UseChatLogicProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const cancelRequestRef = useRef(false);

  // 执行单个 AI 调用
  const callAI = useCallback(async (
    prompt: string,
    modelName: string,
    sender: MessageSender,
    systemPrompt: string
  ): Promise<{ text: string; durationMs: number }> => {
    return generateGeminiResponse(
      prompt,
      modelName,
      apiKey,
      systemPrompt
    );
  }, [apiKey]);

  // 主要对话流程
  const startDualAIDiscussion = useCallback(async (userMessage: string) => {
    if (isLoading || !userMessage.trim()) return;
    
    setIsLoading(true);
    cancelRequestRef.current = false;

    try {
      // 第1步: 用户消息已经在 UI 中添加
      // 第2步: Cognito 提出初步观点
      const cognitoPrompt = `用户问题: ${userMessage}\n\n请提出您的初步观点和分析。`;
      
      const cognitoResponse = await callAI(
        cognitoPrompt,
        cognitoModelName,
        MessageSender.Cognito,
        cognitoSystemPrompt
      );

      if (cancelRequestRef.current) return;

      // 添加 Cognito 到 Muse 的消息（内部讨论）
      addMessage(
        cognitoResponse.text,
        MessageSender.Cognito,
        MessagePurpose.CognitoToMuse,
        cognitoResponse.durationMs
      );

      // 第3步: Muse 提出质疑和另外的角度
      const musePrompt = `Cognito 的观点: ${cognitoResponse.text}\n\n用户原始问题: ${userMessage}\n\n请提出您的批评和另外的角度。`;
      
      const museResponse = await callAI(
        musePrompt,
        museModelName,
        MessageSender.Muse,
        museSystemPrompt
      );

      if (cancelRequestRef.current) return;

      addMessage(
        museResponse.text,
        MessageSender.Muse,
        MessagePurpose.MuseToCognito,
        museResponse.durationMs
      );

      // 第4步: 继续讨论（根据讨论模式决定轮次）
      let turnCount = 1;
      const maxTurns = discussionMode === DiscussionMode.FixedTurns 
        ? manualFixedTurns 
        : Infinity;

      while (turnCount < maxTurns && !cancelRequestRef.current) {
        // Cognito 回应 Muse
        const cognitoReplyPrompt = `
之前的讨论：
Cognito: ${cognitoResponse.text}
Muse: ${museResponse.text}

请回应 Muse 的质疑，并提出更深入的分析。
`;
        
        const cognitoReply = await callAI(
          cognitoReplyPrompt,
          cognitoModelName,
          MessageSender.Cognito,
          cognitoSystemPrompt
        );

        if (cancelRequestRef.current) return;

        addMessage(
          cognitoReply.text,
          MessageSender.Cognito,
          MessagePurpose.CognitoToMuse,
          cognitoReply.durationMs
        );

        // 检查是否应该结束讨论
        if (discussionMode === DiscussionMode.AiDriven && 
            cognitoReply.text.includes('<DISCUSSION_COMPLETE>')) {
          break;
        }

        turnCount++;
      }

      // 第5步: Cognito 给出最终答案
      const finalPrompt = `基于与 Muse 的讨论，请给出对用户问题的最终答案: ${userMessage}`;
      
      const finalResponse = await callAI(
        finalPrompt,
        cognitoModelName,
        MessageSender.Cognito,
        cognitoSystemPrompt
      );

      if (cancelRequestRef.current) return;

      addMessage(
        finalResponse.text,
        MessageSender.Cognito,
        MessagePurpose.FinalResponse,
        finalResponse.durationMs
      );

    } catch (error) {
      console.error("讨论出错:", error);
      addMessage(
        "讨论过程中出现错误，请重试。",
        MessageSender.System,
        MessagePurpose.SystemNotification
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage, callAI, cognitoModelName, museModelName, 
      cognitoSystemPrompt, museSystemPrompt, discussionMode, manualFixedTurns]);

  const cancelRequest = useCallback(() => {
    cancelRequestRef.current = true;
  }, []);

  return {
    isLoading,
    startDualAIDiscussion,
    cancelRequest
  };
};
```

### 步骤 5: 创建 UI 组件

#### 5.1 消息气泡组件 - `components/MessageBubble.tsx`

```typescript
import React from 'react';
import { ChatMessage, MessageSender, MessagePurpose } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // 只显示以下类型的消息给用户
  const shouldDisplay = [
    MessagePurpose.UserInput,
    MessagePurpose.FinalResponse,
    MessagePurpose.SystemNotification
  ].includes(message.purpose);

  if (!shouldDisplay) return null;

  // 根据发送者确定样式
  const isUser = message.sender === MessageSender.User;
  const isSystem = message.sender === MessageSender.System;

  return (
    <div style={{
      marginBottom: '16px',
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: isSystem 
          ? '#FEE2E2' 
          : isUser 
            ? '#3B82F6' 
            : '#E5E7EB',
        color: isSystem ? '#991B1B' : isUser ? '#FFFFFF' : '#000000',
        wordWrap: 'break-word',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {message.sender}
          {message.durationMs && (
            <span style={{ fontSize: '12px', marginLeft: '8px' }}>
              ({message.durationMs.toFixed(0)}ms)
            </span>
          )}
        </div>
        <div>{message.text}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
```

#### 5.2 聊天输入组件 - `components/ChatInput.tsx`

```typescript
import React, { useState } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  isLoading,
  onCancel 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入您的问题..."
        disabled={isLoading}
        style={{
          flex: 1,
          padding: '12px',
          border: '1px solid #D1D5DB',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        style={{
          padding: '12px 24px',
          backgroundColor: isLoading ? '#9CA3AF' : '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {isLoading ? '处理中...' : '发送'}
      </button>
      {isLoading && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          取消
        </button>
      )}
    </form>
  );
};

export default ChatInput;
```

#### 5.3 主应用组件 - `App.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { ChatMessage, MessageSender, MessagePurpose, DiscussionMode } from './types';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import { useChatLogic } from './hooks/useChatLogic';
import { generateUniqueId } from './utils/helpers';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((
    text: string,
    sender: MessageSender,
    purpose: MessagePurpose,
    durationMs?: number
  ): string => {
    const id = generateUniqueId();
    const newMessage: ChatMessage = {
      id,
      text,
      sender,
      purpose,
      timestamp: new Date(),
      durationMs
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  const {
    isLoading,
    startDualAIDiscussion,
    cancelRequest
  } = useChatLogic({
    addMessage,
    cognitoModelName: 'gemini-2.5-pro',
    museModelName: 'gemini-2.5-pro',
    apiKey: process.env.REACT_APP_API_KEY || '',
    cognitoSystemPrompt: '你是 Cognito，一个逻辑严谨的 AI。',
    museSystemPrompt: '你是 Muse，一个富有创意且善于批判的 AI。',
    discussionMode: DiscussionMode.AiDriven,
    manualFixedTurns: 3
  });

  const handleSubmitMessage = useCallback((userMessage: string) => {
    // 添加用户消息
    addMessage(userMessage, MessageSender.User, MessagePurpose.UserInput);

    // 启动 AI 讨论
    startDualAIDiscussion(userMessage);
  }, [addMessage, startDualAIDiscussion]);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>🤖 Dual AI Chat - 双AI对话</h1>
      
      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '16px',
        height: '500px',
        overflowY: 'auto',
        marginBottom: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#9CA3AF',
            paddingTop: '48px'
          }}>
            开始对话吧！提出一个问题，让 Cognito 和 Muse 来帮您分析。
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      <ChatInput 
        onSubmit={handleSubmitMessage}
        isLoading={isLoading}
        onCancel={cancelRequest}
      />
    </div>
  );
};

export default App;
```

---

## 模块详解

### 模块 1: 消息管理系统

**文件**: `types.ts`

系统的核心是消息的分类。每条消息都有两个重要属性：

- **sender**: 发送者（用户、Cognito、Muse、系统）
- **purpose**: 目的（什么类型的消息）

**为什么这样设计？**

1. **灵活性**: 同一个发送者可以有不同目的的消息
2. **可追溯性**: 方便调试和记录讨论过程
3. **UI 渲染**: 可以根据 purpose 决定是否展示给用户
4. **流程控制**: 系统可以根据 purpose 决定下一步行动

**示例流程**:
```
用户输入 "如何学习 AI?" 
  ↓
Cognito → Muse: "我认为应该从基础开始..." (CognitoToMuse - 不显示给用户)
  ↓
Muse → Cognito: "但你忽视了实战的重要性..." (MuseToCognito - 不显示给用户)
  ↓
Cognito → 用户: "综合考虑，学习路径是..." (FinalResponse - 显示给用户)
```

### 模块 2: 服务层（API 集成）

#### Gemini 服务特点

```typescript
// 关键特性

// 1. 思考预算（Thinking Budget）- 用于深度推理
{
  thinkingConfig: { thinkingBudget: 24576 }
}

// 2. 系统指令
{
  systemInstruction: "你是一个逻辑严谨的分析师..."
}

// 3. 多模态支持（文字 + 图像）
{
  imagePart: {
    inlineData: {
      mimeType: "image/jpeg",
      data: "base64_encoded_image"
    }
  }
}
```

#### OpenAI 兼容性

应用支持 OpenAI 格式的 API，这意味着你可以使用：

- OpenAI 官方 API
- Ollama（本地运行）
- LM Studio（本地运行）
- Together.ai
- 任何兼容 OpenAI 格式的服务

**配置示例**:
```typescript
// 使用 Ollama
{
  apiBaseUrl: "http://localhost:11434/v1",
  modelId: "mistral",
  apiKey: "ollama" // Ollama 不需要真实密钥
}

// 使用 LM Studio
{
  apiBaseUrl: "http://localhost:1234/v1",
  modelId: "local-model",
  apiKey: "lm-studio"
}
```

### 模块 3: useChatLogic Hook - 核心业务逻辑

这个 hook 是整个系统的大脑。它负责：

1. **流程编排**: 控制 Cognito 和 Muse 何时发言
2. **重试机制**: API 调用失败时自动重试
3. **取消机制**: 用户可以中止长时间运行的讨论
4. **错误处理**: 捕获和报告各种错误

**关键函数**:

```typescript
// 1. commonAIStepExecution - 执行单个 AI 调用
//    ├─ 处理重试逻辑
//    ├─ 解析 AI 响应
//    └─ 错误处理

// 2. startDualAIDiscussionFlow - 启动完整讨论
//    ├─ 步骤1: Cognito 提出初步观点
//    ├─ 步骤2: Muse 提出质疑
//    ├─ 步骤3-N: 继续对话（根据模式）
//    └─ 最后: Cognito 给出最终答案

// 3. handleUserQuery - 处理用户输入
//    └─ 调用 startDualAIDiscussionFlow
```

### 模块 4: UI 层组件

#### MessageBubble 组件

**责任**:
- 根据消息类型渲染不同样式
- 显示发送者和耗时
- 处理消息文本换行

**渲染规则**:
```
用户消息 → 右对齐, 蓝色背景
AI 最终答案 → 左对齐, 灰色背景
系统通知 → 左对齐, 红色背景
```

#### ChatInput 组件

**责任**:
- 捕获用户输入
- 提交消息
- 显示加载状态
- 提供取消功能

---

## 完整实现示例

### 示例 1: 简单的两步对话

```typescript
// 用户提问: "如何写好代码？"

// 步骤1: Cognito 分析
const cognitoResponse = await generateGeminiResponse(
  "用户问题: 如何写好代码？\n请提出您的初步观点。",
  "gemini-2.5-pro",
  apiKey,
  "你是 Cognito，一个逻辑严谨的分析师..."
);
// 输出: "好代码需要：1. 清晰的命名 2. 模块化设计 3. 充分的测试..."

// 步骤2: Muse 批判
const museResponse = await generateGeminiResponse(
  "Cognito 说: ...你的回答...\n请提出批判和另外的角度。",
  "gemini-2.5-pro",
  apiKey,
  "你是 Muse，富有创意且善于批判..."
);
// 输出: "但你忽视了代码的表达性和创意性...考虑业务需求..."

// 步骤3: Cognito 最终答案
const finalResponse = await generateGeminiResponse(
  "综合与 Muse 的讨论，请给出最终答案: 如何写好代码？",
  "gemini-2.5-pro",
  apiKey,
  "你是 Cognito..."
);
// 输出: "综合考虑，好代码应该：1. 符合业务需求 2. 易于维护 3. 富有表达性..."
```

### 示例 2: 固定轮次讨论

```typescript
// 设置: 固定轮次 = 3

// 轮次1: Cognito → Muse
// 轮次2: Muse → Cognito
// 轮次3: Cognito → Muse
// 轮次4: Cognito 最终答案 ✓

const discussionMode = DiscussionMode.FixedTurns;
const manualFixedTurns = 3;

for (let turn = 1; turn <= manualFixedTurns; turn++) {
  if (turn % 2 === 1) {
    // Cognito 发言
  } else {
    // Muse 发言
  }
}
// 然后 Cognito 给最终答案
```

### 示例 3: AI 驱动模式

```typescript
// AI 自主决定何时结束
const discussionMode = DiscussionMode.AiDriven;

// 当 Cognito 的回应包含 "<DISCUSSION_COMPLETE>" 标签时，自动结束讨论
if (cognitoResponse.text.includes('<DISCUSSION_COMPLETE>')) {
  // 结束讨论，给出最终答案
}
```

### 示例 4: 错误处理和重试

```typescript
// 自动重试机制
const MAX_AUTO_RETRIES = 3;
let retryCount = 0;

while (retryCount <= MAX_AUTO_RETRIES) {
  try {
    const result = await generateGeminiResponse(...);
    if (result.error) {
      throw new Error(result.error);
    }
    // 成功
    break;
  } catch (error) {
    retryCount++;
    if (retryCount <= MAX_AUTO_RETRIES) {
      // 等待后重试
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
    }
  }
}
```

---

## 常见问题解答

### Q1: 如何自定义 AI 的性格和风格？

**A**: 通过修改系统提示词（systemPrompt）：

```typescript
const customCognitoPrompt = `
你是 Cognito，一个专门从事数据科学的分析师。
你的特点是:
- 总是用数据说话
- 关注统计显著性
- 提醒用户潜在的数据偏差
- 用 Python 代码示例解释概念
`;

const customMusePrompt = `
你是 Muse，一个创意产品经理。
你的特点是:
- 从用户体验角度思考
- 挑战技术复杂性
- 提出创新的解决方案
- 关注市场趋势
`;
```

### Q2: 如何集成自己的数据库或知识库？

**A**: 在提示词中包含上下文：

```typescript
// 从数据库获取相关信息
const context = await fetchRelevantInfo(userQuery);

// 将上下文加入到提示词中
const enrichedPrompt = `
背景信息:
${context}

用户问题: ${userQuery}

请基于以上背景信息回答用户的问题。
`;

const response = await generateGeminiResponse(
  enrichedPrompt,
  modelName,
  apiKey
);
```

### Q3: 如何处理很长的讨论历史？

**A**: 实现一个简单的摘要机制：

```typescript
// 当讨论历史超过某个长度时，创建摘要
const HISTORY_SUMMARY_THRESHOLD = 4000; // 字符数

let discussionHistory = '';

if (discussionHistory.length > HISTORY_SUMMARY_THRESHOLD) {
  const summary = await generateGeminiResponse(
    `请用 200 字摘要以下讨论的关键点：\n${discussionHistory}`,
    modelName,
    apiKey
  );
  
  discussionHistory = `[摘要]\n${summary.text}\n\n[最新讨论]\n...`;
}
```

### Q4: 如何在手机上部署这个应用？

**A**: 使用 Vercel 或 Netlify：

```bash
# 1. 构建应用
npm run build

# 2. 连接到 Vercel
npm i -g vercel
vercel

# 3. 在 Vercel 仪表板设置环境变量
# REACT_APP_API_KEY=your_api_key
```

### Q5: 成本如何计算？

**A**: 每次 API 调用都会产生成本：

```typescript
// 估算成本（以 Gemini 为例）
const estimateCost = (promptTokens: number, responseTokens: number) => {
  // Gemini 2.5 Pro: $0.075/100K prompt tokens, $0.30/100K response tokens
  const promptCost = (promptTokens / 100000) * 0.075;
  const responseCost = (responseTokens / 100000) * 0.30;
  return promptCost + responseCost;
};

// 每次讨论可能需要 3-5 次 API 调用
// 一个完整讨论的成本约为: $0.01 - $0.05
```

### Q6: 如何处理 API 限流？

**A**: 实现退避策略：

```typescript
const generateWithBackoff = async (
  prompt: string,
  modelName: string,
  maxRetries = 3
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateGeminiResponse(prompt, modelName, apiKey);
    } catch (error) {
      if (error.message.includes('429') && attempt < maxRetries - 1) {
        // 限流错误，等待后重试
        const backoffMs = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      } else {
        throw error;
      }
    }
  }
};
```

---

## 总结

Dual AI Chat 的核心优势：

✅ **两个角度**: 逻辑和创意的结合  
✅ **自动讨论**: AI 自主完成对话  
✅ **灵活配置**: 固定轮次或自驱动  
✅ **多 API 支持**: Gemini、OpenAI、Ollama、LM Studio  
✅ **生产就绪**: 错误处理、重试、取消功能完整  

**下一步**:
1. 尝试修改系统提示词
2. 实现多轮讨论后自动保存
3. 添加讨论导出为 PDF 功能
4. 构建讨论历史检索系统

Happy coding! 🚀
