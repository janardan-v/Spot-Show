const cleanups: Array<() => void> = [];

export function registerCleanup(fn: () => void) {
  cleanups.push(fn);
}

export function runCleanup() {
  while (cleanups.length > 0) {
    const fn = cleanups.pop();
    try {
      fn?.();
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
}
