export function createAudio(assets) {
  let ctx = null;
  let master = null;
  let bus = null;
  let amb = null;
  let shared = null;
  let muted = false;
  let music = null;
  let musicOn = false;

  const noise = sec => {
    const n = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  };

  function ambience() {
    amb = ctx.createGain();
    amb.gain.value = 0;
    amb.connect(master);
    const src = ctx.createBufferSource();
    src.buffer = noise(4);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    src.connect(lp);
    lp.connect(g);
    g.connect(amb);
    src.start();
    [55, 82.41].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = 0.012;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lg = ctx.createGain();
      lg.gain.value = 0.008;
      lfo.connect(lg);
      lg.connect(og.gain);
      o.connect(og);
      og.connect(amb);
      o.start();
      lfo.start();
    });
  }

  function tone({ f = 440, to = null, type = 'sine', t0 = 0, dur = 0.2, gain = 0.15, attack = 0.005 }) {
    const t = ctx.currentTime + t0;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function burst({ dur = 0.08, from = 400, to = null, q = 0.7, gain = 0.1, type = 'lowpass', t0 = 0 }) {
    const t = ctx.currentTime + t0;
    const s = ctx.createBufferSource();
    s.buffer = shared;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(bus);
    s.start(t, Math.random() * 1.2);
    s.stop(t + dur + 0.05);
  }

  const sounds = {
    tap: () => tone({ f: 720, to: 540, dur: 0.09, gain: 0.1, type: 'triangle' }),
    ui: () => tone({ f: 520, dur: 0.06, gain: 0.05 }),
    tick: () => tone({ f: 1400, to: 900, dur: 0.035, gain: 0.04, type: 'square' }),
    pop: () => tone({ f: 300, to: 900, dur: 0.12, gain: 0.13 }),
    step: () => burst({ dur: 0.07, from: 200 + Math.random() * 70, gain: 0.07 }),
    collect: () => {
      tone({ f: 660, dur: 0.35, gain: 0.1 });
      tone({ f: 990, t0: 0.09, dur: 0.45, gain: 0.08 });
      tone({ f: 1320, t0: 0.18, dur: 0.6, gain: 0.05 });
    },
    reveal: () => {
      [220, 330, 440].forEach((f, i) => tone({ f, t0: i * 0.12, dur: 3.6, gain: 0.05, attack: 0.9 }));
      burst({ dur: 3, from: 120, to: 900, gain: 0.05, type: 'bandpass', q: 0.4 });
    },
    door: () => {
      burst({ dur: 2.2, from: 320, to: 110, gain: 0.11, q: 1.4 });
      tone({ f: 92, to: 58, dur: 2, gain: 0.06, type: 'triangle', attack: 0.4 });
    },
    transition: () => {
      burst({ dur: 2.6, from: 200, to: 2200, gain: 0.12, type: 'bandpass', q: 0.5 });
      [261.6, 392, 523.2].forEach((f, i) => tone({ f, t0: 0.4 + i * 0.2, dur: 3, gain: 0.04, attack: 0.8 }));
    }
  };

  const api = {
    unlock() {
      if (ctx) {
        ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
      bus = ctx.createGain();
      bus.gain.value = 0.85;
      bus.connect(master);
      shared = noise(4);
      ambience();
    },
    play(name) {
      if (!ctx || muted || ctx.state !== 'running') return;
      const fn = sounds[name];
      if (fn) fn();
    },
    fadeAmbience(to, sec) {
      if (!ctx) return;
      const t = ctx.currentTime;
      amb.gain.cancelScheduledValues(t);
      amb.gain.setValueAtTime(amb.gain.value, t);
      amb.gain.linearRampToValueAtTime(to, t + sec);
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.9;
      if (music) {
        if (muted) music.pause();
        else if (musicOn) music.play().catch(() => {});
      }
      return muted ? 'Son : coupé' : 'Son : actif';
    },
    hasMusic: () => !!assets.audio.track.src,
    toggleMusic() {
      if (!assets.audio.track.src) return 'Musique : non';
      if (!music) {
        music = new Audio(assets.audio.track.src);
        music.loop = true;
        music.volume = 0.55;
      }
      musicOn = !musicOn;
      if (musicOn && !muted) music.play().catch(() => {});
      else music.pause();
      return musicOn ? 'Musique : oui' : 'Musique : non';
    },
    isMusicOn: () => musicOn,
    suspend() {
      if (ctx) ctx.suspend();
      if (music) music.pause();
    },
    resume() {
      if (ctx) ctx.resume();
      if (music && musicOn && !muted) music.play().catch(() => {});
    }
  };

  return api;
}
