import * as THREE from 'three';
import * as tex from './textures.js';
import { builders } from './props.js';
import { roomInteractions } from '../data/interactions.js';
import { tween, rng } from '../core/util.js';

const X0 = -4;
const X1 = 4;
const Z0 = -6;
const Z1 = 4;
const H = 3;
const MID = (Z0 + Z1) / 2;

export function buildRoom({ engine, interactions, events, store, audio, level }) {
  const group = new THREE.Group();
  const colliders = [];
  const fixed = [];
  const size = level.textureSize;
  let reveal = 0;
  let doorK = 0;
  let clockAt = false;
  let clockCheck = -10;

  const wallMat = new THREE.MeshLambertMaterial({ map: tex.wallTexture(size) });
  const floorMat = new THREE.MeshLambertMaterial({ map: tex.floorTexture(size) });
  const ceilMat = new THREE.MeshLambertMaterial({ color: 0x1a1d2a });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0x1a1d28 });

  const plane = (w, h, mat, x, y, z, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  const part = (w, h, d, color, x, y, z, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  const box = (w, h, d, color, x, y, z, solid = false) => {
    const m = part(w, h, d, color, x, y, z, group);
    if (solid) colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    return m;
  };

  plane(8, H, wallMat, 0, H / 2, Z0);
  plane(8, H, wallMat, 0, H / 2, Z1, 0, Math.PI);
  plane(10, H, wallMat, X0, H / 2, MID, 0, Math.PI / 2);
  plane(10, H, wallMat, X1, H / 2, MID, 0, -Math.PI / 2);
  plane(8, 10, floorMat, 0, 0, MID, -Math.PI / 2, 0);
  plane(8, 10, ceilMat, 0, H, MID, Math.PI / 2, 0);

  [Z0 + 0.01, Z1 - 0.01].forEach(z => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 0.02), trimMat);
    m.position.set(0, 0.06, z);
    group.add(m);
  });
  [X0 + 0.01, X1 - 0.01].forEach(x => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 10), trimMat);
    m.position.set(x, 0.06, MID);
    group.add(m);
  });

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshLambertMaterial({ color: 0x5a3f52 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-0.4, 0.004, -1.6);
  rug.receiveShadow = true;
  group.add(rug);

  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 1.6),
    new THREE.MeshBasicMaterial({
      map: tex.patchTexture(),
      color: 0x8fa8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    })
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(-1.45, 0.008, -1.2);
  group.add(patch);

  const skyMat = new THREE.MeshBasicMaterial({ map: tex.windowTexture(), toneMapped: false, fog: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.25), skyMat);
  sky.position.set(X0 + 0.012, 1.65, -1.2);
  sky.rotation.y = Math.PI / 2;
  group.add(sky);

  const frame = 0x252833;
  box(0.06, 0.05, 1.62, frame, X0 + 0.03, 2.3, -1.2);
  box(0.06, 0.05, 1.62, frame, X0 + 0.03, 1.02, -1.2);
  box(0.06, 1.3, 0.05, frame, X0 + 0.03, 1.65, -1.98);
  box(0.06, 1.3, 0.05, frame, X0 + 0.03, 1.65, -0.42);
  box(0.05, 1.25, 0.03, frame, X0 + 0.03, 1.65, -1.2);
  box(0.05, 0.03, 1.5, frame, X0 + 0.03, 1.65, -1.2);
  box(0.22, 0.04, 1.75, 0x2c2f3b, X0 + 0.11, 0.99, -1.2);
  box(0.06, 1.95, 0.32, 0x3a2f45, X0 + 0.08, 1.5, -2.16);
  box(0.06, 1.95, 0.32, 0x3a2f45, X0 + 0.08, 1.5, -0.24);

  box(1.7, 0.32, 2.3, 0x2b2320, -2.85, 0.16, -4.85);
  box(1.6, 0.2, 2.2, 0x4a5170, -2.85, 0.42, -4.85);
  box(0.55, 0.12, 0.38, 0x6a7092, -2.85, 0.58, -5.72);
  box(1.62, 0.07, 1.3, 0x5a4462, -2.85, 0.55, -4.3);
  colliders.push({ minX: -3.7, maxX: -2.0, minZ: -6, maxZ: -3.7 });
  box(0.4, 0.5, 0.4, 0x2b2320, -1.6, 0.25, -5.6, true);

  box(1.9, 0.05, 0.8, 0x33281f, 2.55, 0.74, -5.6);
  [
    [1.65, -5.95],
    [3.45, -5.95],
    [1.65, -5.25],
    [3.45, -5.25]
  ].forEach(([x, z]) => box(0.05, 0.72, 0.05, 0x20190f, x, 0.36, z));
  colliders.push({ minX: 1.55, maxX: 3.55, minZ: -6, maxZ: -5.15 });

  const chair = new THREE.Group();
  chair.position.set(2.3, 0, -4.55);
  chair.rotation.y = 0.35;
  part(0.46, 0.05, 0.46, 0x453f39, 0, 0.46, 0, chair);
  part(0.46, 0.5, 0.04, 0x453f39, 0, 0.74, 0.21, chair);
  [
    [-0.19, -0.19],
    [0.19, -0.19],
    [-0.19, 0.19],
    [0.19, 0.19]
  ].forEach(([x, z]) => part(0.04, 0.44, 0.04, 0x2b2622, x, 0.22, z, chair));
  group.add(chair);
  colliders.push({ minX: 2.0, maxX: 2.6, minZ: -4.85, maxZ: -4.25 });

  box(0.4, 0.9, 1.4, 0x2b2320, 3.75, 0.45, 0.8, true);

  const hemi = new THREE.HemisphereLight(0x8fa0d6, 0x2a2233, 1);
  group.add(hemi);
  fixed.push({ light: hemi, base: 2.2 });

  const moon = new THREE.DirectionalLight(0x9db4ff, 1);
  moon.position.set(-7, 4.5, -1);
  moon.target.position.set(0, 0, -1);
  moon.shadow.camera.left = -7;
  moon.shadow.camera.right = 7;
  moon.shadow.camera.top = 7;
  moon.shadow.camera.bottom = -7;
  moon.shadow.camera.near = 0.5;
  moon.shadow.camera.far = 20;
  moon.shadow.bias = -0.0006;
  group.add(moon, moon.target);
  fixed.push({ light: moon, base: 2.6 });
  engine.shadowLights.push(moon);

  const phoneLight = new THREE.PointLight(0x9fd8ff, 0, 4.5, 2);
  phoneLight.position.set(2.4, 1.0, -5.2);
  group.add(phoneLight);

  const clockLight = new THREE.PointLight(0xff3b4a, 0, 3, 2);
  clockLight.position.set(2.55, 1.75, -5.55);
  group.add(clockLight);

  const doorLight = new THREE.PointLight(0xffc9d6, 0, 9, 2);
  doorLight.position.set(0, 1.4, -4.9);
  group.add(doorLight);

  let phoneMat = null;
  let clockMat = null;
  let cat = null;
  let door = null;

  roomInteractions.forEach(def => {
    const model = builders[def.model]();
    const place = def.place || def.at;
    model.position.set(place[0], place[1], place[2]);
    model.rotation.y = def.rotY || 0;
    model.traverse(o => {
      if (o.isMesh) o.castShadow = true;
    });
    group.add(model);
    const anchor = new THREE.Object3D();
    anchor.position.set(def.at[0], def.at[1], def.at[2]);
    group.add(anchor);
    interactions.register(def, anchor);
    if (def.model === 'phone') phoneMat = model.userData.screenMat;
    if (def.model === 'clock') clockMat = model.userData.faceMat;
    if (def.model === 'cat') cat = model;
    if (def.model === 'door') door = model;
  });

  let particles = null;
  let particlePos = null;
  let seeds = null;
  if (level.particles) {
    const r = rng(77);
    const n = level.particles;
    particlePos = new Float32Array(n * 3);
    seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      particlePos[i * 3] = -3.8 + r() * 3.2;
      particlePos[i * 3 + 1] = 0.4 + r() * 2.4;
      particlePos[i * 3 + 2] = -3.2 + r() * 3.8;
      seeds[i] = 0.4 + r();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: 0.03, color: 0xb8c6ff, transparent: true, opacity: 0, depthWrite: false })
    );
    group.add(particles);
  }

  function sync() {
    cat.visible = store.flag('phoneDone');
    const open = store.flag('doorOpen');
    door.visible = open;
    if (open) {
      door.userData.pivot.rotation.y = -1.25;
      door.userData.glowMat.opacity = 0.9;
      doorK = 1;
    }
  }

  store.on((type, key) => {
    if (type === 'flag' && key === 'phoneDone') cat.visible = true;
  });

  events.on('openDoor', async () => {
    door.visible = true;
    audio.play('door');
    await tween(2600, e => {
      door.userData.pivot.rotation.y = -1.25 * e;
      door.userData.glowMat.opacity = 0.9 * e;
      doorK = e;
    });
    store.set('doorOpen');
  });

  function update(dt, t) {
    fixed.forEach(f => {
      f.light.intensity = f.base * reveal;
    });
    if (t - clockCheck > 1) {
      clockCheck = t;
      const d = new Date();
      clockAt = d.getHours() === 0 && d.getMinutes() === 11;
    }
    const done = store.flag('phoneDone');
    const pulse = done ? 3 : 8 + 3 * Math.sin(t * 2.2);
    phoneLight.intensity = pulse * reveal;
    phoneMat.color.setScalar(done ? 0.7 : 0.85 + 0.15 * Math.sin(t * 2.2));
    clockLight.intensity = (clockAt ? 9 : 2.5) * reveal;
    clockMat.color.setScalar(clockAt ? 1.35 : 1);
    doorLight.intensity = 18 * doorK * reveal;
    patch.material.opacity = 0.2 * reveal;
    if (particles) {
      for (let i = 0; i < seeds.length; i++) {
        particlePos[i * 3 + 1] += dt * 0.03 * seeds[i];
        particlePos[i * 3] += Math.sin(t * 0.2 + i) * dt * 0.02;
        if (particlePos[i * 3 + 1] > 2.8) particlePos[i * 3 + 1] = 0.4;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.material.opacity = 0.4 * reveal;
    }
  }

  const fade = ms =>
    tween(ms, e => {
      reveal = e;
    });

  return {
    group,
    colliders,
    bounds: { minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 },
    spawn: { x: 0.4, z: 2.6, yaw: 0 },
    update,
    fade,
    sync
  };
}
