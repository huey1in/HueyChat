// API调用相关功能

// API 基础配置
export const API_CONFIG = {
  BASE_URL: 'https://chat.yinxh.fun/api/v1'
};

// 获取完整的API URL
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}
export async function callAI(userMessage, chatId, userAuth, chatStorage) {
  try {
    const chat = chatStorage.getChat(chatId);
    if (!chat) {
      throw new Error('聊天不存在');
    }

    // 构建聊天上下文
    const context = {};
    if (chat.prompt && chat.prompt.trim()) {
      context.customPrompt = chat.prompt.trim();
    }

    const response = await userAuth.apiRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        message: {
          content: userMessage
        },
        context: context
      })
    });

    if (!response.data || !response.data.response || !response.data.response.content) {
      throw new Error('AI响应格式错误');
    }

    return response.data.response.content;
  } catch (error) {
    console.error('AI API调用错误:', error);
    throw error;
  }
}

// 发送消息功能
export async function sendMessage(messageInputEl, sendButtonEl, currentChatId, userAuth, chatStorage, addMessage, renderChatList, updateUserCard, showUserProfile, notificationSystem) {
  const messageText = messageInputEl.value.trim();
  if (!messageText || sendButtonEl.disabled) return;
  
  // 如果没有当前聊天，自动创建一个默认聊天
  if (!currentChatId) {
    if (window.createNewChatWithPrompt) {
      const newChatId = window.createNewChatWithPrompt('你是一个有用的AI助手。');
      currentChatId = newChatId;
    } else {
      if (notificationSystem) {
        notificationSystem.error('无法创建聊天', '请刷新页面重试');
      }
      return;
    }
  }
  
  // 检查用户是否已登录
  if (!userAuth.isLoggedIn()) {
    showUserProfile();
    return;
  }
  
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
    // 调用后端聊天接口获取回复
    const aiResponse = await callAI(messageText, currentChatId, userAuth, chatStorage);
    
    // 添加AI回复到聊天窗口和存储
    addMessage(aiResponse, 'received');
    chatStorage.addMessage(currentChatId, 'assistant', aiResponse);
    
    // 更新聊天列表
    renderChatList();
    
    // 更新用户卡片以显示最新积分
    updateUserCard();
  } catch (error) {
    // 显示错误消息
    let errorMessage = '抱歉，发生了错误，请稍后重试。';
    if (error.message.includes('401') || error.message.includes('未授权')) {
      errorMessage = '登录已过期，请重新登录';
      notificationSystem.warning('登录过期', '请重新登录后继续使用');
    } else if (error.message.includes('需要登录')) {
      errorMessage = '请先登录才能使用聊天功能';
      notificationSystem.warning('需要登录', '请先登录才能使用聊天功能');
    }
    addMessage(errorMessage, 'received', true);
  } finally {
    // 重新启用输入和发送按钮
    messageInputEl.disabled = false;
    sendButtonEl.disabled = false;
    sendButtonEl.textContent = '发送';
    messageInputEl.focus();
  }
}