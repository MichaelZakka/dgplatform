interface CaptchaEntry {
  createdAt: number;
  expiresAt: number;
}

const globalForCaptcha = globalThis as unknown as {
  __captchaStore?: Map<string, CaptchaEntry>;
};

function getStore(): Map<string, CaptchaEntry> {
  if (!globalForCaptcha.__captchaStore) {
    globalForCaptcha.__captchaStore = new Map();
  }
  return globalForCaptcha.__captchaStore;
}

/** Issue a one-time verification token. */
export function generateCaptcha(): { id: string } {
  const store = getStore();
  const now = Date.now();

  // Prune expired entries
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }

  const id = `${now}-${Math.random().toString(36).slice(2, 10)}`;
  store.set(id, { createdAt: now, expiresAt: now + 10 * 60 * 1000 }); // 10-min TTL
  return { id };
}

/**
 * Verify a token.
 * Requires the token to be at least MIN_AGE_MS old so bots that skip
 * the UI and call the API instantly are rejected.
 */
const MIN_AGE_MS = 1000;

export function verifyCaptcha(id: string): boolean {
  const store = getStore();
  const entry = store.get(id);
  if (!entry) return false;

  const now = Date.now();
  if (entry.expiresAt < now) {
    store.delete(id);
    return false;
  }
  if (now - entry.createdAt < MIN_AGE_MS) return false;

  store.delete(id); // single-use
  return true;
}
