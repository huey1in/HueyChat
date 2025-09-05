# HueyChat

一个基于 Tauri 构建的轻量级桌面聊天应用，支持与 AI 助手进行对话。

## 功能特性

- 简洁现代的用户界面
- 多对话管理，支持创建和删除聊天
- 集成 AI 助手（支持 Gemini 2.0 Flash 模型）
- 自定义 Prompt 设置
- 本地数据存储
- 代码块语法高亮和复制功能
- 响应式布局设计

## 技术栈

- **前端**: HTML, CSS, JavaScript
- **构建工具**: Vite
- **桌面应用框架**: Tauri v2
- **AI 服务**: OpenAI 兼容 API

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建应用

```bash
npm run tauri build
```

## 使用说明

1. **创建新对话**: 点击左侧栏的"+"按钮创建新的聊天会话
2. **设置 Prompt**: 右键聊天列表项选择"修改设定"来自定义对话的系统提示词
3. **发送消息**: 在底部输入框输入消息，按回车或点击发送按钮
4. **删除对话**: 右键聊天列表项选择删除

## 配置

应用使用的 AI 服务配置位于 `src/main.js` 文件中的 `AI_CONFIG` 对象，包括：

- `baseURL`: API 服务地址
- `apiKey`: API 密钥
- `model`: 使用的模型名称

## 数据存储

聊天记录使用浏览器的 localStorage 进行本地存储，包括：

- 聊天历史消息
- 自定义 Prompt 设置
- 会话元数据

## 开发

### 项目结构

```
hueychat/
├── src/
│   ├── main.js          # 主要应用逻辑
│   └── style.css        # 样式文件
├── src-tauri/           # Tauri 后端代码
├── index.html           # 主页面
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

### 自定义样式

应用使用自定义 CSS 实现现代化界面，支持：
- 响应式布局
- 平滑过渡动画
- 自定义滚动条
- 代码语法高亮

## 许可证

MIT License