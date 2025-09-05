// 消息格式化和处理工具
export function formatMessageContent(text) {
  // 先处理换行
  let formattedText = text.replace(/\n/g, '<br/>');
  
  // 处理代码块 ```语言\n代码\n```（注意：此时换行符已被替换为<br/>）
  formattedText = formattedText.replace(/```(\w*)<br\/?>?([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'text';
    // 将代码内容中的<br/>转回换行符
    const cleanCode = code.replace(/<br\/?>/g, '\n').trim();
    return `<div class="code-block"><div class="code-header"><span class="code-language">${lang}</span><button class="copy-button" onclick="copyCode(this)" title="复制代码">复制</button></div><div class="code-content"><pre><code class="language-${lang}">${escapeHtml(cleanCode)}</code></pre></div></div>`;
  });
  
  // 处理内联代码 `代码`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // 清理代码块后的多余br标签
  formattedText = formattedText.replace(/<\/div>(<br\/?>){1,2}/g, '</div>');
  
  return formattedText;
}

// HTML转义函数
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 复制代码功能
export function copyCode(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }).catch(() => {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const originalText = button.textContent;
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
}

// 添加消息到聊天窗口
export function addMessage(text, type, isError = false) {
  const messagesContainer = document.querySelector('.chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  const formattedContent = formatMessageContent(text);
  
  messageDiv.innerHTML = `
    <div class="message-content ${isError ? 'error' : ''}">
      <div class="message-text">${formattedContent}</div>
    </div>
    <div class="message-time">${timeStr}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}