import CONFIG from './config.js';

// 会话历史存储（页面刷新后清空）
const chatHistory = new Map();

// 轻量 Markdown 格式化
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

/**
 * 统一的聊天处理函数
 * @param {Object} options - 配置选项
 * @param {string} options.message - 用户消息
 * @param {string} options.role - 聊天角色 (psychology/taskbreaker)
 * @param {HTMLElement} options.messagesContainer - 消息容器
 * @param {HTMLInputElement} options.inputElement - 输入框
 * @param {number} options.userId - 用户ID
 * @param {number} options.projectId - 项目ID（可选）
 * @param {Function} options.onSuccess - 成功回调
 */
export async function sendChatMessage(options) {
  const { message, role, messagesContainer, inputElement, userId, projectId, onSuccess } = options;

  // 获取或创建会话历史
  const sessionKey = `${userId}_${projectId}_${role}`;
  if (!chatHistory.has(sessionKey)) {
    chatHistory.set(sessionKey, []);
  }
  const history = chatHistory.get(sessionKey);

  if (!message.trim()) return;

  // 显示用户消息
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user-message';
  userMsg.textContent = message;
  messagesContainer.appendChild(userMsg);
  inputElement.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // 显示思考动画
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const response = await fetch(`${CONFIG.API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ user_id: userId, project_id: projectId, message, role, history })
    });

    const data = await response.json();
    typingIndicator.remove();

    if (data.success) {
      // 更新会话历史
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: data.response });

      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      aiMsg.innerHTML = formatMarkdown(data.response);
      messagesContainer.appendChild(aiMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // 如果创建了项目，刷新项目列表
      if (data.project_created) {
        const { loadProjects } = await import('./circle.js');
        await loadProjects();
      }

      // 如果更新了待办清单，执行回调
      if (data.todolist_updated && onSuccess) {
        await onSuccess();
      }
    } else {
      showError(messagesContainer, data.error || '未知错误');
    }
  } catch (error) {
    typingIndicator.remove();
    showError(messagesContainer, error.message);
    console.error('发送消息失败:', error);
  }
}

function showError(container, message) {
  const errorMsg = document.createElement('div');
  errorMsg.className = 'chat-message ai-message';
  errorMsg.textContent = `错误: ${message}`;
  container.appendChild(errorMsg);
  container.scrollTop = container.scrollHeight;
}
