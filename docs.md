# HueyChat API 接口文档

## 项目概述

HueyChat 是一个基于 Tauri 构建的 AI 伴侣应用，支持角色扮演聊天、语音交互等功能。

**技术架构：**
- 前端：Tauri (Rust + Web)
- 后端：RESTful API
- 存储：本地存储 + 云端同步
- 主要功能：文字聊天、语音聊天、TTS、角色扮演

## 📋 接口目录

### 🔐 [1. 用户管理系统](#1-用户管理系统)
- [1.1 用户注册](#11-用户注册) - `POST /api/v1/auth/register`
- [1.2 用户登录](#12-用户登录) - `POST /api/v1/auth/login`
- [1.3 刷新令牌](#13-刷新令牌) - `POST /api/v1/auth/refresh`
- [1.4 获取用户信息](#14-获取用户信息) - `GET /api/v1/user/profile`
- [1.5 更新用户信息](#15-更新用户信息) - `PUT /api/v1/user/profile`

### 🎭 [2. 角色管理系统](#2-角色管理系统)
- [2.1 获取角色列表](#21-获取角色列表) - `GET /api/v1/characters`
- [2.2 创建自定义角色](#22-创建自定义角色) - `POST /api/v1/characters`
- [2.3 更新角色](#23-更新角色) - `PUT /api/v1/characters/{characterId}`
- [2.4 删除角色](#24-删除角色) - `DELETE /api/v1/characters/{characterId}`
- [2.5 获取角色详情](#25-获取角色详情) - `GET /api/v1/characters/{characterId}`

### 📝 [3. Prompts 管理系统](#3-prompts-管理系统)
- [3.1 获取用户 Prompts](#31-获取用户-prompts) - `GET /api/v1/prompts`
- [3.2 创建 Prompt](#32-创建-prompt) - `POST /api/v1/prompts`
- [3.3 更新 Prompt](#33-更新-prompt) - `PUT /api/v1/prompts/{promptId}`
- [3.4 删除 Prompt](#34-删除-prompt) - `DELETE /api/v1/prompts/{promptId}`

### 💬 [4. 聊天系统](#4-聊天系统)
- [4.1 发送消息](#41-发送消息) - `POST /api/v1/chat/send`
- [4.2 获取对话列表](#42-获取对话列表) - `GET /api/v1/conversations`
- [4.3 获取对话历史](#43-获取对话历史) - `GET /api/v1/conversations/{conversationId}/messages`
- [4.4 删除对话](#44-删除对话) - `DELETE /api/v1/conversations/{conversationId}`
- [4.5 WebSocket 实时聊天](#45-websocket-实时聊天) - `WS /api/v1/chat/ws`

### 🔊 [5. TTS 语音系统](#5-tts-语音系统)
- [5.1 文本转语音](#51-文本转语音) - `POST /api/v1/tts/synthesize`
- [5.2 获取可用语音列表](#52-获取可用语音列表) - `GET /api/v1/tts/voices`
- [5.3 语音设置](#53-语音设置) - `POST /api/v1/user/voice-settings`

### 🔄 [6. 数据同步系统](#6-数据同步系统)
- [6.1 同步本地数据到服务器](#61-同步本地数据到服务器) - `POST /api/v1/sync/upload`
- [6.2 从服务器下载数据](#62-从服务器下载数据) - `GET /api/v1/sync/download`
- [6.3 获取同步状态](#63-获取同步状态) - `GET /api/v1/sync/status`

### 🧠 [10. 记忆与情感系统](#10-记忆与情感系统)
- [10.1 记忆管理](#101-记忆管理) - `GET /api/v1/memory/{conversationId}`
- [10.2 更新记忆](#102-更新记忆) - `POST /api/v1/memory/{conversationId}/update`
- [10.3 情感状态管理](#103-情感状态管理) - `GET /api/v1/emotions/{conversationId}/current`
- [10.4 上下文摘要](#104-上下文摘要) - `POST /api/v1/conversations/{conversationId}/summarize`
- [10.5 智能上下文检索](#105-智能上下文检索) - `POST /api/v1/conversations/{conversationId}/context-search`

### 🎨 [11. 拟人化增强系统](#11-拟人化增强系统)
- [11.1 个性化响应生成](#111-个性化响应生成) - `POST /api/v1/characters/{characterId}/response-style`
- [11.2 语言风格配置](#112-语言风格配置) - `PUT /api/v1/characters/{characterId}/speech-pattern`
- [11.3 动态人格调整](#113-动态人格调整) - `POST /api/v1/characters/{characterId}/personality-evolution`

### 🔗 [其他章节](#其他章节)
- [7. 通用响应格式](#7-通用响应格式)
- [8. 错误代码说明](#8-错误代码说明)
- [9. 限制说明](#9-限制说明)
- [12. 扩展功能预留](#12-扩展功能预留)

---

## 1. 用户管理系统

### 1.1 用户注册
```
POST /api/v1/auth/register
```

**请求体：**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "confirmPassword": "string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 1.2 用户登录
```
POST /api/v1/auth/login
```

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "userId": "uuid",
      "username": "string",
      "email": "string",
      "avatar": "url",
      "preferences": {
        "theme": "dark|light",
        "language": "zh-CN|en-US",
        "voiceEnabled": true
      }
    }
  }
}
```

### 1.3 刷新令牌
```
POST /api/v1/auth/refresh
```

### 1.4 获取用户信息
```
GET /api/v1/user/profile
Authorization: Bearer {token}
```

### 1.5 更新用户信息
```
PUT /api/v1/user/profile
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "username": "string",
  "avatar": "file|url",
  "preferences": {
    "theme": "dark|light",
    "language": "zh-CN|en-US",
    "voiceEnabled": true,
    "ttsVoice": "voice_id"
  }
}
```

---

## 2. 角色管理系统

### 2.1 获取角色列表
```
GET /api/v1/characters
Authorization: Bearer {token}
```

**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
- `category`: 角色分类
- `search`: 搜索关键词

**响应：**
```json
{
  "success": true,
  "data": {
    "characters": [
      {
        "characterId": "uuid",
        "name": "小艾",
        "description": "温柔贴心的AI伴侣",
        "avatar": "url",
        "category": "companion",
        "personality": ["温柔", "体贴", "聪明"],
        "prompt": "你是一个温柔贴心的AI伴侣...",
        "isDefault": true,
        "isPublic": true,
        "createdBy": "system|userId",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### 2.2 创建自定义角色
```
POST /api/v1/characters
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "name": "string",
  "description": "string",
  "avatar": "file|url",
  "category": "string",
  "personality": ["string"],
  "prompt": "string",
  "voice": {
    "voiceId": "string",
    "speed": 1.0,
    "pitch": 1.0
  },
  "isPublic": false
}
```

### 2.3 更新角色
```
PUT /api/v1/characters/{characterId}
Authorization: Bearer {token}
```

### 2.4 删除角色
```
DELETE /api/v1/characters/{characterId}
Authorization: Bearer {token}
```

### 2.5 获取角色详情
```
GET /api/v1/characters/{characterId}
Authorization: Bearer {token}
```

---

## 3. Prompts 管理系统

### 3.1 获取用户 Prompts
```
GET /api/v1/prompts
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "promptId": "uuid",
        "title": "日常对话模板",
        "content": "请扮演一个...",
        "category": "daily",
        "tags": ["对话", "日常"],
        "isDefault": false,
        "usageCount": 15,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 3.2 创建 Prompt
```
POST /api/v1/prompts
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"]
}
```

### 3.3 更新 Prompt
```
PUT /api/v1/prompts/{promptId}
Authorization: Bearer {token}
```

### 3.4 删除 Prompt
```
DELETE /api/v1/prompts/{promptId}
Authorization: Bearer {token}
```

---

## 4. 聊天系统

### 4.1 发送消息
```
POST /api/v1/chat/send
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "conversationId": "uuid|null",
  "characterId": "uuid",
  "message": {
    "type": "text|voice|image",
    "content": "string",
    "audioData": "base64|url",
    "imageData": "base64|url"
  },
  "context": {
    "promptId": "uuid",
    "customPrompt": "string"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "response": {
      "type": "text",
      "content": "string",
      "audioUrl": "url",
      "emotions": ["happy", "excited"],
      "metadata": {
        "model": "gpt-4",
        "tokens": 150,
        "responseTime": 1.2
      }
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 获取对话列表
```
GET /api/v1/conversations
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversationId": "uuid",
        "title": "与小艾的对话",
        "characterId": "uuid",
        "characterName": "小艾",
        "lastMessage": "今天天气真不错！",
        "lastMessageTime": "2024-01-01T00:00:00Z",
        "messageCount": 25,
        "isArchived": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 4.3 获取对话历史
```
GET /api/v1/conversations/{conversationId}/messages
Authorization: Bearer {token}
```

**查询参数：**
- `page`: 页码
- `limit`: 每页数量
- `before`: 获取指定时间之前的消息

### 4.4 删除对话
```
DELETE /api/v1/conversations/{conversationId}
Authorization: Bearer {token}
```

### 4.5 WebSocket 实时聊天
```
WS /api/v1/chat/ws
Authorization: Bearer {token}
```

**消息格式：**
```json
{
  "type": "message|typing|status",
  "conversationId": "uuid",
  "data": {}
}
```

---

## 5. TTS 语音系统

### 5.1 文本转语音
```
POST /api/v1/tts/synthesize
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "text": "string",
  "voiceId": "string",
  "settings": {
    "speed": 1.0,
    "pitch": 1.0,
    "volume": 1.0,
    "emotion": "neutral|happy|sad|excited"
  },
  "format": "mp3|wav|ogg"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "audioUrl": "url",
    "audioData": "base64",
    "duration": 5.2,
    "format": "mp3",
    "metadata": {
      "voiceId": "string",
      "textLength": 50,
      "processingTime": 0.8
    }
  }
}
```

### 5.2 获取可用语音列表
```
GET /api/v1/tts/voices
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "voiceId": "voice_001",
        "name": "小雨",
        "gender": "female",
        "language": "zh-CN",
        "description": "温柔甜美的女声",
        "sampleUrl": "url",
        "isPremium": false,
        "tags": ["温柔", "年轻", "甜美"]
      }
    ]
  }
}
```

### 5.3 语音设置
```
POST /api/v1/user/voice-settings
Authorization: Bearer {token}
```

---

## 6. 数据同步系统

### 6.1 同步本地数据到服务器
```
POST /api/v1/sync/upload
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "dataType": "conversations|characters|prompts|settings",
  "data": {},
  "lastSyncTime": "2024-01-01T00:00:00Z",
  "deviceId": "string"
}
```

### 6.2 从服务器下载数据
```
GET /api/v1/sync/download
Authorization: Bearer {token}
```

**查询参数：**
- `dataType`: 数据类型
- `since`: 获取指定时间之后的更新

### 6.3 获取同步状态
```
GET /api/v1/sync/status
Authorization: Bearer {token}
```

---

## 7. 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 状态码说明
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `429`: 请求过于频繁
- `500`: 服务器内部错误

---

## 8. 错误代码说明

| 错误代码 | 描述 |
|---------|------|
| `AUTH_TOKEN_EXPIRED` | 认证令牌已过期 |
| `AUTH_TOKEN_INVALID` | 认证令牌无效 |
| `USER_NOT_FOUND` | 用户不存在 |
| `CHARACTER_NOT_FOUND` | 角色不存在 |
| `CONVERSATION_NOT_FOUND` | 对话不存在 |
| `PROMPT_NOT_FOUND` | Prompt 不存在 |
| `VOICE_NOT_AVAILABLE` | 语音不可用 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 |
| `INSUFFICIENT_CREDITS` | 积分不足 |

---

## 9. 限制说明

- **请求频率限制**: 100 请求/分钟
- **文件上传限制**: 最大 10MB
- **TTS 字数限制**: 单次最大 1000 字
- **对话历史限制**: 保留最近 10000 条消息
- **角色数量限制**: 免费用户最多 5 个自定义角色

---

## 10. 记忆与情感系统

### 10.1 记忆管理
```
GET /api/v1/memory/{conversationId}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "shortTermMemory": [
      {
        "messageId": "uuid",
        "content": "用户提到喜欢爬山",
        "importance": 0.8,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "longTermMemory": {
      "userProfile": {
        "interests": ["爬山", "摄影", "音乐"],
        "personality": "外向、乐观",
        "preferences": {
          "chatStyle": "轻松幽默",
          "topics": ["旅行", "美食"]
        }
      },
      "relationshipMemory": {
        "importantMoments": [
          {
            "event": "第一次聊天",
            "date": "2024-01-01",
            "description": "用户分享了工作压力",
            "emotion": "empathetic"
          }
        ],
        "emotionalBond": 0.75
      }
    }
  }
}
```

### 10.2 更新记忆
```
POST /api/v1/memory/{conversationId}/update
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "memoryType": "user_info|relationship|preference",
  "data": {
    "key": "interest",
    "value": "喜欢看科幻电影",
    "importance": 0.7,
    "category": "hobby"
  }
}
```

### 10.3 情感状态管理
```
GET /api/v1/emotions/{conversationId}/current
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "currentEmotion": {
      "primary": "happy",
      "secondary": "excited", 
      "intensity": 0.8,
      "cause": "用户分享了好消息",
      "duration": 300
    },
    "emotionHistory": [
      {
        "emotion": "curious",
        "intensity": 0.6,
        "timestamp": "2024-01-01T10:00:00Z",
        "trigger": "用户问了新问题"
      }
    ],
    "basePersonality": {
      "openness": 0.8,
      "conscientiousness": 0.7,
      "extraversion": 0.9,
      "agreeableness": 0.8,
      "neuroticism": 0.2
    }
  }
}
```

### 10.4 上下文摘要
```
POST /api/v1/conversations/{conversationId}/summarize
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "messageRange": {
    "start": "messageId",
    "end": "messageId"
  },
  "summaryType": "key_points|emotional|relationship"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "summary": "用户分享了最近的工作压力，表达了对周末计划的期待。情绪从焦虑转为期待。",
    "keyPoints": [
      "工作项目deadline临近",
      "计划周末去爬山放松",
      "对新餐厅很感兴趣"
    ],
    "emotionalJourney": [
      { "emotion": "stressed", "intensity": 0.7, "context": "工作话题" },
      { "emotion": "hopeful", "intensity": 0.8, "context": "周末计划" }
    ],
    "importantTopics": ["工作", "休闲活动", "美食"]
  }
}
```

### 10.5 智能上下文检索
```
POST /api/v1/conversations/{conversationId}/context-search
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "query": "之前聊过的电影",
  "searchType": "semantic|keyword|emotion",
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "limit": 10
}
```

---

## 11. 拟人化增强系统

### 11.1 个性化响应生成
```
POST /api/v1/characters/{characterId}/response-style
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "baseResponse": "今天天气很好",
  "context": {
    "userMood": "happy",
    "conversationTone": "casual",
    "relationshipLevel": "close_friend"
  },
  "personalityAdjustments": {
    "humor": 0.8,
    "empathy": 0.9,
    "enthusiasm": 0.7
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "styledResponse": "哇～今天天气超棒的！看你心情也很不错呢，要不要一起出去走走？☀️",
    "responseMetadata": {
      "styleElements": ["enthusiastic_tone", "emoji_usage", "suggestion"],
      "emotionExpressed": "cheerful",
      "personalityTraits": ["caring", "energetic"]
    }
  }
}
```

### 11.2 语言风格配置
```
PUT /api/v1/characters/{characterId}/speech-pattern
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "speechPattern": {
    "formality": "casual",
    "verbosity": "moderate",
    "emotiveness": "high",
    "quirks": ["经常用省略号...", "喜欢用语气词呢、呀、哦"],
    "phrases": {
      "agreement": ["对对对！", "没错呢～", "我也觉得"],
      "uncertainty": ["唔...这个", "让我想想呢", "可能是这样？"],
      "excitement": ["哇！", "太棒了！", "真的吗？！"]
    }
  }
}
```

### 11.3 动态人格调整
```
POST /api/v1/characters/{characterId}/personality-evolution
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "interactionData": {
    "userBehavior": "friendly_supportive",
    "conversationOutcome": "positive",
    "topicsDiscussed": ["music", "travel"],
    "emotionalResonance": 0.85
  },
  "adaptationLevel": "subtle|moderate|significant"
}
```

---

## 12. 扩展功能预留

### 12.1 视频聊天接口（预留）
```
POST /api/v1/video/call
WebSocket /api/v1/video/ws
```

### 12.2 多模态情感表达（预留）
```
GET /api/v1/expressions/avatar
POST /api/v1/expressions/generate
```

### 12.3 群聊功能（预留）
```
POST /api/v1/groups
GET /api/v1/groups/{groupId}/messages
```