import * as THREE from 'three';
import * as tex from './textures.js';

const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

export function buildPhone() {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(0.072, 0.008, 0.152), lam(0x0e1014));
  const screenMat = new THREE.MeshBasicMaterial({ map: tex.phoneScreen(), toneMapped: false, fog: false });
  const screen = mesh(new THREE.PlaneGeometry(0.066, 0.146), screenMat, 0, 0.0045, 0);
  screen.rotation.x = -Math.PI / 2;
  g.add(body, screen);
  g.userData.screenMat = screenMat;
  return g;
}

export function buildStrawberry() {
  const g = new THREE.Group();
  const leafMat = lam(0x3f7a3c);
  const body = mesh(new THREE.SphereGeometry(0.03, 14, 12), lam(0xc41f38), 0, 0.036, 0);
  body.scale.set(1, 1.2, 1);
  const leaf = mesh(new THREE.ConeGeometry(0.026, 0.014, 6), leafMat, 0, 0.07, 0);
  leaf.scale.set(1, 0.6, 1);
  const stem = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 6), leafMat, 0, 0.083, 0);
  g.add(body, leaf, stem);
  return g;
}

export function buildTulip() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.16, 14), lam(0xcfc9c2), 0, 0.08, 0));
  const profile = [
    [0, 0],
    [0.026, 0.012],
    [0.04, 0.045],
    [0.034, 0.085],
    [0.014, 0.115],
    [0, 0.12]
  ].map(p => new THREE.Vector2(p[0], p[1]));
  const petalGeo = new THREE.LatheGeometry(profile, 10);
  const petalMat = lam(0xe9a7b8, { side: THREE.DoubleSide });
  const stemMat = lam(0x4d7a48);
  [
    [-0.012, 0.12, 1],
    [0.016, -0.1, 0.86]
  ].forEach(([x, tilt, sc]) => {
    const s = new THREE.Group();
    s.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 6), stemMat, 0, 0.16, 0));
    s.add(mesh(petalGeo, petalMat, 0, 0.32, 0));
    s.position.set(x, 0.13, 0);
    s.rotation.z = tilt;
    s.scale.setScalar(sc);
    g.add(s);
  });
  return g;
}

export function buildCat() {
  const g = new THREE.Group();
  const fur = lam(0x0c0d12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xcfe98a });
  const eyeGeo = new THREE.SphereGeometry(0.008, 8, 6);
  const earGeo = new THREE.ConeGeometry(0.02, 0.04, 4);
  const body = mesh(new THREE.SphereGeometry(0.085, 14, 12), fur, 0, 0.085, 0);
  body.scale.set(0.9, 1.05, 1.15);
  const tail = mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.22, 6), fur, 0, 0.06, -0.13);
  tail.rotation.x = 1.15;
  g.add(
    body,
    mesh(new THREE.SphereGeometry(0.058, 14, 12), fur, 0, 0.2, 0.055),
    mesh(earGeo, fur, -0.03, 0.25, 0.05),
    mesh(earGeo, fur, 0.03, 0.25, 0.05),
    mesh(eyeGeo, eyeMat, -0.02, 0.205, 0.108),
    mesh(eyeGeo, eyeMat, 0.02, 0.205, 0.108),
    tail
  );
  return g;
}

export function buildClock() {
  const g = new THREE.Group();
  const faceMat = new THREE.MeshBasicMaterial({ map: tex.clockFace(), toneMapped: false, fog: false });
  g.add(mesh(new THREE.BoxGeometry(0.56, 0.22, 0.05), lam(0x0b0b0e)));
  g.add(mesh(new THREE.PlaneGeometry(0.5, 0.176), faceMat, 0, 0, 0.0255));
  g.userData.faceMat = faceMat;
  return g;
}

export function buildDoor() {
  const g = new THREE.Group();
  const wood = lam(0x2a221c);
  const w = 0.98;
  const h = 2.12;
  const t = 0.09;
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffdfe6,
    transparent: true,
    opacity: 0,
    toneMapped: false,
    depthWrite: false,
    fog: false
  });
  const pivot = new THREE.Group();
  pivot.position.set(-w / 2, 0, 0.02);
  pivot.add(
    mesh(new THREE.BoxGeometry(w - 0.02, h - 0.02, 0.045), lam(0x3a2d25), (w - 0.02) / 2, h / 2, 0),
    mesh(new THREE.SphereGeometry(0.03, 10, 8), lam(0x9a8a6c), w - 0.1, h * 0.48, 0.04)
  );
  g.add(
    mesh(new THREE.BoxGeometry(t, h + t, 0.12), wood, -(w / 2 + t / 2), (h + t) / 2, 0),
    mesh(new THREE.BoxGeometry(t, h + t, 0.12), wood, w / 2 + t / 2, (h + t) / 2, 0),
    mesh(new THREE.BoxGeometry(w + 2 * t, t, 0.12), wood, 0, h + t / 2, 0),
    mesh(new THREE.PlaneGeometry(w, h), glowMat, 0, h / 2, -0.02),
    pivot
  );
  g.userData.glowMat = glowMat;
  g.userData.pivot = pivot;
  return g;
}

export const builders = {
  phone: buildPhone,
  strawberry: buildStrawberry,
  tulip: buildTulip,
  cat: buildCat,
  clock: buildClock,
  door: buildDoor
};
