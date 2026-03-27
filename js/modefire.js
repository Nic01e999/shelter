let timerInterval = null;
let startTime = null;

export function initModefire() {
  bindEvents();
  restoreState();
}

function bindEvents() {
  document.getElementById('fire-toggle').addEventListener('click', toggleFocus);
}

async function toggleFocus() {
  const savedStartTime = localStorage.getItem('focusStartTime');
  const btn = document.getElementById('fire-toggle');

  if (savedStartTime) {
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime) - new Date(savedStartTime)) / 1000);
    await api.saveFocus(savedStartTime, endTime, duration);
    localStorage.removeItem('focusStartTime');
    stopTimer();
    btn.classList.remove('active');
    loadHistory();
  } else {
    startTime = new Date().toISOString();
    localStorage.setItem('focusStartTime', startTime);
    startTimer();
    btn.classList.add('active');
  }
}

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById('fire-timer').textContent = '00:00:00';
}

function updateTimer() {
  const savedStartTime = localStorage.getItem('focusStartTime');
  if (!savedStartTime) return;

  const elapsed = Math.floor((Date.now() - new Date(savedStartTime)) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  document.getElementById('fire-timer').textContent =
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function restoreState() {
  const savedStartTime = localStorage.getItem('focusStartTime');
  if (savedStartTime) {
    startTime = savedStartTime;
    document.getElementById('fire-toggle').classList.add('active');
    startTimer();
  }
}
