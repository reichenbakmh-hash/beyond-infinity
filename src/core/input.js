export function createInput({ canvas, layer, joy, knob, actions, game, touch: startTouch }) {
  let touch = startTouch;
  const keys = new Set();
  const look = { x: 0, y: 0 };
  const stick = { x: 0, y: 0 };
  const RADIUS = 52;
  let joyId = null;
  let lookId = null;
  let lastX = 0;
  let lastY = 0;
  let ox = 0;
  let oy = 0;

  const setMode = t => {
    touch = t;
    document.body.classList.toggle('touch', t);
  };
  setMode(touch);

  const blocked = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);

  addEventListener('keydown', e => {
    if (blocked.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    if (e.code === 'KeyE') actions.interact();
    else if (e.code === 'Escape') actions.pause();
    else if (e.code === 'KeyI') actions.bag();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas) return;
    look.x += e.movementX * 0.0022;
    look.y += e.movementY * 0.0022;
  });

  addEventListener(
    'pointerdown',
    e => {
      if (e.pointerType === 'touch' && !touch) setMode(true);
    },
    { passive: true, capture: true }
  );

  function capture() {
    if (touch || game.state !== 'play') return;
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }

  const stickReset = () => {
    joyId = null;
    stick.x = 0;
    stick.y = 0;
    knob.style.transform = '';
    joy.classList.remove('live');
    joy.style.left = '';
    joy.style.top = '';
    joy.style.bottom = '';
  };

  const lookReset = () => {
    lookId = null;
  };

  function release() {
    if (document.exitPointerLock) document.exitPointerLock();
    stickReset();
    lookReset();
    keys.clear();
  }

  canvas.addEventListener('click', () => {
    if (!touch && game.state === 'play') capture();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas && game.state === 'play' && !touch) actions.pause();
  });

  layer.addEventListener('pointerdown', e => {
    if (e.target !== layer || game.state !== 'play') return;
    layer.setPointerCapture(e.pointerId);
    if (joyId === null && e.clientX < innerWidth * 0.5 && e.clientY > innerHeight * 0.3) {
      joyId = e.pointerId;
      ox = e.clientX;
      oy = e.clientY;
      joy.style.left = ox - 60 + 'px';
      joy.style.top = oy - 60 + 'px';
      joy.style.bottom = 'auto';
      joy.classList.add('live');
    } else if (lookId === null) {
      lookId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  layer.addEventListener('pointermove', e => {
    if (e.pointerId === joyId) {
      let dx = e.clientX - ox;
      let dy = e.clientY - oy;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS;
        dy = (dy / len) * RADIUS;
      }
      stick.x = dx / RADIUS;
      stick.y = -dy / RADIUS;
      knob.style.transform = `translate(${dx}px,${dy}px)`;
    } else if (e.pointerId === lookId) {
      look.x += (e.clientX - lastX) * 0.0056;
      look.y += (e.clientY - lastY) * 0.0056;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  const end = e => {
    if (e.pointerId === joyId) stickReset();
    if (e.pointerId === lookId) lookReset();
  };
  layer.addEventListener('pointerup', end);
  layer.addEventListener('pointercancel', end);

  function axis() {
    let x = stick.x;
    let y = stick.y;
    if (Math.hypot(x, y) < 0.12) {
      x = 0;
      y = 0;
    }
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1;
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    return { x, y };
  }

  function consumeLook() {
    const out = { x: look.x, y: look.y };
    look.x = 0;
    look.y = 0;
    return out;
  }

  return {
    axis,
    consumeLook,
    capture,
    release,
    get touch() {
      return touch;
    }
  };
}
