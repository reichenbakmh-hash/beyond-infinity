export const LEVELS = {
  low: { name: 'low', dpr: 1, antialias: false, shadows: false, shadowSize: 512, textureSize: 128, particles: 0 },
  medium: { name: 'medium', dpr: 1.5, antialias: true, shadows: false, shadowSize: 512, textureSize: 256, particles: 50 },
  high: { name: 'high', dpr: 2, antialias: true, shadows: true, shadowSize: 1024, textureSize: 512, particles: 110 }
};

export const ORDER = ['auto', 'low', 'medium', 'high'];

export function detectQuality() {
  const forced = new URLSearchParams(location.search).get('q');
  if (LEVELS[forced]) return forced;
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (mobile) return memory <= 3 || cores <= 4 ? 'low' : 'medium';
  return memory >= 8 && cores >= 8 ? 'high' : 'medium';
}

export function savedChoice() {
  try {
    const v = localStorage.getItem('b11.q');
    return ORDER.includes(v) ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function saveChoice(v) {
  try {
    localStorage.setItem('b11.q', v);
  } catch {}
}

export function resolveLevel(choice) {
  return LEVELS[choice === 'auto' ? detectQuality() : choice];
}
