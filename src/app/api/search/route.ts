import { NextResponse } from "next/server";
import { searchSchema } from "@/lib/schema";
import type { FlightItinerary, SearchResponse } from "@/lib/types";
import { clamp, nanoid } from "@/lib/utils";
import { computeDealScore } from "@/lib/dealScore";
import { buildBookingLinks } from "@/lib/links";
import { searchAirports, getAirports } from "@/lib/airports";
import { amadeusEnabled, amadeusSearchOffers } from "@/lib/amadeus";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = searchSchema.safeParse(raw);

  const mode = amadeusEnabled() ? "amadeus" : "free";

  if (!parsed.success) {
    const resp: SearchResponse = { ok: false, error: "Invalid search params", details: parsed.error.flatten(), itineraries: [], summary: null, mode };
    return NextResponse.json(resp, { status: 400 });
  }

  const q = parsed.data;

  const from = pickAirport(q.from);
  const to = pickAirport(q.to);

  if (!from || !to) {
    const resp: SearchResponse = { ok: false, error: "Airport not found. Try city name or IATA code.", itineraries: [], summary: null, mode };
    return NextResponse.json(resp, { status: 404 });
  }

  const itineraries = await (amadeusEnabled()
    ? amadeusSearchOffers({
        fromIata: from.iata,
        toIata: to.iata,
        departDateISO: q.departDate,
        returnDateISO: q.oneWay ? null : q.returnDate,
        oneWay: q.oneWay,
        passengers: clamp(q.passengers, 1, 9),
        cabin: q.cabin,
        currency: "EUR",
        bags: { carryOn: clamp(q.carryOn, 0, 3), checked: clamp(q.checked, 0, 3) },
        fromAirport: from,
        toAirport: to
      }).catch(() => [])
    : Promise.resolve(generateSmartItineraries({
        from,
        to,
        departDateISO: q.departDate,
        returnDateISO: q.oneWay ? null : q.returnDate,
        oneWay: q.oneWay,
        cabin: q.cabin,
        passengers: clamp(q.passengers, 1, 9),
        carryOn: clamp(q.carryOn, 0, 3),
        checked: clamp(q.checked, 0, 3),
        flexible: q.flexible
      })));

  const enriched = itineraries.map((it) => {
    const score = computeDealScore(it);
    const links = buildBookingLinks({
      fromIata: from.iata,
      toIata: to.iata,
      departDateISO: it.departDateISO,
      returnDateISO: it.returnDateISO,
      oneWay: it.oneWay,
      cabin: it.cabin,
      passengers: it.passengers
    });
    return { ...it, score, booking: links };
  });

  const bestScore = enriched.reduce((m, x) => Math.max(m, x.score), 0);
  const durations = enriched.map((x) => x.totalDurationMin).sort((a, b) => a - b);
  const medianDurationMin = durations.length ? durations[Math.floor(durations.length / 2)] : 0;

  const resp: SearchResponse = {
    ok: true,
    error: null,
    itineraries: enriched,
    summary: { count: enriched.length, bestScore, medianDurationMin },
    mode
  };

  return NextResponse.json(resp, {
    status: 200,
    headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" }
  });
}

function pickAirport(input: string) {
  const m = (input ?? "").match(/\(([A-Z]{3})\)/);
  const iata = m?.[1]?.toUpperCase() ?? (input?.trim().toUpperCase().length === 3 ? input.trim().toUpperCase() : null);

  const all = getAirports();

  if (iata) {
    const found = all.find((a) => a.iata === iata);
    if (found) return found;
  }

  const hits = searchAirports(input, 8);
  return hits[0] ?? null;
}

