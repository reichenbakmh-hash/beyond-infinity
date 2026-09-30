import { wait } from '../core/util.js';

export async function playIntro({ audio, room }) {
  const intro = document.getElementById('intro');
  const clock = document.getElementById('clock');
  const hm = document.getElementById('clock-hm');
  const s = document.getElementById('clock-s');

  document.getElementById('start').classList.add('gone');
  await wait(1000);
  clock.classList.add('on');

  for (const sec of [58, 59, 0]) {
    await wait(1000);
    audio.play('tick');
    if (sec === 0) hm.textContent = '00:11';
    s.textContent = ':' + String(sec).padStart(2, '0');
  }

  await wait(900);
  audio.play('reveal');
  clock.classList.add('collapse');
  await wait(1500);

  intro.classList.add('lift');
  audio.fadeAmbience(1, 5);
  room.fade(3400);
  await wait(1800);
  setTimeout(() => intro.classList.add('gone'), 1200);
}
