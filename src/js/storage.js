// 聊天数据存储管理
export class ChatStorage {
  constructor() {
    this.chats = this.loadChats();
  }

  // 从localStorage加载聊天数据
  loadChats() {
    const stored = localStorage.getItem('hueychat_conversations');
    return stored ? JSON.parse(stored) : {};
  }

  // 保存聊天数据到localStorage
  saveChats() {
    localStorage.setItem('hueychat_conversations', JSON.stringify(this.chats));
  }

  // 创建新聊天
  createChat(prompt = ' ') {
    const chatId = Date.now().toString();
    this.chats[chatId] = {
      id: chatId,
      prompt: prompt,
      messages: [],
      title: '新对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveChats();
    return chatId;
  }

  // 获取聊天
  getChat(chatId) {
    return this.chats[chatId] || null;
  }

  // 获取所有聊天列表（按更新时间排序）
  getAllChats() {
    return Object.values(this.chats)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // 添加消息到聊天
  addMessage(chatId, role, content) {
    const chat = this.chats[chatId];
    if (chat) {
      chat.messages.push({
        id: Date.now().toString(),
        role: role, // 'user' 或 'assistant'
        content: content,
        timestamp: new Date().toISOString()
      });
      
      // 如果是第一条消息，自动生成标题
      if (chat.messages.length === 1) {
        chat.title = content.slice(0, 20) + (content.length > 20 ? '...' : '');
      }
      
      chat.updatedAt = new Date().toISOString();
      this.saveChats();
    }
  }

  // 删除聊天
  deleteChat(chatId) {
    if (this.chats[chatId]) {
      delete this.chats[chatId];
      this.saveChats();
      return true;
    }
    return false;
  }

  // 更新聊天prompt
  updateChatPrompt(chatId, prompt) {
    const chat = this.chats[chatId];
    if (chat) {
      chat.prompt = prompt;
      chat.updatedAt = new Date().toISOString();
      this.saveChats();
      return true;
    }
    return false;
  }

  // 获取聊天消息
  getChatMessages(chatId) {
    const chat = this.chats[chatId];
    return chat ? chat.messages : [];
  }
}