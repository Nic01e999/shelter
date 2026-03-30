// 小动物切换模块
const pets = [
  { name: 'cat', layers: ['access/image/cat.png', 'access/image/pets/cat1.PNG', 'access/image/pets/cat2.PNG', 'access/image/pets/cat3.PNG'] },
  { name: 'dog', layers: ['access/image/dog.png', 'access/image/pets/dog1.PNG', 'access/image/pets/dog2.PNG', 'access/image/pets/dog3.PNG'] },
  { name: 'spider', layers: ['access/image/spider.png', 'access/image/pets/spider1.PNG', 'access/image/pets/spider2.PNG', 'access/image/pets/spider3.PNG'] }
];

let currentPetIndex = 0;
let longPressTimer = null;
let isLongPress = false;

const petLayers = document.querySelector('.pet-layers');
const petContainer = document.querySelector('.pet');

// 创建切换菜单
const menu = document.createElement('div');
menu.className = 'pet-menu';
menu.innerHTML = pets.map((pet, i) =>
  `<div class="pet-option" data-index="${i}">
    <img src="${pet.layers[0]}" alt="${pet.name}">
  </div>`
).join('');
petContainer.appendChild(menu);

// 长按检测
petLayers.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isLongPress = false;
  window.petIsLongPress = false;
  longPressTimer = setTimeout(() => {
    isLongPress = true;
    window.petIsLongPress = true;
    menu.classList.add('show');
  }, 500);
});

petLayers.addEventListener('mouseup', () => {
  clearTimeout(longPressTimer);
});

petLayers.addEventListener('mouseleave', () => {
  clearTimeout(longPressTimer);
  isLongPress = false;
  window.petIsLongPress = false;
});

// 触摸设备支持
petLayers.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isLongPress = false;
  window.petIsLongPress = false;
  longPressTimer = setTimeout(() => {
    isLongPress = true;
    window.petIsLongPress = true;
    menu.classList.add('show');
  }, 500);
});

petLayers.addEventListener('touchend', () => {
  clearTimeout(longPressTimer);
});

// 切换小动物
menu.addEventListener('click', (e) => {
  const option = e.target.closest('.pet-option');
  if (option) {
    currentPetIndex = parseInt(option.dataset.index);
    const layers = document.querySelectorAll('.pet-layer');
    layers[0].src = pets[currentPetIndex].layers[0];
    layers[1].src = pets[currentPetIndex].layers[1];
    layers[2].src = pets[currentPetIndex].layers[2];
    layers[3].src = pets[currentPetIndex].layers[3];
    localStorage.setItem('selectedPet', currentPetIndex);
    menu.classList.remove('show');
  }
});

// 点击其他地方关闭菜单
document.addEventListener('click', (e) => {
  if (!petContainer.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// 加载保存的选择
const saved = localStorage.getItem('selectedPet');
if (saved !== null) {
  currentPetIndex = parseInt(saved);
  const layers = document.querySelectorAll('.pet-layer');
  layers[0].src = pets[currentPetIndex].layers[0];
  layers[1].src = pets[currentPetIndex].layers[1];
  layers[2].src = pets[currentPetIndex].layers[2];
  layers[3].src = pets[currentPetIndex].layers[3];
}
