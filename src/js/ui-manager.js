// UI管理和更新功能
import { getApiUrl } from './api.js';

// 隐藏启动动画
export function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    // 动画完成后移除元素
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
}

// 用户信息相关函数
export async function updateUserCard(userAuth) {
  const userNameEl = document.getElementById('user-name');
  const userStatusEl = document.getElementById('user-status');
  const userCreditsEl = document.getElementById('user-credits');
  
  if (userNameEl && userStatusEl && userCreditsEl) {
    if (userAuth.isLoggedIn()) {
      const user = userAuth.user;
      userNameEl.textContent = user.username || '用户';
      userStatusEl.textContent = '已登录';
      
      // 获取最新的用户信息（包括积分）
      try {
        const response = await fetch(getApiUrl('/users/profile'), {
          headers: {
            'Authorization': `Bearer ${userAuth.getToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const credits = data.data.credits;
          
          if (credits === -1) {
            userCreditsEl.textContent = '积分: 无限';
          } else {
            // 显示小数积分，如果是整数则不显示小数部分
            const formattedCredits = credits % 1 === 0 
              ? credits.toLocaleString() 
              : credits.toFixed(3).replace(/\.?0+$/, '');
            userCreditsEl.textContent = `积分: ${formattedCredits}`;
          }
          userCreditsEl.style.display = 'block';
        } else {
          userCreditsEl.style.display = 'none';
        }
      } catch (error) {
        console.error('获取用户积分失败:', error);
        userCreditsEl.style.display = 'none';
      }
    } else {
      userNameEl.textContent = '未登录';
      userStatusEl.textContent = '点击登录或查看信息';
      userCreditsEl.style.display = 'none';
    }
  }
}

// 加载记住的登录凭据
export function loadRememberedCredentials(userAuth) {
  const remembered = userAuth.getRememberedCredentials();
  if (remembered) {
    document.getElementById('login-username').value = remembered.username;
    document.getElementById('login-password').value = remembered.password;
    document.getElementById('remember-password').checked = true;
  }
}

// 自动登录尝试
export async function attemptAutoLogin(userAuth, updateUserCard) {
  const remembered = userAuth.getRememberedCredentials();
  if (remembered) {
    try {
      console.log('尝试使用记住的凭据自动登录...');
      await userAuth.login(remembered.username, remembered.password);
      updateUserCard();
      console.log('自动登录成功');
    } catch (error) {
      console.log('自动登录失败:', error.message);
      // 如果自动登录失败，清除过期的记住信息
      userAuth.clearRememberedCredentials();
    }
  }
}

// 清空所有表单
export function clearAllForms() {
  // 清空表单
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('remember-password').checked = false;
  document.getElementById('register-username').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-confirm-password').value = '';
}