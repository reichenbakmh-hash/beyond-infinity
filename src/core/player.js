import * as THREE from 'three';
import { clamp, ease } from './util.js';

const EYE = 1.62;
const RADIUS = 0.28;
const SPEED = 2.05;

export function createPlayer({ camera, input, colliders, bounds, audio, spawn }) {
  const pos = new THREE.Vector2(spawn.x, spawn.z);
  const vel = new THREE.Vector2();
  let yaw = spawn.yaw || 0;
  let pitch = 0;
  let bob = 0;
  let stride = 0;
  let script = null;

  const blocked = (x, z) => {
    if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) return true;
    for (const c of colliders) {
      if (x > c.minX - RADIUS && x < c.maxX + RADIUS && z > c.minZ - RADIUS && z < c.maxZ + RADIUS) return true;
    }
    return false;
  };

  const apply = () => {
    camera.position.set(pos.x, EYE + Math.sin(bob) * 0.014, pos.y);
    camera.rotation.set(pitch, yaw, 0);
  };
  apply();

  function runScript(dt) {
    const s = script;
    s.t = Math.min(s.d, s.t + dt);
    const k = ease(s.t / s.d);
    pos.set(s.fx + (s.tx - s.fx) * k, s.fz + (s.tz - s.fz) * k);
    yaw = s.fyaw + s.dyaw * Math.min(1, k * 2.2);
    pitch = s.fpitch * (1 - Math.min(1, k * 2));
    bob += dt * 2.2;
    stride += dt * 1.5;
    if (stride > 0.72) {
      stride = 0;
      audio.play('step');
    }
    vel.set(0, 0);
    apply();
    if (s.t >= s.d) {
      script = null;
      s.resolve();
    }
  }

  function update(dt, active) {
    const l = input.consumeLook();
    if (script) {
      runScript(dt);
      return;
    }
    let tx = 0;
    let tz = 0;
    if (active) {
      yaw -= l.x;
      pitch = clamp(pitch - l.y, -1.3, 1.3);
      const a = input.axis();
      const sy = Math.sin(yaw);
      const cy = Math.cos(yaw);
      tx = (-sy * a.y + cy * a.x) * SPEED;
      tz = (-cy * a.y - sy * a.x) * SPEED;
    }
    const k = 1 - Math.exp(-dt * 12);
    vel.x += (tx - vel.x) * k;
    vel.y += (tz - vel.y) * k;
    const nx = pos.x + vel.x * dt;
    if (!blocked(nx, pos.y)) pos.x = nx;
    else vel.x = 0;
    const nz = pos.y + vel.y * dt;
    if (!blocked(pos.x, nz)) pos.y = nz;
    else vel.y = 0;
    const sp = vel.length();
    bob += dt * sp * 3.6;
    stride += sp * dt;
    if (stride > 0.72) {
      stride = 0;
      audio.play('step');
    }
    apply();
  }

  function walkTo(x, z, seconds) {
    return new Promise(resolve => {
      const tyaw = Math.atan2(-(x - pos.x), -(z - pos.y));
      let dyaw = tyaw - yaw;
      while (dyaw > Math.PI) dyaw -= Math.PI * 2;
      while (dyaw < -Math.PI) dyaw += Math.PI * 2;
      script = { fx: pos.x, fz: pos.y, tx: x, tz: z, t: 0, d: seconds, fyaw: yaw, dyaw, fpitch: pitch, resolve };
    });
  }

  function place(x, z, newYaw) {
    pos.set(x, z);
    yaw = newYaw;
    pitch = 0;
    vel.set(0, 0);
    apply();
  }

  return { update, walkTo, place };
}
