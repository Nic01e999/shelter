// 认证检查
const token = localStorage.getItem('authToken');
const userId = localStorage.getItem('userId');

if (!token || !userId) {
  window.location.href = '/login.html';
}

async function checkAuth() {
  try {
    const res = await fetch('http://localhost:9999/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = '/login.html';
    }
  } catch (err) {
    console.error('认证检查失败:', err);
  }
}

checkAuth();

// 主入口文件
import { loadProjects, saveProject, selectItem, getSelectedItem, setSelectedItem, setPosition } from './circle.js';
import { initModefire } from './modefire.js';
import { initAudio, togglePlay, changeSound, setVolume } from './audio.js';
import './drag.js';

// 初始化
loadProjects();
initModefire();
initAudio();

// 宠物聊天窗口切换
const petImg = document.getElementById('petImg');
const chatWindow = document.getElementById('chat-window');
petImg.addEventListener('click', () => {
  chatWindow.style.display = chatWindow.style.display === 'none' || chatWindow.style.display === '' ? 'flex' : 'none';
});

// 聊天功能
const chatInput = document.querySelector('.chat-input');
const chatSendBtn = document.querySelector('.chat-send-btn');
const chatMessages = document.querySelector('.chat-messages');

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // 显示用户消息
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user-message';
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // 显示思考动画
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await api.sendChatMessage(1, message);
    typingIndicator.remove();
    if (response.success) {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-message ai-message';
      aiMsg.innerHTML = response.response.replace(/\n/g, '<br>');
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  } catch (error) {
    typingIndicator.remove();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-message ai-message';
    errorMsg.textContent = '宠物遇到了点小意外...';
    chatMessages.appendChild(errorMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    console.error('发送消息失败:', error);
  }
}

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// 项目标题编辑
document.getElementById('itemText').addEventListener('input', (e) => {
  const selected = getSelectedItem();
  if (selected) {
    selected.textContent = e.target.value;
    saveProject(selected);
  }
});

// 删除项目
document.getElementById('deleteBtn').addEventListener('click', async () => {
  const selected = getSelectedItem();
  if (selected) {
    const { loadProjectTasks } = await import('./todo.js');
    const projectId = selected.dataset.projectId;
    if (projectId) await api.deleteProject(projectId);
    selected.remove();
    setSelectedItem(null);
    document.getElementById('itemText').value = '';
    loadProjectTasks([]);
  }
});

// 添加项目
document.getElementById('addBtn').addEventListener('click', async () => {
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.angle = '0';
  item.textContent = '新项目';
  document.querySelector('.container').appendChild(item);
  setPosition(item, 0);
  item.addEventListener('click', () => selectItem(item, { tasks: [] }));
  await saveProject(item);
});

// 白噪音控制
document.getElementById('audio-toggle').addEventListener('click', () => {
  const isPlaying = togglePlay();
  document.getElementById('audio-toggle').textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
});

document.getElementById('audio-source').addEventListener('change', (e) => {
  changeSound(e.target.value);
});

// 登出
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    await fetch('http://localhost:9999/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  window.location.href = '/login.html';
});

