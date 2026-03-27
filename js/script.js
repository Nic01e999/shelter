const container = document.querySelector('.container');
const radius = 300;
const centerX = 300;
const centerY = 300;
let selectedItem = null;
let currentUserId = 1; // 默认用户ID
let todos = [];

function setPosition(item, angle) {
  const rad = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(rad) - item.offsetWidth / 2;
  const y = centerY + radius * Math.sin(rad) - item.offsetHeight / 2;
  item.style.left = x + 'px';
  item.style.top = y + 'px';
  item.dataset.angle = angle;
}

async function loadTodos() {
  todos = await api.getTodos(currentUserId);
  container.querySelectorAll('.item').forEach(item => item.remove());
  todos.forEach(todo => {
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.todoId = todo.id;
    item.dataset.angle = todo.position_angle;
    item.textContent = todo.title;
    container.appendChild(item);
    setPosition(item, todo.position_angle);
    item.addEventListener('click', () => selectItem(item));
  });
}

async function saveTodo(item) {
  const todoId = item.dataset.todoId;
  const title = item.textContent;
  const angle = parseFloat(item.dataset.angle);
  const tasks = getTodoTasks();

  if (todoId) {
    await api.updateTodo(todoId, title, angle, tasks);
  } else {
    const result = await api.createTodo(currentUserId, title, angle, tasks);
    item.dataset.todoId = result.id;
  }
}

function getTodoTasks() {
  const tasks = [];
  document.querySelectorAll('.todo-item').forEach(item => {
    const text = item.querySelector('.todo-input').textContent.trim();
    if (text) tasks.push(text);
  });
  return tasks;
}

function initItems() {
  loadTodos();
}

function selectItem(item) {
  if (selectedItem) selectedItem.classList.remove('selected');
  selectedItem = item;
  item.classList.add('selected');
  document.getElementById('itemText').value = item.textContent;
}

initItems();

document.getElementById('itemText').addEventListener('input', (e) => {
  if (selectedItem) {
    selectedItem.textContent = e.target.value;
    saveTodo(selectedItem);
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  if (selectedItem) {
    const todoId = selectedItem.dataset.todoId;
    if (todoId) await api.deleteTodo(todoId);
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
  item.addEventListener('click', () => selectItem(item));
  await saveTodo(item);
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
    saveTodo(dragging);
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
  const input = document.createElement('div');
  input.className = 'todo-input';
  input.contentEditable = 'true';
  input.setAttribute('data-placeholder', '待办事项');
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
    }
  });
  item.appendChild(checkbox);
  item.appendChild(input);
  return item;
}

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
  }
});
