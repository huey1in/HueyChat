// 聊天管理功能
import { addMessage } from './message-formatter.js';

export let currentChatId = null;
export let chatStorage = null;

export function setChatStorage(storage) {
  chatStorage = storage;
}

export function setCurrentChatId(id) {
  currentChatId = id;
}

export function getCurrentChatId() {
  return currentChatId;
}

// 渲染聊天列表
export function renderChatList() {
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
  
  // 如果没有聊天，自动创建一个默认聊天
  if (chats.length === 0) {
    const defaultChatId = chatStorage.createChat('你是一个有用的AI助手。');
    currentChatId = defaultChatId;
    window.currentChatId = defaultChatId;
    renderChatList(); // 重新渲染以显示新创建的聊天
  }
}

// 切换到指定聊天
export function switchToChat(chatId) {
  currentChatId = chatId;
  window.currentChatId = chatId; // 同步更新全局变量
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

// 创建新聊天（仅显示设定模态框）
export function createNewChat() {
  if (window.showPromptModal) {
    // 直接显示提示词设置模态框，不创建聊天
    window.showPromptModal(true);
  }
}

// 实际创建新聊天（带提示词）
export function createNewChatWithPrompt(promptText = '') {
  const newChatId = chatStorage.createChat(promptText);
  currentChatId = newChatId;
  window.currentChatId = newChatId;
  
  // 清空消息区域
  const messagesContainer = document.querySelector('.chat-messages');
  messagesContainer.innerHTML = '';
  
  // 更新聊天列表并切换到新聊天
  renderChatList();
  switchToChat(newChatId);
  
  return newChatId;
}

// 删除聊天
export function deleteChat(chatId) {
  // 删除聊天
  chatStorage.deleteChat(chatId);
  
  // 如果删除的是当前聊天，切换到第一个聊天
  if (chatId === currentChatId) {
    const remainingChats = chatStorage.getAllChats();
    
    if (remainingChats.length > 0) {
      currentChatId = remainingChats[0].id;
      window.currentChatId = currentChatId;
      switchToChat(currentChatId);
    } else {
      // 没有其他聊天了，自动创建一个新的默认聊天
      const defaultChatId = chatStorage.createChat('你是一个有用的AI助手。');
      currentChatId = defaultChatId;
      window.currentChatId = defaultChatId;
      switchToChat(defaultChatId);
    }
  }
  
  // 更新聊天列表
  renderChatList();
}

// 占位函数，在其他模块中实现
let showContextMenu = () => {};
export function setShowContextMenu(fn) {
  showContextMenu = fn;
}