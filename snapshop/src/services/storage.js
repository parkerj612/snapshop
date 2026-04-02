const STORAGE_PREFIX = "snapshop_";

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {}
  },
};
