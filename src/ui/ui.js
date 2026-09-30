import { store } from '../core/store.js';
import { items } from '../data/items.js';
import { phoneViews } from '../data/phone.js';
import { assets, placeholders } from '../data/assets.js';
import { wait } from '../core/util.js';

const $ = id => document.getElementById(id);

export function createUI({ audio, hooks }) {
  const el = {
    prompt: $('prompt'),
    promptT: $('prompt-t'),
    dot: $('dot'),
    act: $('btn-act'),
    sub: $('sub'),
    title: $('title'),
    toast: $('toast'),
    hint: $('hint'),
    veil: $('veil'),
    card: $('card'),
    cardK: $('card-k'),
    cardT: $('card-t'),
    cardL: $('card-l'),
    cardB: $('card-b'),
    phone: $('phone'),
    phoneStamp: $('phone-stamp'),
    phoneBody: $('phone-body'),
    phoneClose: $('phone-close'),
    phoneX: $('phone-x'),
    bag: $('bag'),
    bagList: $('bag-list'),
    bagX: $('bag-x'),
    pause: $('pause'),
    bResume: $('m-resume'),
    bSound: $('m-sound'),
    bMusic: $('m-music'),
    bQuality: $('m-quality'),
    bFull: $('m-full'),
    bRestart: $('m-restart')
  };

  function timed(node) {
    let timer = 0;
    let pending = null;
    return (text, ms) => {
      clearTimeout(timer);
      if (pending) pending();
      node.textContent = text;
      node.classList.add('on');
      const d = ms ?? 1700 + text.length * 55;
      return new Promise(resolve => {
        pending = resolve;
        timer = setTimeout(() => {
          node.classList.remove('on');
          pending = null;
          resolve();
        }, d);
      });
    };
  }

  const say = timed(el.sub);
  const title = timed(el.title);

  let current = null;
  function setPrompt(label) {
    if (label === current) return;
    current = label;
    const on = !!label;
    if (on) el.promptT.textContent = label;
    el.prompt.classList.toggle('on', on);
    el.dot.classList.toggle('lit', on);
    el.act.classList.toggle('ready', on);
  }

  let toastTimer = 0;
  function toast(text) {
    clearTimeout(toastTimer);
    el.toast.textContent = text;
    el.toast.classList.add('on');
    toastTimer = setTimeout(() => el.toast.classList.remove('on'), 2400);
  }

  let hintTimer = 0;
  function hint(text, ms) {
    clearTimeout(hintTimer);
    el.hint.textContent = text;
    el.hint.classList.add('on');
    hintTimer = setTimeout(() => el.hint.classList.remove('on'), ms);
  }

  function videoCard(ref) {
    const wrap = document.createElement('div');
    wrap.className = 'vid';
    const src = assets.video[ref];
    if (src) {
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.playsInline = true;
      v.preload = 'metadata';
      wrap.append(v);
    } else {
      const tri = document.createElement('div');
      tri.className = 'tri';
      const label = document.createElement('small');
      label.textContent = placeholders.video[ref];
      wrap.append(tri, label);
    }
    return wrap;
  }

  function trackChip() {
    const track = assets.audio.track;
    if (track.src) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = track.title + ' — ' + track.artist;
      b.onclick = () => {
        audio.toggleMusic();
      };
      return b;
    }
    const d = document.createElement('div');
    d.className = 'chip';
    d.textContent = placeholders.audio.track;
    return d;
  }

  function buildPhone(viewId) {
    const view = phoneViews[viewId];
    el.phoneStamp.textContent = view.stamp;
    el.phoneBody.innerHTML = '';
    view.thread.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'row ' + m.side;
      row.style.animationDelay = 0.3 + i * 0.3 + 's';
      if (m.kind === 'video') row.append(videoCard(m.ref));
      else if (m.kind === 'track') row.append(trackChip());
      else {
        const bub = document.createElement('div');
        bub.className = 'bub';
        m.lines.forEach(w => {
          const line = document.createElement('i');
          line.style.width = w + '%';
          bub.append(line);
        });
        row.append(bub);
      }
      el.phoneBody.append(row);
    });
  }

  function openPhone(viewId) {
    return new Promise(resolve => {
      hooks.onOpen();
      buildPhone(viewId);
      el.phone.classList.add('on');
      const close = () => {
        el.phone.classList.remove('on');
        el.phoneBody.querySelectorAll('video').forEach(v => v.pause());
        hooks.onClose();
        resolve();
      };
      el.phoneClose.onclick = close;
      el.phoneX.onclick = close;
      el.phone.onclick = e => {
        if (e.target === el.phone) close();
      };
    });
  }

  function renderBag() {
    el.bagList.innerHTML = '';
    const owned = store.items();
    if (!owned.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'Rien pour l\'instant.';
      el.bagList.append(p);
      return;
    }
    owned.forEach(id => {
      const it = items[id];
      const row = document.createElement('div');
      row.className = 'it';
      const name = document.createElement('b');
      name.textContent = it.name;
      const text = document.createElement('p');
      text.textContent = it.text;
      row.append(name, text);
      if (it.placeholder) {
        const code = document.createElement('code');
        code.textContent = it.placeholder;
        row.append(code);
      }
      el.bagList.append(row);
    });
  }

  function openBag() {
    renderBag();
    el.bag.classList.add('on');
  }
  function closeBag() {
    el.bag.classList.remove('on');
  }
  el.bagX.onclick = () => hooks.closeBag();

  const openPause = () => el.pause.classList.add('on');
  const closePause = () => el.pause.classList.remove('on');

  function bindMenu(h) {
    el.bResume.onclick = h.resume;
    el.bSound.onclick = () => {
      el.bSound.textContent = h.sound();
    };
    el.bMusic.hidden = !h.hasMusic;
    el.bMusic.onclick = () => {
      el.bMusic.textContent = h.music();
    };
    el.bQuality.textContent = h.qualityLabel;
    el.bQuality.onclick = () => {
      el.bQuality.textContent = h.quality();
    };
    el.bFull.hidden = !document.fullscreenEnabled;
    el.bFull.onclick = h.full;
    el.bRestart.onclick = h.restart;
  }

  function veil(to, ms) {
    el.veil.style.transitionDuration = ms + 'ms';
    el.veil.style.opacity = to;
    return wait(ms);
  }

  function card({ kicker, title: t, line, action }) {
    el.cardK.textContent = kicker;
    el.cardT.textContent = t;
    el.cardL.textContent = line || '';
    el.card.classList.add('on');
    return new Promise(resolve => {
      el.cardB.textContent = action;
      el.cardB.onclick = () => {
        el.card.classList.remove('on');
        resolve();
      };
    });
  }

  return {
    say,
    title,
    setPrompt,
    toast,
    hint,
    openPhone,
    openBag,
    closeBag,
    openPause,
    closePause,
    bindMenu,
    veil,
    card
  };
}
