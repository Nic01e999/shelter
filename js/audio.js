// 白噪音播放模块
let audio = null;
let isPlaying = false;

// 音源列表
const sounds = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3',
  ocean: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
  cafe: 'https://assets.mixkit.co/active_storage/sfx/2462/2462-preview.mp3'
};

export function initAudio() {
  audio = document.getElementById('white-noise-audio');
  audio.loop = true;
  audio.src = sounds.rain;
}

export function togglePlay() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(err => {
      console.error('播放失败:', err);
      alert('音频播放失败，请检查网络连接或尝试其他音源');
      isPlaying = false;
    });
    isPlaying = true;
  }
  return isPlaying;
}

export function changeSound(type) {
  const wasPlaying = isPlaying;
  if (isPlaying) audio.pause();
  audio.src = sounds[type];
  if (wasPlaying) audio.play();
}

export function setVolume(value) {
  audio.volume = value;
}
