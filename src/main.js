import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

let messageInputEl;
let sendButtonEl;
let currentChatId = null;

// AI API配置
const AI_CONFIG = {
  baseURL: 'https://aistudio.yinxh.fun',
  apiKey: 'IgoXHB6d2YuUet7EkWhDrrhOhmzM1xaT',
  model: 'gemini-2.0-flash'
};

// 聊天数据结构
class ChatStorage {
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
    if (!this.chats[chatId]) return;
    
    this.chats[chatId].messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    // 更新聊天标题（使用第一条用户消息的前8个字符）
    if (role === 'user' && this.chats[chatId].messages.filter(m => m.role === 'user').length === 1) {
      this.chats[chatId].title = content.length > 8 ? content.substring(0, 8) + '...' : content;
    }
    
    this.chats[chatId].updatedAt = new Date().toISOString();
    this.saveChats();
  }

  // 获取聊天的消息历史（用于API请求）
  getChatHistory(chatId) {
    const chat = this.getChat(chatId);
    if (!chat) return [];
    
    const messages = [];
    
    // 如果有prompt且不是空格，添加system消息
    if (chat.prompt && chat.prompt.trim()) {
      messages.push({
        role: 'system',
        content: chat.prompt.trim()
      });
    }
    
    // 添加聊天历史
    messages.push(...chat.messages.map(m => ({
      role: m.role,
      content: m.content
    })));
    
    return messages;
  }

  // 删除聊天
  deleteChat(chatId) {
    delete this.chats[chatId];
    this.saveChats();
  }

  // 更新聊天prompt
  updateChatPrompt(chatId, prompt) {
    if (!this.chats[chatId]) return;
    this.chats[chatId].prompt = prompt;
    this.chats[chatId].updatedAt = new Date().toISOString();
    this.saveChats();
  }
}

// 全局聊天存储实例
const chatStorage = new ChatStorage();

