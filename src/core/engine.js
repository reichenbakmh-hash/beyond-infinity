import * as THREE from 'three';

export function createEngine(canvas, level) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: level.antialias,
    powerPreference: 'high-performance'
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x05060a);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 40);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const shadowLights = [];
  const hooks = [];
  let current = level;
  let scale = 1;
  let last = 0;
  let frames = 0;
  let acc = 0;
  let warm = 0;

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, current.dpr) * scale);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 80 : 68;
    camera.updateProjectionMatrix();
  }

  function setLevel(next) {
    current = next;
    scale = 1;
    renderer.shadowMap.enabled = next.shadows;
    shadowLights.forEach(light => {
      light.castShadow = next.shadows;
      light.shadow.mapSize.set(next.shadowSize, next.shadowSize);
      if (light.shadow.map) {
        light.shadow.map.dispose();
        light.shadow.map = null;
      }
    });
    scene.traverse(o => {
      if (!o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        m.needsUpdate = true;
      });
    });
    resize();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const raw = (now - last) / 1000 || 0.016;
    last = now;
    const dt = Math.min(0.05, raw);
    warm += dt;
    if (warm > 3) {
      frames++;
      acc += Math.min(raw, 0.25);
      if (acc >= 2.5) {
        if (frames / acc < 40 && scale > 0.6) {
          scale = Math.max(0.6, scale - 0.15);
          resize();
        }
        frames = 0;
        acc = 0;
      }
    }
    const t = now / 1000;
    for (const fn of hooks) fn(dt, t);
    renderer.render(scene, camera);
  }

  function start() {
    last = performance.now();
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  addEventListener('orientationchange', () => setTimeout(resize, 200));
  setLevel(level);

  return {
    renderer,
    scene,
    camera,
    shadowLights,
    setLevel,
    setExposure: v => {
      renderer.toneMappingExposure = v;
    },
    start,
    onFrame: fn => hooks.push(fn)
  };
}
