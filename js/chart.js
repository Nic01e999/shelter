let chartInstance = null;
let currentView = 'daily';

async function loadChart(view) {
  currentView = view;
  let data;

  try {
    if (view === 'daily') {
      data = await api.getFocusHistory(7);
    } else if (view === 'hourly') {
      const response = await fetch('http://localhost:9999/api/modefire/history/hourly?hours=24');
      data = await response.json();
    } else if (view === 'weekly') {
      const response = await fetch('http://localhost:9999/api/modefire/history/weekly?weeks=12');
      data = await response.json();
    }

    drawChart(data, view);
  } catch (error) {
    console.error('Error loading chart:', error);
  }
}

function drawChart(data, view) {
  const canvas = document.getElementById('fire-chart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, '#ff9a56');
  gradient.addColorStop(1, '#ff6b35');

  let labels, values;
  if (view === 'daily') {
    labels = data.map(d => {
      const localDate = new Date(d.date + 'T00:00:00Z');
      return `${localDate.getMonth() + 1}/${localDate.getDate()}`;
    });
    values = data.map(d => d.duration);
  } else if (view === 'hourly') {
    labels = data.map(d => {
      const localTime = new Date(d.hour + ':00Z');
      return `${localTime.getHours()}:00`;
    });
    values = data.map(d => d.duration);
  } else {
    labels = data.map(d => d.week.slice(5));
    values = data.map(d => d.duration);
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: gradient,
        borderWidth: 0,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatDuration(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b0b0',
            callback: (value) => formatDuration(value)
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#b0b0b0' },
          grid: { display: false }
        }
      }
    }
  });
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadChart(tab.dataset.view);
  });
});

window.addEventListener('DOMContentLoaded', () => loadChart('daily'));
