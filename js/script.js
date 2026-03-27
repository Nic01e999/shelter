const container = document.querySelector('.container');
const radius = 300;
const centerX = 300;
const centerY = 300;
let selectedItem = null;
let currentUserId = 1; // 默认用户ID
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
  const projectId = item.dataset.projectId;
  const title = item.textContent;
  const angle = parseFloat(item.dataset.angle);

  let tasks = [];
  if (saveTasks && item === selectedItem) {
    tasks = getProjectTasks();
  } else if (projectId) {
    // 不保存待办时，从服务器获取当前的 tasks
    const response = await fetch(`http://localhost:9999/api/projects/${currentUserId}`);
    const projects = await response.json();
    const currentProject = projects.find(p => p.id == projectId);
    tasks = currentProject ? currentProject.tasks : [];
  }

  if (projectId) {
    await api.updateProject(projectId, title, angle, tasks);
  } else {
    const result = await api.createProject(currentUserId, title, angle, tasks);
    item.dataset.projectId = result.id;
  }
}

function getProjectTasks() {
  const tasks = [];
  document.querySelectorAll('.todo-item').forEach(item => {
    const text = item.querySelector('.todo-input').textContent.trim();
    const completed = item.querySelector('.todo-checkbox').checked;
    if (text) tasks.push({ text, completed });
  });
  return tasks;
}

function initItems() {
  loadProjects();
}

async function selectItem(item, project) {
  // 先保存当前项目的待办事项
  if (selectedItem && selectedItem !== item) {
    await saveProject(selectedItem, true);
  }

  if (selectedItem) selectedItem.classList.remove('selected');
  selectedItem = item;
  item.classList.add('selected');
  document.getElementById('itemText').value = item.textContent;

  // 重新获取最新的项目数据
  const projectId = item.dataset.projectId;
  if (projectId) {
    const response = await fetch(`http://localhost:9999/api/projects/${currentUserId}`);
    const projects = await response.json();
    const latestProject = projects.find(p => p.id == projectId);
    if (latestProject) {
      loadProjectTasks(latestProject.tasks || []);
    }
  } else {
    loadProjectTasks([]);
  }
}

function loadProjectTasks(tasks) {
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';

  if (tasks.length === 0) {
    tasks = [{ text: '', completed: false }];
  }

  tasks.forEach(task => {
    const item = createTodoItem();
    item.querySelector('.todo-input').textContent = task.text;
    item.querySelector('.todo-checkbox').checked = task.completed;
    todoList.appendChild(item);
  });
}

initItems();

document.getElementById('itemText').addEventListener('input', (e) => {
  if (selectedItem) {
    selectedItem.textContent = e.target.value;
    saveProject(selectedItem);
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  if (selectedItem) {
    const projectId = selectedItem.dataset.projectId;
    if (projectId) await api.deleteProject(projectId);
    selectedItem.remove();
    selectedItem = null;
    document.getElementById('itemText').value = '';
  }
});

document.getElementById('addBtn').addEventListener('click', async () => {
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.angle = '0';
  item.textContent = '新项目';
  container.appendChild(item);
  setPosition(item, 0);
  item.addEventListener('click', () => selectItem(item, { tasks: [] }));
  await saveProject(item);
});

let dragging = null;
let zIndex = 1;

container.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('item')) {
    dragging = e.target;
    dragging.classList.add('dragging');
    dragging.style.zIndex = ++zIndex;
  }
});

document.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  setPosition(dragging, angle);
});

document.addEventListener('mouseup', () => {
  if (dragging) {
    dragging.classList.remove('dragging');
    saveProject(dragging);
    dragging = null;
  }
});

const todoList = document.getElementById('todoList');

function createTodoItem() {
  const item = document.createElement('div');
  item.className = 'todo-item';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.addEventListener('change', () => {
    if (selectedItem) saveProject(selectedItem, true);
  });
  const input = document.createElement('div');
  input.className = 'todo-input';
  input.contentEditable = 'true';
  input.setAttribute('data-placeholder', '待办事项');
  input.addEventListener('input', () => {
    if (selectedItem) saveProject(selectedItem, true);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItem = createTodoItem();
      item.after(newItem);
      newItem.querySelector('.todo-input').focus();
    }
    if (e.key === 'Backspace' && input.textContent === '' && todoList.children.length > 1) {
      e.preventDefault();
      const prevItem = item.previousElementSibling;
      const nextItem = item.nextElementSibling;
      item.remove();
      if (prevItem) prevItem.querySelector('.todo-input').focus();
      else if (nextItem) nextItem.querySelector('.todo-input').focus();
      if (selectedItem) saveProject(selectedItem, true);
    }
  });
  item.appendChild(checkbox);
  item.appendChild(input);
  return item;
}

document.querySelector('.todo-input').addEventListener('input', () => {
  if (selectedItem) saveProject(selectedItem, true);
});

document.querySelector('.todo-checkbox').addEventListener('change', () => {
  if (selectedItem) saveProject(selectedItem, true);
});

document.querySelector('.todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const newItem = createTodoItem();
    e.target.closest('.todo-item').after(newItem);
    newItem.querySelector('.todo-input').focus();
  }
  if (e.key === 'Backspace' && e.target.textContent === '' && todoList.children.length > 1) {
    e.preventDefault();
    const item = e.target.closest('.todo-item');
    const prevItem = item.previousElementSibling;
    const nextItem = item.nextElementSibling;
    item.remove();
    if (prevItem) prevItem.querySelector('.todo-input').focus();
    else if (nextItem) nextItem.querySelector('.todo-input').focus();
    if (selectedItem) saveProject(selectedItem, true);
  }
});
