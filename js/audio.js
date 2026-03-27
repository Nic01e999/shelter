// 白噪音播放模块
let audio = null;
let isPlaying = false;

// 音源列表
const sounds = {
  rain: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2b3f3c5d5f.mp3',
  ocean: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0b2c0e3f5f.mp3',
  cafe: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3e8d9c4f2a.mp3'
};

export function initAudio() {
  audio = document.getElementById('white-noise-audio');
  audio.loop = true;
  audio.volume = 0.5;
}

export function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
  isPlaying = !isPlaying;
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
