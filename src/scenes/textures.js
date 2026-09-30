import * as THREE from 'three';
import { rng } from '../core/util.js';

function make(size, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

export function floorTexture(size) {
  return make(
    size,
    (g, s) => {
      const r = rng(11);
      const n = 6;
      const w = s / n;
      g.fillStyle = '#2b2119';
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < n; i++) {
        const v = Math.floor(30 + r() * 16);
        g.fillStyle = `rgb(${v + 14},${v + 5},${v - 6})`;
        g.fillRect(i * w, 0, w - 1.5, s);
        for (let k = 0; k < 26; k++) {
          g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`;
          g.fillRect(i * w + r() * w, r() * s, 1 + r() * 2, 10 + r() * 50);
        }
      }
      g.fillStyle = 'rgba(0,0,0,0.55)';
      for (let i = 0; i <= n; i++) g.fillRect(i * w - 1, 0, 2, s);
    },
    [3, 4]
  );
}

export function wallTexture(size) {
  return make(
    size,
    (g, s) => {
      const r = rng(5);
      g.fillStyle = '#1a1d29';
      g.fillRect(0, 0, s, s);
      const count = (s * s) / 60;
      for (let i = 0; i < count; i++) {
        g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.06)';
        g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
      }
      const grad = g.createLinearGradient(0, 0, 0, s);
      grad.addColorStop(0, 'rgba(0,0,0,0.25)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.2)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    },
    [3, 1]
  );
}

export function windowTexture() {
  return make(256, (g, s) => {
    const r = rng(23);
    const grad = g.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0, '#080e26');
    grad.addColorStop(1, '#1d2b58');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`;
      const p = r() > 0.9 ? 2 : 1;
      g.fillRect(r() * s, r() * s * 0.8, p, p);
    }
    const glow = g.createRadialGradient(s * 0.72, s * 0.28, 2, s * 0.72, s * 0.28, s * 0.22);
    glow.addColorStop(0, 'rgba(235,240,255,0.95)');
    glow.addColorStop(0.15, 'rgba(210,222,255,0.55)');
    glow.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    g.fillStyle = '#f2f5ff';
    g.beginPath();
    g.arc(s * 0.72, s * 0.28, s * 0.028, 0, Math.PI * 2);
    g.fill();
  });
}

export function phoneScreen() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#05070b';
  g.fillRect(0, 0, 128, 256);
  g.fillStyle = '#eaf3ff';
  g.font = '300 44px ui-sans-serif, system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('00:11', 64, 92);
  g.fillStyle = 'rgba(234,243,255,0.55)';
  g.font = '300 11px ui-sans-serif, system-ui, sans-serif';
  g.fillText('1 oct.', 64, 112);
  g.fillStyle = 'rgba(255,255,255,0.13)';
  g.beginPath();
  g.roundRect(14, 176, 100, 34, 9);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.4)';
  g.fillRect(24, 187, 58, 4);
  g.fillRect(24, 196, 36, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function clockFace() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 90;
  const g = c.getContext('2d');
  g.fillStyle = '#0a0508';
  g.fillRect(0, 0, 256, 90);
  g.fillStyle = '#ff4557';
  g.shadowColor = '#ff2a44';
  g.shadowBlur = 14;
  g.font = '600 62px ui-monospace, Menlo, Consolas, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('00:11', 128, 48);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function markerTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
