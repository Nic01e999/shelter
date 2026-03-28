const planets = [
  { name: 'earth', image: 'access/image/earth.PNG' },
  { name: 'saturn', image: 'access/image/saturn.PNG' },
  { name: 'mars', image: 'access/image/mars.PNG' },
];

let currentPlanetIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  const planetContainer = document.querySelector('.planet-container');
  const planetImage = document.querySelector('.planet-image');
  const menu = document.querySelector('.planet-menu');

  if (!planetContainer || !planetImage || !menu) return;

  let planetLongPressTimer = null;
  planetContainer.style.cursor = 'pointer';

// 生成菜单
menu.innerHTML = planets.map((planet, i) =>
  `<div class="planet-option" data-index="${i}">
    <img src="${planet.image}" alt="${planet.name}">
  </div>`
).join('');

// 长按显示菜单
planetContainer.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  planetLongPressTimer = setTimeout(() => menu.classList.add('show'), 500);
});

planetContainer.addEventListener('mouseup', () => clearTimeout(planetLongPressTimer));
planetContainer.addEventListener('mouseleave', () => clearTimeout(planetLongPressTimer));

// 触摸支持
planetContainer.addEventListener('touchstart', (e) => {
  e.preventDefault();
  planetLongPressTimer = setTimeout(() => menu.classList.add('show'), 500);
});

planetContainer.addEventListener('touchend', () => clearTimeout(planetLongPressTimer));

// 切换星球
menu.addEventListener('click', (e) => {
  const option = e.target.closest('.planet-option');
  if (option) {
    currentPlanetIndex = parseInt(option.dataset.index);
    planetImage.src = planets[currentPlanetIndex].image;
    localStorage.setItem('selectedPlanet', currentPlanetIndex);
    menu.classList.remove('show');
  }
});

// 点击其他地方关闭菜单
document.addEventListener('click', (e) => {
  if (!planetContainer.contains(e.target)) {
    menu.classList.remove('show');
  }
});

  // 加载保存的选择
  const saved = localStorage.getItem('selectedPlanet');
  if (saved !== null) {
    currentPlanetIndex = parseInt(saved);
    planetImage.src = planets[currentPlanetIndex].image;
  }
});
