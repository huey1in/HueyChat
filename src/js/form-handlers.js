// 表单处理和用户认证

// 执行登录
export async function performLogin(userAuth, notificationSystem, updateUserCard, closeUserProfileModal, clearAllForms) {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const rememberPassword = document.getElementById('remember-password').checked;
  const loginBtn = document.getElementById('login-btn');
  
  if (!username || !password) {
    notificationSystem.warning('输入错误', '请输入用户名和密码');
    return;
  }

  // 显示加载状态
  const originalText = loginBtn.textContent;
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');
  loginBtn.textContent = '登录中...';

  try {
    await userAuth.login(username, password);
    
    // 处理记住密码
    if (rememberPassword) {
      userAuth.saveRememberedCredentials(username, password);
    } else {
      userAuth.clearRememberedCredentials();
    }
    
    updateUserCard();
    closeUserProfileModal();
    notificationSystem.success('登录成功', '欢迎回来！');
  } catch (error) {
    notificationSystem.error('登录失败', error.message);
  } finally {
    // 恢复按钮状态
    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');
    loginBtn.textContent = originalText;
  }
}

// 执行注册
export async function performRegister(userAuth, notificationSystem, clearAllForms) {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const registerBtn = document.getElementById('register-btn');
  
  if (!username || !password || !confirmPassword) {
    notificationSystem.warning('输入错误', '请填写所有字段');
    return;
  }

  if (password !== confirmPassword) {
    notificationSystem.warning('密码不匹配', '两次输入的密码不一致');
    return;
  }

  // 显示加载状态
  const originalText = registerBtn.textContent;
  registerBtn.disabled = true;
  registerBtn.classList.add('loading');
  registerBtn.textContent = '注册中...';

  try {
    await userAuth.register(username, password, confirmPassword);
    
    // 清空表单
    clearAllForms();
    notificationSystem.success('注册成功', '请使用新账号登录');
    
    // 切换到登录表单
    if (window.showLoginForm) {
      window.showLoginForm();
    }
  } catch (error) {
    notificationSystem.error('注册失败', error.message);
  } finally {
    // 恢复按钮状态
    registerBtn.disabled = false;
    registerBtn.classList.remove('loading');
    registerBtn.textContent = originalText;
  }
}