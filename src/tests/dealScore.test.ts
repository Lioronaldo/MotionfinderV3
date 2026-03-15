import { describe, expect, it } from "vitest";
import { computeDealScore } from "@/lib/dealScore";
import type { FlightItinerary } from "@/lib/types";

function it(partial: Partial<FlightItinerary>): FlightItinerary {
  return {
    id: "x",
    kind: "smart_suggestion",
    label: "x",
    oneWay: true,
    from: { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "NL", lat: 0, lon: 0 },
    to: { iata: "GRU", name: "Guarulhos", city: "São Paulo", country: "BR", lat: 0, lon: 0 },
    departDateISO: "2026-12-18",
    returnDateISO: null,
    departTimeLocal: "12:30",
    cabin: "economy",
    passengers: 1,
    airline: "KLM",
    airlineCode: "KL",
    stops: 0,
    layovers: [],
    totalDurationMin: 720,
    segments: [],
    bags: { carryOn: 1, checked: 1 },
    price: null,
    priceNote: "Live price on provider",
    score: 0,
    booking: { best: { provider: "Google", url: "https://example.com" }, others: [] },
    ...partial
  };
}

describe("computeDealScore", () => {
  it("prefers fewer stops", () => {
    const direct = computeDealScore(it({ stops: 0, totalDurationMin: 800, layovers: [] }));
    const oneStop = computeDealScore(it({ stops: 1, totalDurationMin: 800, layovers: [{ airportCode: "FRA", durationMin: 90 }] }));
    expect(direct).toBeGreaterThan(oneStop);
  });

  it("includes price when available", () => {
    const noPrice = computeDealScore(it({ price: null }));
    const withPrice = computeDealScore(it({ price: { amount: 1200, currency: "EUR" } }));
    expect(withPrice).toBeLessThanOrEqual(noPrice);
  });
});
