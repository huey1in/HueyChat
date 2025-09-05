// 右键上下文菜单管理

let contextChatId = null;

// 显示右键菜单
export function showContextMenu(x, y, chatId) {
  const menu = document.getElementById('context-menu');
  contextChatId = chatId;
  
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('show');
  
  // 点击其他地方隐藏菜单
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 0);
}

// 隐藏右键菜单
export function hideContextMenu() {
  const menu = document.getElementById('context-menu');
  menu.classList.remove('show');
  contextChatId = null;
}

// 编辑聊天提示词
export function editChatPrompt() {
  if (contextChatId) {
    const chatIdToEdit = contextChatId; // 保存chatId
    hideContextMenu();
    window.currentChatId = chatIdToEdit;
    if (window.showPromptModal) {
      window.showPromptModal();
    }
  }
}

// 右键删除聊天
export function contextDeleteChat() {
  if (contextChatId) {
    const chatIdToDelete = contextChatId; // 保存chatId
    hideContextMenu();
    if (window.showConfirmModal) {
      window.showConfirmModal('确定要删除这个聊天吗？', chatIdToDelete);
    }
  }
}