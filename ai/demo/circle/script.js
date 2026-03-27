const container = document.querySelector('.container');
const items = document.querySelectorAll('.item');
const radius = 175;
const centerX = 200;
const centerY = 200;

function setPosition(item, angle) {
  const rad = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(rad) - 25;
  const y = centerY + radius * Math.sin(rad) - 25;
  item.style.left = x + 'px';
  item.style.top = y + 'px';
  item.dataset.angle = angle;
}

items.forEach(item => setPosition(item, parseFloat(item.dataset.angle)));

let dragging = null;
let zIndex = 1;

items.forEach(item => {
  item.addEventListener('mousedown', (e) => {
    dragging = item;
    item.classList.add('dragging');
    item.style.zIndex = ++zIndex;
  });
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
