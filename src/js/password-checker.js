// 密码强度检测系统
export class PasswordStrengthChecker {
  constructor() {
    this.requirements = {
      length: { regex: /.{8,}/, text: '至少8个字符' },
      lowercase: { regex: /[a-z]/, text: '包含小写字母' },
      uppercase: { regex: /[A-Z]/, text: '包含大写字母' },
      number: { regex: /[0-9]/, text: '包含数字' },
      special: { regex: /[^A-Za-z0-9]/, text: '包含特殊字符' }
    };
  }

  checkPassword(password) {
    const results = {};
    let score = 0;

    // 检查每个要求
    for (const [key, requirement] of Object.entries(this.requirements)) {
      results[key] = requirement.regex.test(password);
      if (results[key]) score++;
    }

    // 计算强度等级
    let strength = 'weak';
    let strengthText = '密码强度: 弱';
    
    if (score >= 5) {
      strength = 'very-strong';
      strengthText = '密码强度: 非常强';
    } else if (score >= 4) {
      strength = 'strong';
      strengthText = '密码强度: 强';
    } else if (score >= 3) {
      strength = 'good';
      strengthText = '密码强度: 良好';
    } else if (score >= 2) {
      strength = 'fair';
      strengthText = '密码强度: 一般';
    }

    return {
      score,
      strength,
      strengthText,
      requirements: results
    };
  }

  updateUI(password) {
    const strengthContainer = document.getElementById('password-strength');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    if (!strengthContainer || !strengthFill || !strengthText) return;

    if (password.length === 0) {
      strengthContainer.style.display = 'none';
      return;
    }

    strengthContainer.style.display = 'block';
    const result = this.checkPassword(password);

    // 更新强度条
    strengthFill.className = `strength-fill ${result.strength}`;
    
    // 更新强度文本
    strengthText.textContent = result.strengthText;
    strengthText.className = `strength-text ${result.strength}`;

    return result;
  }
}