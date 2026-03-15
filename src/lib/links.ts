import type { BookingLink, BookingLinks, Cabin } from "@/lib/types";
import { safeUrl } from "@/lib/utils";

export function buildBookingLinks(args: {
  fromIata: string;
  toIata: string;
  departDateISO: string;
  returnDateISO: string | null;
  oneWay: boolean;
  cabin: Cabin;
  passengers: number;
}): BookingLinks {
  const links: BookingLink[] = [googleFlights(args), skyscanner(args), kayak(args), momondo(args)]
    .map((l) => ({ ...l, url: safeUrl(l.url) }));

  // Best: Google by default (most stable deep-link behavior)
  return { best: links[0], others: links };
}

function googleFlights(a: any): BookingLink {
  const base = "https://www.google.com/travel/flights";
  const q = new URLSearchParams();
  const phrase = a.oneWay
    ? `${a.fromIata} to ${a.toIata} ${a.departDateISO}`
    : `${a.fromIata} to ${a.toIata} ${a.departDateISO} return ${a.returnDateISO}`;
  q.set("q", phrase);
  return { provider: "Google", url: `${base}?${q.toString()}` };
}

function skyscanner(a: any): BookingLink {
  const cabinMap: Record<string, string> = {
    economy: "economy",
    premium: "premiumeconomy",
    business: "business",
    first: "first"
  };
  const cabin = cabinMap[a.cabin] ?? "economy";
  const from = a.fromIata.toLowerCase();
  const to = a.toIata.toLowerCase();
  const out = String(a.departDateISO).replaceAll("-", "");
  const ret = a.returnDateISO ? String(a.returnDateISO).replaceAll("-", "") : "";
  const pax = a.passengers ?? 1;

  const url = a.oneWay
    ? `https://www.skyscanner.net/transport/flights/${from}/${to}/${out}/?adultsv2=${encodeURIComponent(pax)}&cabinclass=${encodeURIComponent(cabin)}&rtn=0`
    : `https://www.skyscanner.net/transport/flights/${from}/${to}/${out}/${ret}/?adultsv2=${encodeURIComponent(pax)}&cabinclass=${encodeURIComponent(cabin)}&rtn=1`;

  return { provider: "Skyscanner", url };
}

function kayak(a: any): BookingLink {
  const from = a.fromIata.toUpperCase();
  const to = a.toIata.toUpperCase();
  const out = a.departDateISO;
  const ret = a.returnDateISO ?? "";
  const pax = a.passengers ?? 1;

  const url = a.oneWay
    ? `https://www.kayak.com/flights/${from}-${to}/${out}/${pax}adults`
    : `https://www.kayak.com/flights/${from}-${to}/${out}/${ret}/${pax}adults`;

  return { provider: "Kayak", url };
}

function momondo(a: any): BookingLink {
  const from = a.fromIata.toUpperCase();
  const to = a.toIata.toUpperCase();
  const out = a.departDateISO;
  const ret = a.returnDateISO ?? "";
  const pax = a.passengers ?? 1;

  const url = a.oneWay
    ? `https://www.momondo.com/flight-search/${from}-${to}/${out}/${pax}adults`
    : `https://www.momondo.com/flight-search/${from}-${to}/${out}/${ret}/${pax}adults`;

  return { provider: "Momondo", url };
}
