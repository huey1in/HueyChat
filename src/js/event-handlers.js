// 事件监听器绑定
import { getCurrentWindow } from '@tauri-apps/api/window';

export function bindEventListeners(sendMessage, createNewChat, hideContextMenu) {
  // 添加模态框事件监听
  const modal = document.getElementById('prompt-modal');
  
  // 点击背景关闭prompt模态框
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closePromptModal();
    }
  });
  
  // ESC键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const visibleModal = document.querySelector('.modal.show');
      if (visibleModal) {
        // 根据不同的模态框调用不同的关闭函数
        if (visibleModal.id === 'prompt-modal') {
          window.closePromptModal();
        } else if (visibleModal.id === 'confirm-modal') {
          window.closeConfirmModal();
        } else if (visibleModal.id === 'user-profile-modal') {
          window.closeUserProfileModal();
        } else if (visibleModal.id === 'logout-confirm-modal') {
          window.closeLogoutModal();
        }
      } else {
        // 如果没有模态框，隐藏右键菜单
        hideContextMenu();
      }
    }
  });

  // 点击空白处隐藏右键菜单
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('context-menu');
    if (menu && !menu.contains(e.target)) {
      hideContextMenu();
    }
  });

  // Tauri窗口控制
  const closeBtn = document.getElementById('close-btn');
  const minimizeBtn = document.getElementById('minimize-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', async () => {
      await getCurrentWindow().close();
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', async () => {
      await getCurrentWindow().minimize();
    });
  }

  // 消息输入相关事件
  const messageInputEl = document.getElementById('message-input');
  const sendButtonEl = document.getElementById('send-button');
  
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

  // 绑定密码强度检测
  const registerPasswordInput = document.getElementById('register-password');
  if (registerPasswordInput && window.passwordChecker) {
    registerPasswordInput.addEventListener('input', (e) => {
      window.passwordChecker.updateUI(e.target.value);
    });
  }
  
  return { messageInputEl, sendButtonEl };
}