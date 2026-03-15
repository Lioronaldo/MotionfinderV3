import type { Cabin, FlightItinerary, Segment, Airport } from "@/lib/types";
import { nanoid } from "@/lib/utils";

type TokenState = { token: string; expMs: number } | null;
let TOKEN: TokenState = null;

function env(name: string) {
  return process.env[name] ?? "";
}

export function amadeusEnabled() {
  return Boolean(env("AMADEUS_CLIENT_ID") && env("AMADEUS_CLIENT_SECRET"));
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (TOKEN && TOKEN.expMs - 30_000 > now) return TOKEN.token;

  const base = env("AMADEUS_BASE_URL") || "https://test.api.amadeus.com";
  const url = `${base}/v1/security/oauth2/token`;

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", env("AMADEUS_CLIENT_ID"));
  body.set("client_secret", env("AMADEUS_CLIENT_SECRET"));

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) throw new Error(`Amadeus token error: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  TOKEN = { token: json.access_token, expMs: now + json.expires_in * 1000 };
  return TOKEN.token;
}

function cabinToAmadeus(c: Cabin) {
  // Amadeus uses "ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"
  if (c === "premium") return "PREMIUM_ECONOMY";
  return c.toUpperCase();
}

export async function amadeusSearchOffers(args: {
  fromIata: string;
  toIata: string;
  departDateISO: string;
  returnDateISO: string | null;
  oneWay: boolean;
  passengers: number;
  cabin: Cabin;
  currency: string;
  bags: { carryOn: number; checked: number };
  fromAirport: Airport;
  toAirport: Airport;
}): Promise<FlightItinerary[]> {
  const token = await getToken();
  const base = env("AMADEUS_BASE_URL") || "https://test.api.amadeus.com";
  const url = new URL(`${base}/v2/shopping/flight-offers`);

  url.searchParams.set("originLocationCode", args.fromIata);
  url.searchParams.set("destinationLocationCode", args.toIata);
  url.searchParams.set("departureDate", args.departDateISO);
  if (!args.oneWay && args.returnDateISO) url.searchParams.set("returnDate", args.returnDateISO);
  url.searchParams.set("adults", String(Math.max(1, Math.min(9, args.passengers))));
  url.searchParams.set("currencyCode", args.currency);
  url.searchParams.set("travelClass", cabinToAmadeus(args.cabin));
  url.searchParams.set("nonStop", "false");
  url.searchParams.set("max", "20");

  const res = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Amadeus offers error: ${res.status} ${t}`.slice(0, 250));
  }

  const json = await res.json();
  const dictCarriers = (json?.dictionaries?.carriers ?? {}) as Record<string, string>;

  const offers = (json?.data ?? []) as any[];
  const out: FlightItinerary[] = [];

  for (const o of offers) {
    const price = o?.price?.grandTotal ? Number(o.price.grandTotal) : null;
    const currency = o?.price?.currency ?? args.currency;

    const itineraries = o?.itineraries ?? [];
    if (!itineraries.length) continue;

    const firstIt = itineraries[0];
    const segs = firstIt?.segments ?? [];
    if (!segs.length) continue;

    const airlineCode = segs[0]?.carrierCode ?? "XX";
    const airlineName = dictCarriers[airlineCode] ?? airlineCode;

    const segments: Segment[] = segs.map((s: any) => ({
      from: s?.departure?.iataCode ?? args.fromIata,
      to: s?.arrival?.iataCode ?? args.toIata,
      airline: airlineName,
      airlineCode,
      flightNumber: `${s?.carrierCode ?? airlineCode}${s?.number ?? ""}`,
      durationMin: isoDurationToMinutes(s?.duration ?? "PT0M")
    }));

    const totalDurationMin = isoDurationToMinutes(firstIt?.duration ?? "PT0M");
    const stops = Math.max(0, segments.length - 1);

    const layovers = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const nextDep = segs[i + 1]?.departure?.at;
      const curArr = segs[i]?.arrival?.at;
      const hub = segs[i]?.arrival?.iataCode ?? "???";
      const layMin = diffMinutes(curArr, nextDep);
      layovers.push({ airportCode: hub, durationMin: Math.max(0, layMin) });
    }

    out.push({
      id: nanoid(),
      kind: "live_offer",
      label: "Live offer",
      oneWay: args.oneWay,
      from: args.fromAirport,
      to: args.toAirport,
      departDateISO: args.departDateISO,
      returnDateISO: args.oneWay ? null : args.returnDateISO,
      departTimeLocal: "—",
      cabin: args.cabin,
      passengers: args.passengers,
      bags: args.bags,
      airline: airlineName,
      airlineCode,
      stops,
      layovers,
      totalDurationMin,
      segments,
      price: price ? { amount: price, currency } : null,
      priceNote: price ? "Live price from API (confirm on provider)" : "Live offer (price unavailable)",
      score: 0,
      booking: { best: { provider: "Google", url: "" }, others: [] }
    });
  }

  return out;
}

function isoDurationToMinutes(iso: string) {
  // e.g. PT2H15M
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!m) return 0;
  const h = Number(m[1] ?? 0);
  const mm = Number(m[2] ?? 0);
  return h * 60 + mm;
}

function diffMinutes(a?: string, b?: string) {
  if (!a || !b) return 0;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (!Number.isFinite(da) || !Number.isFinite(db)) return 0;
  return Math.round((db - da) / 60000);
}
