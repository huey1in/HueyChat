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

// 设置页面相关
export function showSettingsPage() {
  const page = document.getElementById('settings-page');
  const chatMain = document.querySelector('.chat-main');
  // 加载已保存的设置
  loadSettingsForm();
  page.style.display = 'flex';
  chatMain.style.display = 'none';
}

export function handleThemeChange(theme) {
  // 保存主题色到 localStorage
  localStorage.setItem('theme_color', theme);
  
  // 更新选中状态
  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  // 移除所有旧的主题类名
  Array.from(document.body.classList).forEach(className => {
    if (className.startsWith('theme-')) {
      document.body.classList.remove(className);
    }
  });
  
  // 添加新的主题类名到 body
  document.body.classList.add(`theme-${theme}`);
  
  // 应用主题色到 CSS 变量
  applyThemeColor(theme);
}

function getThemeName(theme) {
  const names = {
    white: '白色',
    black: '黑色',
    red: '红色',
    orange: '橙色',
    yellow: '黄色',
    green: '绿色',
    cyan: '青色',
    blue: '蓝色',
    purple: '紫色'
  };
  return names[theme] || theme;
}

function applyThemeColor(theme) {
  const color = getThemeColor(theme);
  document.documentElement.style.setProperty('--theme-primary', color);
  
  // 计算半透明版本
  let rgb;
  if (color === '#ffffff') {
    rgb = '255, 255, 255';
  } else if (color === '#000000') {
    rgb = '0, 0, 0';
  } else {
    // 将十六进制转为 RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    rgb = `${r}, ${g}, ${b}`;
  }
  
  document.documentElement.style.setProperty('--theme-light', `rgba(${rgb}, 0.1)`);
  document.documentElement.style.setProperty('--theme-lighter', `rgba(${rgb}, 0.05)`);
}

function getThemeColor(theme) {
  const colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    orange: '#ff7f00',
    yellow: '#ffff00',
    green: '#00ff00',
    cyan: '#00ffff',
    blue: '#0000ff',
    purple: '#8000ff'
  };
  return colors[theme] || '#ff6b35';
}

export function checkForUpdates() {
  const checkBtn = document.querySelector('.check-update-btn');
  if (checkBtn.classList.contains('checking')) {
    return; // 已在检查中
  }
  
  checkBtn.classList.add('checking');
  checkBtn.textContent = '检中...';
  checkBtn.disabled = true;
  
  // 从后端获取最新版本
  fetch('https://chat.yinxh.fun/api/v1/version')
    .then(response => {
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      return response.json();
    })
    .then(data => {
      const currentVersion = document.getElementById('current-version').textContent.replace('v', '');
      const latestVersion = data.version || data.latest_version || '0.1.0';
      
      // 比较版本号
      if (compareVersions(latestVersion, currentVersion) > 0) {
        if (window.notificationSystem) {
          window.notificationSystem.success('发现新版本', `最新版本：v${latestVersion}，请下载更新`);
        }
      } else {
        if (window.notificationSystem) {
          window.notificationSystem.info('已是最新版本', '您正在使用最新版本');
        }
      }
    })
    .catch(error => {
      console.error('检查更新失败:', error);
      if (window.notificationSystem) {
        window.notificationSystem.error('检查失败', '无法连接到服务器，请检查网络连接');
      }
    })
    .finally(() => {
      checkBtn.classList.remove('checking');
      checkBtn.textContent = '检查';
      checkBtn.disabled = false;
    });
}

// 版本号比较函数
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0; // 版本相同
}

export function closeSettingsPage() {
  const page = document.getElementById('settings-page');
  const chatMain = document.querySelector('.chat-main');
  page.style.display = 'none';
  chatMain.style.display = 'flex';
}

function loadSettingsForm() {
  // 加载主题色设置
  const savedTheme = localStorage.getItem('theme_color') || 'white';
  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === savedTheme) {
      btn.classList.add('active');
    }
  });
  
  // 应用保存的主题色和类名
  Array.from(document.body.classList).forEach(className => {
    if (className.startsWith('theme-')) {
      document.body.classList.remove(className);
    }
  });
  document.body.classList.add(`theme-${savedTheme}`);
  applyThemeColor(savedTheme);
}

export function saveSettingsPage() {
  // 保存深色模式设置
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  if (darkModeCheckbox) {
    localStorage.setItem('dark_mode', darkModeCheckbox.checked ? 'true' : 'false');
  }
  
  if (window.notificationSystem) {
    window.notificationSystem.success('设置已保存', '您的设置已成功保存');
  }
  
  closeSettingsPage();
}

// 旧的模态框函数（保留用于兼容性）
export function showSettingsModal() {
  showSettingsPage();
}

export function closeSettingsModal() {
  closeSettingsPage();
}

export function saveSettings() {
  saveSettingsPage();
}