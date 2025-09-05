// 表单处理和用户认证

// 执行登录
export async function performLogin(userAuth, notificationSystem, updateUserCard, closeUserProfileModal, clearAllForms) {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const rememberPassword = document.getElementById('remember-password').checked;
  
  if (!username || !password) {
    notificationSystem.warning('输入错误', '请输入用户名和密码');
    return;
  }

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
  }
}

// 执行注册
export async function performRegister(userAuth, notificationSystem, clearAllForms) {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  
  if (!username || !password || !confirmPassword) {
    notificationSystem.warning('输入错误', '请填写所有字段');
    return;
  }

  if (password !== confirmPassword) {
    notificationSystem.warning('密码不匹配', '两次输入的密码不一致');
    return;
  }

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
  }
}