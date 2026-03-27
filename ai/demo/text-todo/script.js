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
      if (prevItem) {
        prevItem.querySelector('.todo-input').focus();
      } else if (nextItem) {
        nextItem.querySelector('.todo-input').focus();
      }
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
    if (prevItem) {
      prevItem.querySelector('.todo-input').focus();
    } else if (nextItem) {
      nextItem.querySelector('.todo-input').focus();
    }
  }
});
