// 通知系统
export class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.notificationId = 0;
  }

  init() {
    this.container = document.getElementById('notification-container');
  }

  show(type, title, message, duration = 4000, options = {}) {
    if (!this.container) return;

    const id = ++this.notificationId;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.id = id;

    let actionsHtml = '';
    if (options.actions && options.actions.length > 0) {
      actionsHtml = `
        <div class="notification-actions">
          ${options.actions.map((action, index) => 
            `<button class="notification-action ${action.style || ''}" onclick="notificationSystem.handleAction(${id}, ${index})">${action.text}</button>`
          ).join('')}
        </div>
      `;
    }

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-body">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
          ${actionsHtml}
        </div>
      </div>
      ${!options.actions ? `<button class="notification-close" onclick="notificationSystem.close(${id})">&times;</button>` : ''}
    `;

    this.container.appendChild(notification);
    this.notifications.set(id, { element: notification, options });

    // 显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 50);

    // 自动关闭 (如果有action按钮则不自动关闭)
    if (duration > 0 && (!options.actions || options.actions.length === 0)) {
      setTimeout(() => {
        this.close(id);
      }, duration);
    }

    return id;
  }

  success(title, message, duration) {
    return this.show('success', title, message, duration);
  }

  error(title, message, duration) {
    return this.show('error', title, message, duration);
  }

  warning(title, message, duration) {
    return this.show('warning', title, message, duration);
  }

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  }

  handleAction(id, actionIndex) {
    const notificationData = this.notifications.get(id);
    if (!notificationData || !notificationData.options.actions) return;

    const action = notificationData.options.actions[actionIndex];
    if (action.callback) {
      action.callback();
    }
    
    this.close(id);
  }

  confirm(title, message, onConfirm, onCancel) {
    return this.show('warning', title, message, 0, {
      actions: [
        {
          text: '取消',
          style: 'secondary',
          callback: onCancel || (() => {})
        },
        {
          text: '确定',
          style: 'primary',
          callback: onConfirm || (() => {})
        }
      ]
    });
  }

  close(id) {
    const notificationData = this.notifications.get(id);
    if (!notificationData) return;

    const notification = notificationData.element || notificationData;
    notification.classList.remove('show');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 300);
  }

  closeAll() {
    this.notifications.forEach((_, id) => {
      this.close(id);
    });
  }
}