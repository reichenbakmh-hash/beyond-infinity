const KEY = 'b11.save';
const state = { flags: {}, items: [] };
const listeners = new Set();

try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    state.flags = saved.flags || {};
    state.items = saved.items || [];
  }
} catch {}

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
};

const emit = (type, key) => listeners.forEach(fn => fn(type, key));

export const store = {
  has: id => state.items.includes(id),
  add(id) {
    if (state.items.includes(id)) return false;
    state.items.push(id);
    persist();
    emit('item', id);
    return true;
  },
  flag: key => !!state.flags[key],
  set(key, value = true) {
    state.flags[key] = value;
    persist();
    emit('flag', key);
  },
  items: () => [...state.items],
  on(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  reset() {
    state.flags = {};
    state.items = [];
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }
};