// 调用AI API
async function callAI(userMessage, chatId) {
  try {
    // 获取当前聊天的完整历史（包含prompt）
    const chatHistory = chatStorage.getChatHistory(chatId);
    
    // 添加当前用户消息
    const messages = [
      ...chatHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await fetch(`${AI_CONFIG.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI API调用错误:', error);
    throw error;
  }
}

// 发送消息函数
async function sendMessage() {
  const messageText = messageInputEl.value.trim();
  if (!messageText || sendButtonEl.disabled || !currentChatId) return;

  // 禁用输入和发送按钮
  messageInputEl.disabled = true;
  sendButtonEl.disabled = true;
  sendButtonEl.textContent = '发送中...';

  // 添加用户消息到聊天窗口和存储
  addMessage(messageText, 'sent');
  chatStorage.addMessage(currentChatId, 'user', messageText);
  
  // 清空输入框
  messageInputEl.value = '';

  try {
    // 调用AI API获取回复
    const aiResponse = await callAI(messageText, currentChatId);
    
    // 添加AI回复到聊天窗口和存储
    addMessage(aiResponse, 'received');
    chatStorage.addMessage(currentChatId, 'assistant', aiResponse);
    
    // 更新聊天列表
    renderChatList();
  } catch (error) {
    // 显示错误消息
    addMessage('抱歉，发生了错误，请稍后重试。', 'received', true);
  } finally {
    // 重新启用输入和发送按钮
    messageInputEl.disabled = false;
    sendButtonEl.disabled = false;
    sendButtonEl.textContent = '发送';
    messageInputEl.focus();
  }
}

// 处理代码块格式化
function formatMessageContent(text) {
  // 先处理换行
  let formattedText = text.replace(/\n/g, '<br/>');
  
  // 处理代码块 ```语言\n代码\n```（注意：此时换行符已被替换为<br/>）
  formattedText = formattedText.replace(/```(\w*)<br\/?>?([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'text';
    // 将代码内容中的<br/>转回换行符
    const cleanCode = code.replace(/<br\/?>/g, '\n').trim();
    return `<div class="code-block"><div class="code-header"><span class="code-language">${lang}</span><button class="copy-btn" onclick="copyCode(this)" title="复制代码">复制</button></div><pre><code class="language-${lang}">${escapeHtml(cleanCode)}</code></pre></div>`;
  });
  
  // 处理内联代码 `代码`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // 清理代码块后的多余br标签
  formattedText = formattedText.replace(/<\/div>(<br\/?>){1,2}/g, '</div>');
  
  return formattedText;
}

// HTML转义函数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 复制代码功能
function copyCode(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }).catch(() => {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const originalText = button.textContent;
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
}

// 添加消息到聊天窗口
function addMessage(text, type, isError = false) {
  const messagesContainer = document.querySelector('.chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  const formattedContent = formatMessageContent(text);
  
  messageDiv.innerHTML = `
    <div class="message-content ${isError ? 'error' : ''}">
      <div class="message-text">${formattedContent}</div>
    </div>
    <div class="message-time">${timeStr}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


// 渲染聊天列表
function renderChatList() {
  const chatList = document.querySelector('.chat-list');
  const chats = chatStorage.getAllChats();
  
  chatList.innerHTML = '';
  
  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
    chatItem.dataset.chatId = chat.id;
    
    // 获取最后一条消息
    const lastMessage = chat.messages[chat.messages.length - 1];
    let lastMessageText = '开始新的对话';
    let timeStr = '现在';
    
    if (lastMessage) {
      const truncated = lastMessage.content.length > 25 ? lastMessage.content.substring(0, 25) + '...' : lastMessage.content;
      lastMessageText = lastMessage.role === 'user' ? '你: ' + truncated : truncated;
      
      const msgTime = new Date(lastMessage.timestamp);
      const now = new Date();
      const diffMs = now - msgTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) timeStr = '刚刚';
      else if (diffMins < 60) timeStr = diffMins + '分钟前';
      else if (diffHours < 24) timeStr = diffHours + '小时前';
      else timeStr = msgTime.toLocaleDateString();
    }
    
    chatItem.innerHTML = `
      <div class="avatar">${chat.prompt && chat.prompt.trim() ? 'P' : 'AI'}</div>
      <div class="chat-info">
        <div class="chat-name">${chat.title}</div>
        <div class="last-message">${lastMessageText}</div>
      </div>
      <div class="chat-time">${timeStr}</div>
    `;
    
    // 添加点击事件
    chatItem.addEventListener('click', () => switchToChat(chat.id));
    
    // 添加右键菜单事件
    chatItem.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      showContextMenu(event.clientX, event.clientY, chat.id);
    });
    
    chatList.appendChild(chatItem);
  });
  
  // 如果没有聊天，创建第一个
  if (chats.length === 0) {
    const firstChatId = chatStorage.createChat();
    currentChatId = firstChatId;
    renderChatList();
  }
}

// 切换到指定聊天
function switchToChat(chatId) {
  currentChatId = chatId;
  const chat = chatStorage.getChat(chatId);
  
  if (!chat) return;
  
  
  // 清空并重新加载消息
  const messagesContainer = document.querySelector('.chat-messages');
  messagesContainer.innerHTML = '';
  
  // 显示历史消息
  chat.messages.forEach(msg => {
    addMessage(msg.content, msg.role === 'user' ? 'sent' : 'received');
  });
  
  // 更新聊天列表样式
  renderChatList();
}

// 创建新聊天
function createNewChat(promptText = ' ') {
  // 如果需要设置prompt，先弹出模态框
  if (promptText === ' ') {
    showPromptModal(true);
    return;
  }
  
  const newChatId = chatStorage.createChat(promptText);
  currentChatId = newChatId;
  switchToChat(newChatId);
}

// 显示prompt设置模态框
function showPromptModal(isNewChat = false) {
  const modal = document.getElementById('prompt-modal');
  const textarea = document.getElementById('prompt-textarea');
  
  // 设置当前模式
  modal.dataset.isNewChat = isNewChat;
  
  // 如果是编辑现有聊天，填入当前prompt
  if (!isNewChat && currentChatId) {
    const chat = chatStorage.getChat(currentChatId);
    textarea.value = chat.prompt === ' ' ? '' : chat.prompt;
  } else {
    textarea.value = '';
  }
  
  // 显示模态框
  modal.classList.add('show');
  
  // 聚焦到textarea
  setTimeout(() => {
    textarea.focus();
  }, 100);
}

// 关闭prompt模态框
function closePromptModal() {
  const modal = document.getElementById('prompt-modal');
  modal.classList.remove('show');
}

// 保存prompt
function savePrompt() {
  const modal = document.getElementById('prompt-modal');
  const textarea = document.getElementById('prompt-textarea');
  const isNewChat = modal.dataset.isNewChat === 'true';
  const promptText = textarea.value.trim() || ' ';
  
  if (isNewChat) {
    // 创建新聊天
    const newChatId = chatStorage.createChat(promptText);
    currentChatId = newChatId;
    switchToChat(newChatId);
  } else {
    // 更新现有聊天
    if (currentChatId) {
      chatStorage.updateChatPrompt(currentChatId, promptText);
      switchToChat(currentChatId);
    }
  }
  
  closePromptModal();
}

// 显示prompt设置对话框（兼容性函数）
function showPromptDialog() {
  showPromptModal(false);
}

// 删除聊天确认
function deleteChatConfirm(chatId, event) {
  // 阻止事件冒泡，避免触发聊天切换
  event.stopPropagation();
  
  const chat = chatStorage.getChat(chatId);
  if (!chat) return;
  
  const confirmed = confirm(`确定要删除聊天"${chat.title}"吗？`);
  if (confirmed) {
    deleteChat(chatId);
  }
}

// 删除聊天
function deleteChat(chatId) {
  chatStorage.deleteChat(chatId);
  
  // 如果删除的是当前聊天，切换到其他聊天
  if (currentChatId === chatId) {
    const remainingChats = chatStorage.getAllChats();
    if (remainingChats.length > 0) {
      currentChatId = remainingChats[0].id;
      switchToChat(currentChatId);
    } else {
      // 没有聊天了，创建一个新的
      currentChatId = null;
      const messagesContainer = document.querySelector('.chat-messages');
      messagesContainer.innerHTML = '';
      
      renderChatList();
    }
  } else {
    renderChatList();
  }
}

// 窗口控制函数（保持原样）
async function closeWindow() {
  console.log('执行关闭窗口');
  try {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  } catch (error) {
    console.error('关闭窗口失败:', error);
  }
}

async function minimizeWindow() {
  console.log('执行最小化窗口');
  try {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  } catch (error) {
    console.error('最小化失败:', error);
  }
}

async function maximizeWindow() {
  console.log('执行最大化/还原窗口');
  try {
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
  } catch (error) {
    console.error('最大化失败:', error);
  }
}

// 右键菜单变量
let contextMenu = null;
let contextMenuChatId = null;

// 确认模态框变量
let confirmModal = null;
let pendingDeleteChatId = null;

// 显示右键菜单
function showContextMenu(x, y, chatId) {
  contextMenuChatId = chatId;
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.classList.add('show');
  
  // 阻止菜单超出屏幕边界
  const rect = contextMenu.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (rect.right > windowWidth) {
    contextMenu.style.left = (windowWidth - rect.width) + 'px';
  }
  
  if (rect.bottom > windowHeight) {
    contextMenu.style.top = (windowHeight - rect.height) + 'px';
  }
}

// 隐藏右键菜单
function hideContextMenu() {
  if (contextMenu) {
    contextMenu.classList.remove('show');
    contextMenuChatId = null;
  }
}

// 编辑聊天prompt
function editChatPrompt() {
  if (contextMenuChatId) {
    currentChatId = contextMenuChatId;
    showPromptModal(false);
    hideContextMenu();
  }
}

// 通过右键菜单删除聊天
function contextDeleteChat() {
  if (contextMenuChatId) {
    const chat = chatStorage.getChat(contextMenuChatId);
    if (chat) {
      showConfirmModal(`确定要删除聊天"${chat.title}"吗？`, contextMenuChatId);
    }
    hideContextMenu();
  }
}

// 显示确认模态框
function showConfirmModal(message, chatId) {
  pendingDeleteChatId = chatId;
  const messageEl = document.getElementById('confirm-message');
  messageEl.textContent = message;
  confirmModal.classList.add('show');
}

// 关闭确认模态框
function closeConfirmModal() {
  confirmModal.classList.remove('show');
  pendingDeleteChatId = null;
}

// 确认删除操作
function confirmDelete() {
  if (pendingDeleteChatId) {
    deleteChat(pendingDeleteChatId);
    closeConfirmModal();
  }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成');
  
  // 获取 DOM 元素
  messageInputEl = document.querySelector('#message-input');
  sendButtonEl = document.querySelector('#send-button');
  contextMenu = document.getElementById('context-menu');
  confirmModal = document.getElementById('confirm-modal');
  
  // 绑定发送消息事件
  if (sendButtonEl) {
    sendButtonEl.addEventListener('click', sendMessage);
  }
  
  // 绑定回车发送消息
  if (messageInputEl) {
    messageInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // 绑定新建聊天按钮
  const newChatBtn = document.querySelector('.new-chat-btn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => createNewChat());
  }
  
  // 初始化聊天列表
  renderChatList();
  
  // 如果没有当前聊天，创建第一个
  if (!currentChatId && chatStorage.getAllChats().length > 0) {
    const firstChat = chatStorage.getAllChats()[0];
    currentChatId = firstChat.id;
    switchToChat(currentChatId);
  }
  
  // 将函数暴露到全局作用域，以便HTML onclick访问
  window.showPromptDialog = showPromptDialog;
  window.closePromptModal = closePromptModal;
  window.savePrompt = savePrompt;
  window.editChatPrompt = editChatPrompt;
  window.contextDeleteChat = contextDeleteChat;
  window.closeConfirmModal = closeConfirmModal;
  window.confirmDelete = confirmDelete;
  window.copyCode = copyCode;
  
  // 添加模态框事件监听
  const modal = document.getElementById('prompt-modal');
  
  // 点击背景关闭prompt模态框
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePromptModal();
    }
  });
  
  // 点击背景关闭确认模态框
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  });
  
  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('show')) {
        closePromptModal();
      }
      if (confirmModal.classList.contains('show')) {
        closeConfirmModal();
      }
    }
  });
  
  // 添加右键菜单事件监听
  // 点击其他地方隐藏右键菜单
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
      hideContextMenu();
    }
  });
  
  // 防止右键菜单上的右键事件
  contextMenu.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // 绑定窗口控制按钮事件
  const closeBtn = document.querySelector('#close-btn');
  const minimizeBtn = document.querySelector('#minimize-btn');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await closeWindow();
    });
  }
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await minimizeWindow();
    });
  }
});