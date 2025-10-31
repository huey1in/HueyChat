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

export function handleDarkModeToggle() {
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  if (darkModeCheckbox) {
    applyDarkMode(darkModeCheckbox.checked);
    // 实时保存到 localStorage
    localStorage.setItem('dark_mode', darkModeCheckbox.checked ? 'true' : 'false');
  }
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
          window.notificationSystem.info('已是最新版本', '您正在使用最新版本的 HueyChat');
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

export function showAboutPage() {
  const page = document.getElementById('about-page');
  const chatMain = document.querySelector('.chat-main');
  page.style.display = 'flex';
  chatMain.style.display = 'none';
}

export function closeAboutPage() {
  const page = document.getElementById('about-page');
  const chatMain = document.querySelector('.chat-main');
  page.style.display = 'none';
  chatMain.style.display = 'flex';
}

function loadSettingsForm() {
  // 加载深色模式设置
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  if (darkModeCheckbox) {
    darkModeCheckbox.checked = localStorage.getItem('dark_mode') === 'true';
  }
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

function applyDarkMode(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

export { applyDarkMode };

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

// 用户菜单相关函数
export function showUserMenu() {
  const userMenu = document.getElementById('user-menu');
  const userCard = document.getElementById('user-card');
  
  // 获取用户卡片的位置
  const rect = userCard.getBoundingClientRect();
  
  // 先显示菜单，这样才能获取到正确的offsetHeight
  userMenu.classList.add('show');
  
  // 使用 setTimeout 确保菜单已经渲染，然后获取正确的高度
  setTimeout(() => {
    const menuHeight = userMenu.offsetHeight;
    // 将菜单定位在用户卡片右侧
    // 菜单底部与用户卡片底部对齐
    const top = rect.bottom - menuHeight;
    const left = rect.right + 10; // 在右侧，间距10px
    
    userMenu.style.top = top + 'px';
    userMenu.style.left = left + 'px';
  }, 0);
}

export function hideUserMenu() {
  const userMenu = document.getElementById('user-menu');
  userMenu.classList.remove('show');
}

export function handleUserMenuAbout() {
  hideUserMenu();
  // 关于菜单项处理：显示关于页面
  showAboutPage();
}

export function handleUserMenuSettings() {
  hideUserMenu();
  // 设置菜单项处理：显示设置页面
  showSettingsPage();
}