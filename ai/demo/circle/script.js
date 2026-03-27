const container = document.querySelector('.container');
const radius = 300;
const centerX = 300;
const centerY = 300;
let selectedItem = null;

function setPosition(item, angle) {
  const rad = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(rad) - item.offsetWidth / 2;
  const y = centerY + radius * Math.sin(rad) - item.offsetHeight / 2;
  item.style.left = x + 'px';
  item.style.top = y + 'px';
  item.dataset.angle = angle;
}

function initItems() {
  document.querySelectorAll('.item').forEach(item => {
    setPosition(item, parseFloat(item.dataset.angle));
    item.addEventListener('click', () => selectItem(item));
  });
}

function selectItem(item) {
  if (selectedItem) selectedItem.classList.remove('selected');
  selectedItem = item;
  item.classList.add('selected');
  document.getElementById('itemText').value = item.textContent;
}

initItems();

document.getElementById('itemText').addEventListener('input', (e) => {
  if (selectedItem) selectedItem.textContent = e.target.value;
});

document.getElementById('deleteBtn').addEventListener('click', () => {
  if (selectedItem) {
    selectedItem.remove();
    selectedItem = null;
    document.getElementById('itemText').value = '';
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  const item = document.createElement('div');
  item.className = 'item';
  item.dataset.angle = '0';
  item.textContent = '新项目';
  container.appendChild(item);
  setPosition(item, 0);
  item.addEventListener('click', () => selectItem(item));
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
    dragging = null;
  }
});
