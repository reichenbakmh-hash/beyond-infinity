export function createEvents() {
  const map = new Map();
  return {
    on(name, fn) {
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(fn);
    },
    emit(name, payload) {
      return Promise.all((map.get(name) || []).map(fn => fn(payload)));
    }
  };
}
