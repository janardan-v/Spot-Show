let cleanup: (() => void) | null = null;

export function registerCleanup(fn: () => void) {
  cleanup?.();

  cleanup = fn;
}

export function runCleanup() {
  cleanup?.();

  cleanup = null;
}