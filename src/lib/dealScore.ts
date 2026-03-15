import type { FlightItinerary } from "@/lib/types";
import { clamp } from "@/lib/utils";

export function computeDealScore(it: FlightItinerary) {
  // 0..100 (higher is better)
  // If price exists, incorporate it mildly; otherwise focus on comfort/time.
  const durationPenalty = clamp((it.totalDurationMin - 480) / 18, 0, 45);
  const stopsPenalty = it.stops * 14;
  const layoverPenalty = it.layovers.reduce((s, l) => s + clamp((l.durationMin - 75) / 10, 0, 12), 0);

  const dep = parseHHMM(it.departTimeLocal);
  const depPenalty = dep < 6 * 60 ? 6 : dep > 22 * 60 ? 5 : dep > 20 * 60 ? 3 : 0;

  let score = 100 - durationPenalty - stopsPenalty - layoverPenalty - depPenalty;

  if (it.price) {
    // Normalize price impact: cheaper -> slightly higher score.
    // This is intentionally mild to avoid garbage-in/garbage-out.
    const p = it.price.amount;
    const pricePenalty = clamp((p - 200) / 120, 0, 18);
    score -= pricePenalty;
  }

  return clamp(Math.round(score), 0, 100);
}

function parseHHMM(s: string) {
  const [h, m] = s.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 12 * 60;
  return h * 60 + m;
}
