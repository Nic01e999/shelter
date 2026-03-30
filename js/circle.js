// 圆形轨道系统
import api from './api.js';

const container = document.querySelector('.container');
const radius = 350;
const centerX = 350;
const centerY = 350;
let selectedItem = null;
let currentUserId = parseInt(localStorage.getItem('userId')) || 1;
let projects = [];

function setPosition(item, angle) {
  const rad = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(rad) - item.offsetWidth / 2;
  const y = centerY + radius * Math.sin(rad) - item.offsetHeight / 2;
  item.style.left = x + 'px';
  item.style.top = y + 'px';
  item.dataset.angle = angle;
}

async function loadProjects() {
  projects = await api.getProjects(currentUserId);
  container.querySelectorAll('.item').forEach(item => item.remove());
  projects.forEach(project => {
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.projectId = project.id;
    item.dataset.angle = project.position_angle;
    item.textContent = project.title;
    container.appendChild(item);
    setPosition(item, project.position_angle);
    item.addEventListener('click', () => selectItem(item, project));
  });
}

async function saveProject(item, saveTasks = false) {
  const { getProjectTasks } = await import('./todo.js');
  const projectId = item.dataset.projectId;
  const title = item.textContent;
  const angle = parseFloat(item.dataset.angle);

  if (!projectId) {
    const result = await api.createProject(currentUserId, title, angle, []);
    item.dataset.projectId = result.id;
    return;
  }

  let tasks;
  if (saveTasks && item === selectedItem) {
    tasks = getProjectTasks();
  } else {
    const currentProject = projects.find(p => p.id == projectId);
    tasks = currentProject ? currentProject.tasks : [];
  }

  await api.updateProject(projectId, title, angle, tasks);

  const projectIndex = projects.findIndex(p => p.id == projectId);
  if (projectIndex !== -1) {
    projects[projectIndex] = { ...projects[projectIndex], title, position_angle: angle, tasks };
  }
}

async function selectItem(item, project) {
  const { loadProjectTasks } = await import('./todo.js');
  const { updateButtonStates } = await import('./main.js');

  if (selectedItem && selectedItem !== item) {
    await saveProject(selectedItem, true);
  }

  if (selectedItem) selectedItem.classList.remove('selected');
  selectedItem = item;
  item.classList.add('selected');
  document.getElementById('itemText').value = item.textContent;
  document.getElementById('panel-display').classList.remove('hidden');

  const projectId = item.dataset.projectId;
  const currentProject = projects.find(p => p.id == projectId);
  loadProjectTasks(currentProject?.tasks || []);
  updateButtonStates();
}

function getSelectedItem() {
  return selectedItem;
}

function setSelectedItem(item) {
  selectedItem = item;
}

export {
  setPosition,
  loadProjects,
  saveProject,
  selectItem,
  getSelectedItem,
  setSelectedItem,
  currentUserId,
  container,
  centerX,
  centerY
};
