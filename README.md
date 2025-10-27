# HueyChat

一个基于 Tauri v2 构建的现代化桌面聊天应用。

## 技术栈

### 前端技术
- **构建工具**: Vite v5.4.8
- **桌面框架**: Tauri v2.1.0
- **前端架构**: 模块化 ES6 JavaScript
- **样式系统**: 组件化 CSS 模块

## 项目架构

### 模块化结构
```
src/
├── js/                    # JavaScript 模块
│   ├── main.js           # 应用主入口
│   ├── api.js            # API 配置和调用
│   ├── auth.js           # 用户认证管理
│   ├── storage.js        # 本地存储管理
│   ├── chat-manager.js   # 聊天功能管理
│   ├── ui-manager.js     # 界面更新管理
│   ├── modals.js         # 模态框管理
│   ├── notifications.js  # 通知系统
│   ├── message-formatter.js  # 消息格式化
│   ├── context-menu.js   # 右键菜单
│   ├── event-handlers.js # 事件处理
│   ├── form-handlers.js  # 表单处理
│   └── password-checker.js   # 密码强度检查
└── styles/               # CSS 样式模块
    ├── base.css         # 基础样式
    ├── layout.css       # 布局样式
    ├── sidebar.css      # 侧边栏样式
    ├── chat-main.css    # 聊天主区域样式
    ├── messages.css     # 消息样式
    ├── code-blocks.css  # 代码块样式
    ├── modals.css       # 模态框样式
    ├── buttons.css      # 按钮样式
    └── ...              # 其他组件样式
```

## 快速开始

### 环境要求

- Node.js 16.0+
- Rust 1.70+ (用于 Tauri)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

启动前端开发服务器：
```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run tauri build
```

## 配置说明

### API 配置
API 基础配置位于 `src/js/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1'
};
```

### 数据存储
- **聊天数据**: localStorage 本地存储
- **用户信息**: JWT Token + 用户信息缓存
- **积分信息**: 后端数据库实时同步


## 许可证

MIT License - 详见 LICENSE 文件

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！