// 主入口文件
import { loadProjects, saveProject, selectItem, getSelectedItem, setSelectedItem, setPosition } from './circle.js';
import { initModefire } from './modefire.js';
import './drag.js';

// 初始化
loadProjects();
initModefire();

// 宠物聊天窗口切换
const petImg = document.getElementById('petImg');
const chatWindow = document.getElementById('chat-window');
petImg.addEventListener('click', () => {
  chatWindow.style.display = chatWindow.style.display === 'none' || chatWindow.style.display === '' ? 'block' : 'none';
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
