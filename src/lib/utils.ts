export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function normalizeInt(n: number) {
  return Math.round(n);
}

export function minutesToHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function nanoid() {
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
}

export function safeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return "https://www.google.com/travel/flights";
  }
}
