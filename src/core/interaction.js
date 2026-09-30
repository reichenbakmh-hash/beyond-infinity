import * as THREE from 'three';
import { store } from './store.js';
import { items } from '../data/items.js';
import { wait } from './util.js';
import { markerTexture } from '../scenes/textures.js';

const a = new THREE.Vector3();
const b = new THREE.Vector3();
const f = new THREE.Vector3();

export function createInteractions({ camera, ui, audio, events }) {
  const entries = [];
  const dotTex = markerTexture();
  let target = null;
  let busy = false;

  const handlers = {
    say: s => ui.say(s.text, s.ms),
    sfx: async s => {
      audio.play(s.name);
    },
    wait: s => wait(s.ms),
    phone: s => ui.openPhone(s.view),
    collect: async s => {
      if (store.add(s.item)) {
        audio.play('collect');
        ui.toast(items[s.item].name);
      }
    },
    flag: async s => {
      store.set(s.key, s.value ?? true);
    },
    event: s => events.emit(s.name)
  };

  function register(def, anchor) {
    const mat = new THREE.SpriteMaterial({
      map: dotTex,
      color: 0xffd9e2,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0
    });
    const marker = new THREE.Sprite(mat);
    marker.scale.setScalar(0.16);
    anchor.add(marker);
    entries.push({ def, anchor, marker, mat });
  }

  function update(active, time) {
    camera.getWorldDirection(f);
    let best = null;
    let bestScore = -1;
    for (const e of entries) {
      const on = !e.def.requires || store.flag(e.def.requires);
      e.marker.visible = on;
      if (!on) continue;
      e.anchor.getWorldPosition(a);
      b.copy(a).sub(camera.position);
      const dist = b.length();
      const seen = store.flag('seen:' + e.def.id);
      const near = Math.max(0, 1 - dist / 6);
      e.mat.opacity = near * (seen ? 0.22 : 0.7) * (0.75 + 0.25 * Math.sin(time * 2.4 + dist));
      if (!active || busy || dist > (e.def.radius ?? 2)) continue;
      b.divideScalar(dist);
      const dot = b.dot(f);
      if (dot < 0.8) continue;
      const score = dot - dist * 0.08;
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }
    target = best;
    return best ? best.def.label : null;
  }

  async function trigger() {
    if (!target || busy) return;
    const def = target.def;
    busy = true;
    const steps = store.flag('seen:' + def.id) && def.after ? def.after : def.steps;
    try {
      for (const s of steps) await handlers[s.do](s);
    } finally {
      store.set('seen:' + def.id);
      busy = false;
    }
  }

  return { register, update, trigger };
}
