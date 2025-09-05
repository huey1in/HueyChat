// 用户认证管理
import { API_CONFIG, getApiUrl } from './api.js';

export class UserAuth {
  constructor() {
    this.user = this.loadUser();
  }

  // 从localStorage加载用户信息
  loadUser() {
    const stored = localStorage.getItem('hueychat_user');
    return stored ? JSON.parse(stored) : null;
  }

  // 保存用户信息到localStorage
  saveUser(user) {
    localStorage.setItem('hueychat_user', JSON.stringify(user));
    this.user = user;
  }

  // 清除用户信息
  clearUser() {
    localStorage.removeItem('hueychat_user');
    localStorage.removeItem('hueychat_token');
    this.user = null;
  }

  // 获取存储的token
  getToken() {
    return localStorage.getItem('hueychat_token');
  }

  // 保存token
  saveToken(token) {
    localStorage.setItem('hueychat_token', token);
  }

  // Cookie 管理
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // 保存记住的登录信息
  saveRememberedCredentials(username, password) {
    // 简单的Base64编码（仅用于混淆，不是安全加密）
    const encodedUsername = btoa(username);
    const encodedPassword = btoa(password);
    this.setCookie('hueychat_remember_u', encodedUsername, 30); // 30天过期
    this.setCookie('hueychat_remember_p', encodedPassword, 30);
    this.setCookie('hueychat_remember', 'true', 30);
  }

  // 获取记住的登录信息
  getRememberedCredentials() {
    if (this.getCookie('hueychat_remember') !== 'true') {
      return null;
    }
    
    const encodedUsername = this.getCookie('hueychat_remember_u');
    const encodedPassword = this.getCookie('hueychat_remember_p');
    
    if (!encodedUsername || !encodedPassword) {
      return null;
    }

    try {
      return {
        username: atob(encodedUsername),
        password: atob(encodedPassword)
      };
    } catch (error) {
      console.error('解码记住的登录信息失败:', error);
      return null;
    }
  }

  // 清除记住的登录信息
  clearRememberedCredentials() {
    this.deleteCookie('hueychat_remember_u');
    this.deleteCookie('hueychat_remember_p');
    this.deleteCookie('hueychat_remember');
  }

  // 检查是否已登录
  isLoggedIn() {
    return this.user && this.getToken();
  }

  // API请求封装
  async apiRequest(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `API请求失败: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 用户注册
  async register(username, password, confirmPassword) {
    const data = await this.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, confirmPassword })
    });

    return data;
  }

  // 用户登录
  async login(username, password) {
    const data = await this.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    this.saveToken(data.data.token);
    this.saveUser(data.data.user);
    
    return data;
  }

  // 获取用户信息
  async getUserProfile() {
    const data = await this.apiRequest('/users/profile');
    return data.data;
  }

  // 更新用户信息
  async updateProfile(userData) {
    const data = await this.apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });

    this.saveUser(data.data);
    return data;
  }

  // 退出登录
  logout(clearRemembered = true) {
    this.clearUser();
    if (clearRemembered) {
      this.clearRememberedCredentials();
    }
  }
}