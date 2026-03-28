// 待办清单系统
import { saveProject, getSelectedItem } from './circle.js';

const todoList = document.getElementById('todoList');
let saveTimeout;
let isLoading = false;

function createTodoItem() {
  const item = document.createElement('div');
  item.className = 'todo-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.addEventListener('change', () => {
    const selected = getSelectedItem();
    if (selected) saveProject(selected, true);
  });

  const input = document.createElement('div');
  input.className = 'todo-input';
  input.contentEditable = 'true';
  input.setAttribute('data-placeholder', '待办事项');

  input.addEventListener('input', () => {
    if (isLoading) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const selected = getSelectedItem();
      if (selected) saveProject(selected, true);
    }, 500);
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
      const selected = getSelectedItem();
      if (selected) saveProject(selected, true);
    }
  });

  item.appendChild(checkbox);
  item.appendChild(input);
  return item;
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

function loadProjectTasks(tasks) {
  isLoading = true;
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
  setTimeout(() => isLoading = false, 100);
}

export { createTodoItem, getProjectTasks, loadProjectTasks };
