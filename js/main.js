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
import api from './api.js';
import { loadProjects, saveProject, selectItem, getSelectedItem, setSelectedItem, setPosition, currentUserId } from './circle.js';
import { initModefire } from './modefire.js';
import { initAudio, togglePlay, changeSound, setVolume } from './audio.js';
import { sendChatMessage } from './chat.js';
import CONFIG from './config.js';
import './drag.js';

// 更新按钮状态
export function updateButtonStates() {
  const hasSelection = !!getSelectedItem();
  document.getElementById('deleteBtn').disabled = !hasSelection;
  document.getElementById('task-break').disabled = !hasSelection;
}

// 刷新项目数据
async function refreshProjectData(projectId) {
  console.log('🔄 refreshProjectData 被调用, projectId:', projectId);
  const api = await import('./api.js');
  await loadProjects();
  const item = document.querySelector(`[data-project-id="${projectId}"]`);
  console.log('🔍 找到的 item:', item);
  if (item) {
    const projects = await api.default.getProjects(currentUserId);
    console.log('📦 获取到的 projects:', projects);
    const project = projects.find(p => p.id == projectId);
    console.log('🎯 匹配的 project:', project);
    if (project) await selectItem(item, project);
  }
}

// 初始化
loadProjects();
initModefire();
initAudio();
updateButtonStates();

// 宠物聊天窗口切换
const petLayers = document.querySelector('.pet-layers');
const chatWindow = document.getElementById('chat-window');
const chatOverlay = document.getElementById('chat-overlay');
petLayers.addEventListener('click', () => {
  // 添加弹跳动画
  petLayers.classList.add('bounce');
  setTimeout(() => petLayers.classList.remove('bounce'), 500);

  const isVisible = chatWindow.style.display === 'flex';
  chatWindow.style.display = isVisible ? 'none' : 'flex';
  chatOverlay.classList.toggle('show', !isVisible);
});

// 心理老师聊天
const chatInput = document.querySelector('.chat-input');
const chatSendBtn = document.querySelector('.chat-send-btn');
const chatMessages = document.querySelector('.chat-messages');

async function sendPsychologyMessage() {
  const selected = getSelectedItem();
  const projectId = selected?.dataset.projectId;

  await sendChatMessage({
    message: chatInput.value.trim(),
    role: CONFIG.CHAT_ROLES.PSYCHOLOGY,
    messagesContainer: chatMessages,
    inputElement: chatInput,
    userId: currentUserId,
    projectId: projectId ? parseInt(projectId) : undefined,
    onSuccess: () => projectId ? refreshProjectData(parseInt(projectId)) : null
  });
}

chatSendBtn.addEventListener('click', sendPsychologyMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendPsychologyMessage();
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
    document.getElementById('panel-display').classList.add('hidden');
    loadProjectTasks([]);
    updateButtonStates();
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

// TaskBreaker 窗口
const tbWindow = document.getElementById('tb-window');
const tbInput = document.getElementById('tb-input');
const tbSendBtn = document.getElementById('tb-send');
const tbMessages = document.getElementById('tb-messages');

document.getElementById('task-break').addEventListener('click', async () => {
  const selected = getSelectedItem();
  if (!selected) {
    alert('请先选择一个项目');
    return;
  }

  const projectId = parseInt(selected.dataset.projectId);
  if (!projectId) {
    alert('请先保存项目');
    return;
  }

  tbWindow.style.display = 'flex';
  chatOverlay.classList.add('show');
  tbMessages.innerHTML = '';

  const { getProjectTasks } = await import('./todo.js');
  const tasks = getProjectTasks();
  const projectInfo = `项目名称: ${selected.textContent}\n当前待办: ${tasks.map(t => t.text).join(', ') || '无'}`;

  await sendChatMessage({
    message: projectInfo,
    role: CONFIG.CHAT_ROLES.TASKBREAKER,
    messagesContainer: tbMessages,
    inputElement: tbInput,
    userId: currentUserId,
    projectId: projectId,
    onSuccess: () => refreshProjectData(projectId)
  });
});

async function sendTBMessage() {
  const selected = getSelectedItem();
  if (!selected) return;

  const projectId = parseInt(selected.dataset.projectId);
  if (!projectId) {
    alert('项目ID无效');
    return;
  }

  await sendChatMessage({
    message: tbInput.value.trim(),
    role: CONFIG.CHAT_ROLES.TASKBREAKER,
    messagesContainer: tbMessages,
    inputElement: tbInput,
    userId: currentUserId,
    projectId: projectId,
    onSuccess: () => refreshProjectData(projectId)
  });
}

tbSendBtn.addEventListener('click', sendTBMessage);
tbInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendTBMessage();
});

// 空白点击事件
document.addEventListener('click', async (e) => {
  const isItem = e.target.closest('.item');
  const isPanel = e.target.closest('.panel-container');
  const isPet = e.target.closest('.pet');
  const isTB = e.target.closest('#tb-window');

  if (!isItem && !isPanel && !isPet && !isTB) {
    const selected = getSelectedItem();
    if (selected) {
      const { loadProjectTasks } = await import('./todo.js');
      await saveProject(selected, true);
      selected.classList.remove('selected');
      setSelectedItem(null);
      document.getElementById('panel-display').classList.add('hidden');
      updateButtonStates();
    }
    if (chatWindow.style.display === 'flex') {
      chatWindow.style.display = 'none';
      chatOverlay.classList.remove('show');
    }
    if (tbWindow.style.display === 'flex') {
      tbWindow.style.display = 'none';
      chatOverlay.classList.remove('show');
    }
  }
});

