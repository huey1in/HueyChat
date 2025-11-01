// 主入口文件 - 整合所有模块
import { ChatStorage } from './storage.js';
import { UserAuth } from './auth.js';
import { NotificationSystem } from './notifications.js';
import { PasswordStrengthChecker } from './password-checker.js';
import { formatMessageContent, escapeHtml, copyCode, addMessage } from './message-formatter.js';
import { renderChatList, switchToChat, createNewChat, createNewChatWithPrompt, deleteChat, setChatStorage, setCurrentChatId, setShowContextMenu } from './chat-manager.js';
import { callAI, sendMessage, fetchAvailableModels } from './api.js';
import { hideLoadingScreen, updateUserCard, loadRememberedCredentials, attemptAutoLogin, clearAllForms, loadModelsList } from './ui-manager.js';
import { showPromptModal, closePromptModal, savePrompt, showConfirmModal, closeConfirmModal, confirmDelete, showLoginModal, showUserProfile, closeUserProfileModal, showLoginForm, showRegisterForm, logout, closeLogoutModal, confirmLogout, showSettingsModal, closeSettingsModal, saveSettings, showSettingsPage, closeSettingsPage, saveSettingsPage, checkForUpdates, handleThemeChange } from './modals.js';
import { performLogin, performRegister } from './form-handlers.js';
import { showContextMenu, hideContextMenu, editChatPrompt, contextDeleteChat } from './context-menu.js';
import { bindEventListeners } from './event-handlers.js';

let messageInputEl;
let sendButtonEl;
let currentChatId = null;

// 初始化所有模块
const chatStorage = new ChatStorage();
const userAuth = new UserAuth();
const notificationSystem = new NotificationSystem();
const passwordChecker = new PasswordStrengthChecker();

// 设置模块间依赖
setChatStorage(chatStorage);
setShowContextMenu(showContextMenu);

// 初始化应用
async function initializeApp() {
  try {
    console.log('初始化应用...');
    
    // 设置版本号
    const versionElement = document.getElementById('current-version');
    if (versionElement) {
      versionElement.textContent = 'v0.1.0';
    }
    
    // 初始化通知系统
    notificationSystem.init();
    
    // 应用保存的主题色设置
    const savedTheme = localStorage.getItem('theme_color') || 'white';
    handleThemeChange(savedTheme);
    
    // 初始化用户卡片
    updateUserCard(userAuth);
    
    // 尝试自动登录（如果有记住的凭据）
    await attemptAutoLogin(userAuth, () => updateUserCard(userAuth));
    
    // 加载可用的AI模型列表
    await loadModelsList(userAuth);
    
    // 暴露函数到全局作用域以供HTML调用
    window.showPromptModal = showPromptModal;
    window.closePromptModal = closePromptModal;
    window.savePrompt = savePrompt;
    window.editChatPrompt = editChatPrompt;
    window.contextDeleteChat = contextDeleteChat;
    window.closeConfirmModal = closeConfirmModal;
    window.confirmDelete = confirmDelete;
    window.copyCode = copyCode;
    window.showUserProfile = showUserProfile;
    window.closeUserProfileModal = closeUserProfileModal;
    window.showLoginForm = showLoginForm;
    window.showRegisterForm = showRegisterForm;
    window.performLogin = () => performLogin(userAuth, notificationSystem, () => updateUserCard(userAuth), closeUserProfileModal, clearAllForms);
    window.performRegister = () => performRegister(userAuth, notificationSystem, clearAllForms);
    window.logout = logout;
    window.showLoginModal = () => showLoginModal(userAuth);
    window.closeLogoutModal = closeLogoutModal;
    window.confirmLogout = confirmLogout;
    window.showSettingsModal = showSettingsModal;
    window.closeSettingsModal = closeSettingsModal;
    window.saveSettings = saveSettings;
    window.showSettingsPage = showSettingsPage;
    window.closeSettingsPage = closeSettingsPage;
    window.saveSettingsPage = saveSettingsPage;
    window.handleThemeChange = handleThemeChange;
    window.checkForUpdates = checkForUpdates;
    window.notificationSystem = notificationSystem;
    window.showConfirmModal = showConfirmModal;
    window.deleteChat = deleteChat;
    window.loadRememberedCredentials = () => loadRememberedCredentials(userAuth);
    window.clearAllForms = clearAllForms;
    window.updateUserCard = () => updateUserCard(userAuth);
    window.createNewChatWithPrompt = createNewChatWithPrompt;
    
    // 暴露全局变量
    window.chatStorage = chatStorage;
    window.userAuth = userAuth;
    window.passwordChecker = passwordChecker;
    window.currentChatId = currentChatId;
    
    // 创建发送消息函数
    const sendMessageHandler = () => sendMessage(
      messageInputEl, 
      sendButtonEl, 
      window.currentChatId, // 使用全局的 currentChatId
      userAuth, 
      chatStorage, 
      addMessage, 
      renderChatList, 
      () => updateUserCard(userAuth),
      showUserProfile,
      notificationSystem
    );
    
    // 绑定模态框和其他事件监听器
    const elements = bindEventListeners(sendMessageHandler, createNewChat, hideContextMenu);
    messageInputEl = elements.messageInputEl;
    sendButtonEl = elements.sendButtonEl;
    
    // 初始化聊天列表
    renderChatList();
    
    // 如果有聊天，切换到第一个
    const chats = chatStorage.getAllChats();
    if (chats.length > 0) {
      currentChatId = chats[0].id;
      setCurrentChatId(currentChatId);
      window.currentChatId = currentChatId;
      switchToChat(currentChatId);
    }
    
    // 初始化完成，隐藏启动动画
    setTimeout(() => {
      hideLoadingScreen();
    }, 800); // 给一个短暂的延迟确保所有内容加载完成
    
  } catch (error) {
    console.error('应用初始化失败:', error);
    // 即使出错也要隐藏启动动画
    hideLoadingScreen();
  }
}

// 应用关闭时的清理逻辑
window.addEventListener('beforeunload', () => {
  // 检查用户是否选择了记住密码
  const isRememberPasswordEnabled = userAuth.getCookie('hueychat_remember') === 'true';
  if (!isRememberPasswordEnabled) {
    // 如果没有选择记住密码，清理所有登录相关数据
    userAuth.clearUser(); // 清除token和用户信息
    userAuth.clearRememberedCredentials(); // 清除记住的凭据
  }
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成');
  
  // 初始化应用数据，完成后隐藏启动动画
  initializeApp();
});