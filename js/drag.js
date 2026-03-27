// 拖拽交互系统
import { setPosition, saveProject, container, centerX, centerY } from './circle.js';

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

export { dragging };