function generateSmartItineraries(args: {
  from: any;
  to: any;
  departDateISO: string;
  returnDateISO: string | null;
  oneWay: boolean;
  cabin: any;
  passengers: number;
  carryOn: number;
  checked: number;
  flexible: boolean;
}): FlightItinerary[] {
  const baseDuration = estimateDurationMin(args.from.lat, args.from.lon, args.to.lat, args.to.lon);

  const templates = [
    { label: "Best value", stops: 1, durationFactor: 1.20, layoverMin: 75 },
    { label: "Fastest", stops: 0, durationFactor: 1.05, layoverMin: 0 },
    { label: "Comfort", stops: 1, durationFactor: 1.28, layoverMin: 60 },
    { label: "Budget-ish", stops: 2, durationFactor: 1.65, layoverMin: 90 }
  ];

  const airlines = pickAirlines(args.from.iata);
  const departSlots = ["06:40", "09:15", "12:30", "15:45", "19:10", "21:35"];

  const out: FlightItinerary[] = [];

  for (let tIdx = 0; tIdx < templates.length; tIdx++) {
    for (let aIdx = 0; aIdx < airlines.length; aIdx++) {
      const template = templates[tIdx];
      const airline = airlines[aIdx];

      const departTimeLocal = departSlots[(tIdx + aIdx) % departSlots.length];
      const totalDurationMin = clamp(Math.round(baseDuration * template.durationFactor), 55, 60 * 40);

      const layoverCount = template.stops;
      const layovers = Array.from({ length: layoverCount }).map((_, i) => ({
        airportCode: pickHub(i, args.from.iata, args.to.iata),
        durationMin: clamp(template.layoverMin + i * 25 + (aIdx % 3) * 10, 45, 240)
      }));

      const segments = buildSegments({
        fromIata: args.from.iata,
        toIata: args.to.iata,
        airlineCode: airline.code,
        airlineName: airline.name,
        stops: template.stops,
        totalDurationMin,
        layovers
      });

      out.push({
        id: nanoid(),
        kind: "smart_suggestion",
        label: template.label,
        oneWay: args.oneWay,
        from: args.from,
        to: args.to,
        departDateISO: args.departDateISO,
        returnDateISO: args.returnDateISO,
        departTimeLocal,
        cabin: args.cabin,
        passengers: args.passengers,
        bags: { carryOn: args.carryOn, checked: args.checked },
        airline: airline.name,
        airlineCode: airline.code,
        stops: template.stops,
        layovers,
        totalDurationMin,
        segments,
        price: null,
        priceNote: "Live price on provider"
        ,
        score: 0,
        booking: { best: { provider: "Google", url: "" }, others: [] }
      });
    }
  }

  return out.slice(0, 12);
}

function estimateDurationMin(lat1: number, lon1: number, lat2: number, lon2: number) {
  const km = haversineKm(lat1, lon1, lat2, lon2);
  const cruiseKmH = 820;
  const hours = km / cruiseKmH;
  const padding = 1.6;
  return Math.round((hours + padding) * 60);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

function pickAirlines(fromIata: string) {
  const common = [
    { code: "KL", name: "KLM" },
    { code: "AF", name: "Air France" },
    { code: "LH", name: "Lufthansa" },
    { code: "IB", name: "Iberia" },
    { code: "TP", name: "TAP Air Portugal" },
    { code: "AZ", name: "ITA Airways" }
  ];
  return fromIata === "AMS" ? common : common.slice(0, 5);
}

function pickHub(i: number, fromIata: string, toIata: string) {
  const hubs = ["FRA", "CDG", "LIS", "MAD", "FCO", "ZRH", "MUC", "BCN", "IST", "DOH"];
  return hubs[(i + fromIata.charCodeAt(0) + toIata.charCodeAt(0)) % hubs.length];
}

function buildSegments(args: {
  fromIata: string;
  toIata: string;
  airlineCode: string;
  airlineName: string;
  stops: number;
  totalDurationMin: number;
  layovers: { airportCode: string; durationMin: number }[];
}) {
  if (args.stops === 0) {
    return [
      {
        from: args.fromIata,
        to: args.toIata,
        airline: args.airlineName,
        airlineCode: args.airlineCode,
        flightNumber: `${args.airlineCode}${Math.floor(100 + (args.totalDurationMin % 800))}`,
        durationMin: args.totalDurationMin
      }
    ];
  }

  const points = [args.fromIata, ...args.layovers.map((l) => l.airportCode), args.toIata];
  const layTotal = args.layovers.reduce((s, l) => s + l.durationMin, 0);
  const segmentDuration = Math.max(40, Math.round((args.totalDurationMin - layTotal) / (points.length - 1)));

  return points.slice(0, -1).map((p, idx) => ({
    from: p,
    to: points[idx + 1],
    airline: args.airlineName,
    airlineCode: args.airlineCode,
    flightNumber: `${args.airlineCode}${Math.floor(120 + (idx + 1) * 37 + (args.totalDurationMin % 200))}`,
    durationMin: segmentDuration
  }));
}
