async function loadHistory() {
  try {
    console.log('Fetching history...');
    const data = await api.getFocusHistory(7);
    console.log('History data:', data);
    drawChart(data);
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

function drawChart(data) {
  console.log('Drawing chart with data:', data);
  const canvas = document.getElementById('fire-chart');
  console.log('Canvas element:', canvas);
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  console.log('Canvas size:', width, height);

  ctx.clearRect(0, 0, width, height);

  // 绘制白色背景便于查看
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  if (!data || data.length === 0) {
    ctx.fillStyle = '#667eea';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', width / 2, height / 2);
    return;
  }

  const maxDuration = Math.max(...data.map(d => d.duration));
  const fixedBarWidth = 80;
  const barSpacing = 20;
  const totalWidth = data.length * (fixedBarWidth + barSpacing);
  const startX = (width - totalWidth) / 2;
  const padding = 40;

  data.forEach((item, index) => {
    const barHeight = ((item.duration / maxDuration) * (height - padding * 2));
    const x = startX + index * (fixedBarWidth + barSpacing);
    const y = height - padding - barHeight;

    console.log(`Bar ${index}: x=${x}, y=${y}, width=${fixedBarWidth}, height=${barHeight}`);

    const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, fixedBarWidth, barHeight);

    ctx.fillStyle = '#ffd700';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.date.slice(5), x + fixedBarWidth / 2, height - 10);

    const hours = Math.floor(item.duration / 3600);
    const minutes = Math.floor((item.duration % 3600) / 60);
    ctx.fillText(`${hours}h${minutes}m`, x + fixedBarWidth / 2, y - 5);
  });
}

window.addEventListener('DOMContentLoaded', loadHistory);
