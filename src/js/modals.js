// 模态框管理

// 显示提示词设置模态框
export function showPromptModal(isNewChat = false) {
  const modal = document.getElementById('prompt-modal');
  const textarea = document.getElementById('prompt-textarea');
  
  // 设置标识，表明是否是创建新聊天
  modal.dataset.isNewChat = isNewChat.toString();
  
  if (isNewChat) {
    textarea.value = '';
  } else if (window.currentChatId && window.chatStorage) {
    const chat = window.chatStorage.getChat(window.currentChatId);
    textarea.value = chat ? (chat.prompt || '') : '';
  }
  
  modal.classList.add('show');
  textarea.focus();
}

// 关闭提示词模态框
export function closePromptModal() {
  const modal = document.getElementById('prompt-modal');
  modal.classList.remove('show');
  // 清除标识
  delete modal.dataset.isNewChat;
}

// 保存提示词
export function savePrompt() {
  const modal = document.getElementById('prompt-modal');
  const textarea = document.getElementById('prompt-textarea');
  const promptText = textarea.value.trim();
  const isNewChat = modal.dataset.isNewChat === 'true';
  
  if (isNewChat) {
    // 创建新聊天
    if (window.chatStorage && window.createNewChatWithPrompt) {
      window.createNewChatWithPrompt(promptText);
    }
  } else {
    // 更新现有聊天的提示词
    if (window.currentChatId && window.chatStorage) {
      window.chatStorage.updateChatPrompt(window.currentChatId, promptText);
    }
  }
  
  closePromptModal();
}

// 显示确认删除模态框
export function showConfirmModal(message, chatId) {
  const modal = document.getElementById('confirm-modal');
  const messageEl = document.getElementById('confirm-message');
  messageEl.textContent = message;
  modal.dataset.chatId = chatId;
  modal.classList.add('show');
}

// 关闭确认模态框
export function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  modal.classList.remove('show');
  delete modal.dataset.chatId;
}

// 确认删除
export function confirmDelete() {
  const modal = document.getElementById('confirm-modal');
  const chatId = modal.dataset.chatId;
  
  if (chatId && window.deleteChat) {
    window.deleteChat(chatId);
  }
  
  closeConfirmModal();
}

// 用户信息模态框相关
export function showLoginModal(userAuth) {
  const modal = document.getElementById('user-profile-modal');
  
  if (userAuth.isLoggedIn()) {
    // 如果已登录，直接执行退出登录确认
    logout();
  } else {
    // 如果未登录，显示登录表单
    showLoginForm();
    // 显示模态框
    modal.classList.add('show');
  }
}

export function showUserProfile() {
  // 保留原函数以保持兼容性
  if (window.showLoginModal) {
    window.showLoginModal();
  }
}

export function closeUserProfileModal() {
  const modal = document.getElementById('user-profile-modal');
  modal.classList.remove('show');
  
  // 清空表单
  if (window.clearAllForms) {
    window.clearAllForms();
  }
}

export function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  
  // 更新模态框标题
  const modal = document.getElementById('user-profile-modal');
  const modalTitle = modal.querySelector('.modal-header h3');
  modalTitle.textContent = '用户登录';
  
  // 自动填充记住的登录信息
  if (window.loadRememberedCredentials) {
    window.loadRememberedCredentials();
  }
}

export function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  
  // 更新模态框标题
  const modal = document.getElementById('user-profile-modal');
  const modalTitle = modal.querySelector('.modal-header h3');
  modalTitle.textContent = '用户注册';
}

// 登录注销相关
export function logout() {
  const modal = document.getElementById('logout-confirm-modal');
  modal.classList.add('show');
}

export function closeLogoutModal() {
  const modal = document.getElementById('logout-confirm-modal');
  modal.classList.remove('show');
}

export function confirmLogout() {
  if (window.userAuth) {
    window.userAuth.logout();
  }
  closeLogoutModal();
  
  // 立即更新用户卡片状态
  if (window.updateUserCard) {
    window.updateUserCard();
  }
  
  if (window.notificationSystem) {
    window.notificationSystem.success('退出成功', '已安全退出登录');
  }
}