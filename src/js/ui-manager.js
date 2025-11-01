// UI管理和更新功能
import { getApiUrl, fetchAvailableModels } from './api.js';

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

// 加载可用的AI模型列表
export async function loadModelsList(userAuth) {
  try {
    const modelSelectBtn = document.getElementById('model-select-btn');
    const modelDropdown = document.getElementById('model-dropdown');
    if (!modelSelectBtn || !modelDropdown) return;

    // 获取可用模型列表
    const models = await fetchAvailableModels(userAuth);
    
    // 清空现有选项
    modelDropdown.innerHTML = '';
    
    if (models && models.length > 0) {
      // 添加模型选项
      models.forEach((model, index) => {
        const item = document.createElement('div');
        item.className = 'model-dropdown-item';
        if (index === 0) item.classList.add('selected');
        item.textContent = model.id;
        item.dataset.value = model.id;
        item.title = model.id;
        
        item.addEventListener('click', () => {
          selectModel(model.id);
        });
        
        modelDropdown.appendChild(item);
      });
      
      // 设置按钮文本为第一个模型
      const modelSelectText = modelSelectBtn.querySelector('.model-select-text');
      modelSelectText.textContent = models[0].id;
      
      // 保存第一个模型为默认选中
      localStorage.setItem('selected_model', models[0].id);
      window.selectedModel = models[0].id;
      
      console.log(`成功加载 ${models.length} 个模型`);
    } else {
      // 如果没有获取到模型，显示提示
      const item = document.createElement('div');
      item.className = 'model-dropdown-item';
      item.textContent = '无可用模型，请检查网络';
      item.style.cursor = 'default';
      modelDropdown.appendChild(item);
      
      const modelSelectText = modelSelectBtn.querySelector('.model-select-text');
      modelSelectText.textContent = '无可用模型';
    }
    
    // 绑定下拉菜单切换事件和位置计算
    modelSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = modelSelectBtn.classList.toggle('open');
      
      if (isOpen) {
        // 先显示菜单，使其可以计算高度
        modelDropdown.style.display = 'block';
        
        // 使用 requestAnimationFrame 确保菜单已渲染
        requestAnimationFrame(() => {
          // 计算菜单位置
          const rect = modelSelectBtn.getBoundingClientRect();
          const menuHeight = modelDropdown.offsetHeight;
          const top = rect.top - menuHeight - 8;
          const left = rect.left;
          
          modelDropdown.style.top = top + 'px';
          modelDropdown.style.left = left + 'px';
        });
      } else {
        modelDropdown.style.display = 'none';
      }
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-selector-wrapper') && !e.target.closest('.model-dropdown')) {
        modelSelectBtn.classList.remove('open');
        modelDropdown.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('加载模型列表失败:', error);
    
    // 加载失败时显示错误提示
    const modelSelectBtn = document.getElementById('model-select-btn');
    const modelDropdown = document.getElementById('model-dropdown');
    if (modelSelectBtn && modelDropdown) {
      modelDropdown.innerHTML = '';
      const item = document.createElement('div');
      item.className = 'model-dropdown-item';
      item.textContent = '加载模型失败，请检查网络';
      item.style.cursor = 'default';
      modelDropdown.appendChild(item);
      
      const modelSelectText = modelSelectBtn.querySelector('.model-select-text');
      modelSelectText.textContent = '加载失败';
    }
  }
}

// 选择模型的辅助函数
function selectModel(modelId) {
  const modelSelectBtn = document.getElementById('model-select-btn');
  const modelSelectText = modelSelectBtn.querySelector('.model-select-text');
  const modelDropdown = document.getElementById('model-dropdown');
  
  // 更新按钮文本
  modelSelectText.textContent = modelId;
  
  // 更新选中状态
  document.querySelectorAll('.model-dropdown-item').forEach(item => {
    item.classList.remove('selected');
    if (item.dataset.value === modelId) {
      item.classList.add('selected');
    }
  });
  
  // 保存选中的模型
  localStorage.setItem('selected_model', modelId);
  window.selectedModel = modelId;
  
  // 关闭下拉菜单
  modelSelectBtn.classList.remove('open');
  modelDropdown.style.display = 'none';
}