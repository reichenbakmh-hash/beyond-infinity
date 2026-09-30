import * as THREE from 'three';
import './style.css';
import { game } from './core/game.js';
import { store } from './core/store.js';
import { createEvents } from './core/events.js';
import { createEngine } from './core/engine.js';
import { ORDER, resolveLevel, savedChoice, saveChoice } from './core/quality.js';
import { createAudio } from './core/audio.js';
import { createInput } from './core/input.js';
import { createPlayer } from './core/player.js';
import { createInteractions } from './core/interaction.js';
import { createUI } from './ui/ui.js';
import { buildRoom } from './scenes/room.js';
import { playIntro } from './scenes/intro.js';
import { assets } from './data/assets.js';
import { isTouchDevice, wait } from './core/util.js';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function boot() {
  const touch = isTouchDevice();
  const canvas = document.getElementById('view');
  let choice = savedChoice();
  let input;

  const events = createEvents();
  const audio = createAudio(assets);
  const engine = createEngine(canvas, resolveLevel(choice));

  const ui = createUI({
    audio,
    hooks: {
      onOpen: () => {
        game.state = 'ui';
        input.release();
      },
      onClose: () => {
        game.state = 'play';
        input.capture();
      },
      closeBag: () => closeBag()
    }
  });

  const interactions = createInteractions({ camera: engine.camera, ui, audio, events });
  const room = buildRoom({ engine, interactions, events, store, audio, level: resolveLevel(choice) });
  engine.scene.add(room.group);
  engine.scene.background = new THREE.Color(0x05060a);
  engine.scene.fog = new THREE.Fog(0x07080d, 6, 16);
  engine.setLevel(resolveLevel(choice));
  room.sync();

  const resume = () => {
    ui.closePause();
    game.state = 'play';
    input.capture();
  };

  function closeBag() {
    ui.closeBag();
    game.state = 'play';
    input.capture();
  }

  const actions = {
    interact() {
      if (game.state === 'play') interactions.trigger();
    },
    pause() {
      if (game.state === 'play') {
        game.state = 'paused';
        input.release();
        ui.openPause();
      } else if (game.state === 'paused') resume();
      else if (game.state === 'bag') closeBag();
    },
    bag() {
      if (game.state === 'play') {
        game.state = 'bag';
        input.release();
        ui.openBag();
      } else if (game.state === 'bag') closeBag();
    }
  };

  input = createInput({
    canvas,
    layer: document.getElementById('touch'),
    joy: document.getElementById('joy'),
    knob: document.getElementById('knob'),
    actions,
    game,
    touch
  });

  const player = createPlayer({
    camera: engine.camera,
    input,
    colliders: room.colliders,
    bounds: room.bounds,
    audio,
    spawn: room.spawn
  });

  const press = (id, fn) => {
    document.getElementById(id).addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      fn();
    });
  };
  press('btn-act', actions.interact);
  press('btn-pause', actions.pause);
  press('btn-bag', actions.bag);

  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());

  ui.bindMenu({
    resume,
    sound: () => audio.toggleMute(),
    hasMusic: audio.hasMusic(),
    music: () => audio.toggleMusic(),
    qualityLabel: 'Qualité : ' + choice,
    quality: () => {
      choice = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
      saveChoice(choice);
      engine.setLevel(resolveLevel(choice));
      return 'Qualité : ' + choice;
    },
    full: () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    },
    restart: () => {
      store.reset();
      location.reload();
    }
  });

  events.on('enterDoor', async () => {
    game.state = 'cinematic';
    input.release();
    audio.play('transition');
    const walk = player.walkTo(0, -5.0, 2.8);
    await wait(900);
    ui.veil(1, 1800);
    await walk;
    await wait(1000);
    await ui.card({
      kicker: '2022',
      title: 'THE BEGINNING',
      line: 'Ce chapitre est en cours de construction.',
      action: 'Revenir'
    });
    player.place(0, -3.4, Math.PI);
    await ui.veil(0, 1400);
    game.state = 'play';
    input.capture();
  });

  engine.onFrame((dt, t) => {
    const playing = game.state === 'play';
    player.update(dt, playing);
    room.update(dt, t);
    ui.setPrompt(interactions.update(playing, t));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
      if (game.state === 'play') actions.pause();
    } else audio.resume();
  });

  engine.start();

  document.getElementById('start').addEventListener(
    'click',
    async () => {
      audio.unlock();
      if (touch) {
        const p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(() => {});
      } else {
        try {
          const p = canvas.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch {}
      }
      game.state = 'intro';
      await playIntro({ audio, room });
      game.state = 'play';
      document.body.classList.add('playing');
      ui.hint(
        touch
          ? 'Joystick à gauche. Glisse à droite pour regarder.'
          : 'ZQSD ou WASD pour marcher, souris pour regarder. E pour agir, I pour l\'inventaire, Échap pour la pause.',
        7000
      );
      await ui.title('1er octobre 2022.', 2800);
      await wait(1600);
      await ui.title('Quelque chose a commencé ici.', 3400);
    },
    { once: true }
  );
}

if (webglAvailable()) boot();
else document.body.classList.add('nogl');
