import type { Airport } from "@/lib/types";

const OURAIRPORTS_CSV =
  "https://davidmegginson.github.io/ourairports-data/airports.csv";

let CACHE: Airport[] | null = null;
let LOADING: Promise<Airport[]> | null = null;

export async function getAirports(): Promise<Airport[]> {
  if (CACHE) return CACHE;
  if (LOADING) return LOADING;

  LOADING = (async () => {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(OURAIRPORTS_CSV, {
        method: "GET",
        signal: controller.signal,
        // Avoid caching surprises; Vercel will cache at the function layer anyway if configured.
        headers: { "accept": "text/csv" }
      });

      clearTimeout(t);

      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);

      const csv = await res.text();
      const airports = parseOurAirportsCsv(csv);

      // Fallback to mini list if the CSV parses empty.
      if (airports.length < 50) throw new Error("parsed too few airports");

      CACHE = airports;
      return airports;
    } catch {
      // Hard fallback: tiny bundled dataset so the app still works even if remote fetch fails.
      const mini = (await import("@/data/airports-mini.json")).default as Airport[];
      CACHE = mini;
      return mini;
    } finally {
      LOADING = null;
    }
  })();

  return LOADING;
}

export async function searchAirports(q: string, limit = 12): Promise<Airport[]> {
  const list = await getAirports();
  const s = (q ?? "").trim().toLowerCase();
  const lim = Math.max(1, Math.min(30, limit));

  if (!s) return list.slice(0, lim);

  return list
    .map((a) => ({ a, score: matchScore(a, s) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, lim)
    .map((x) => x.a);
}

export async function findAirportByAny(q: string): Promise<Airport | null> {
  const list = await getAirports();
  const raw = (q ?? "").trim();
  const upper = raw.toUpperCase();

  const m = upper.match(/\(([A-Z]{3})\)/);
  const iata = m?.[1] ?? (upper.length === 3 ? upper : null);

  if (iata) {
    const found = list.find((a) => a.iata === iata);
    if (found) return found;
  }

  const lower = raw.toLowerCase();
  return (
    list.find((a) => a.city.toLowerCase() === lower) ??
    list.find((a) => a.name.toLowerCase() === lower) ??
    null
  );
}

export async function findAirportsFuzzy(q: string): Promise<Airport[]> {
  return (await searchAirports(q, 6)).slice(0, 3);
}

function matchScore(a: Airport, q: string) {
  const iata = a.iata.toLowerCase();
  const city = a.city.toLowerCase();
  const name = a.name.toLowerCase();
  const country = a.country.toLowerCase();

  if (iata === q) return 100;
  if (city === q) return 90;
  if (name === q) return 80;

  let score = 0;
  if (iata.includes(q)) score += 55;
  if (city.includes(q)) score += 40;
  if (name.includes(q)) score += 22;
  if (country.includes(q)) score += 10;

  return score;
}

function parseOurAirportsCsv(csv: string): Airport[] {
  // OurAirports headers include: id, ident, type, name, latitude_deg, longitude_deg, ...,
  // iso_country, municipality, scheduled_service, gps_code, iata_code, local_code, ...
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]);
  const idx = indexMap(header);

  const out: Airport[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const cols = splitCsvLine(line);

    const iata = (cols[idx.iata_code] ?? "").trim().toUpperCase();
    if (iata.length !== 3) continue;

    const type = (cols[idx.type] ?? "").trim();
    // Keep the airports users actually search for.
    if (!["large_airport", "medium_airport", "small_airport"].includes(type)) continue;

    const name = (cols[idx.name] ?? "").trim();
    const city = (cols[idx.municipality] ?? "").trim() || iata;
    const country = (cols[idx.iso_country] ?? "").trim() || "Unknown";
    const lat = Number(cols[idx.latitude_deg] ?? "0");
    const lon = Number(cols[idx.longitude_deg] ?? "0");

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    out.push({ iata, name, city, country, lat, lon });
  }

  // De-dup by IATA (CSV can have weird duplicates)
  const seen = new Set<string>();
  return out.filter((a) => (seen.has(a.iata) ? false : (seen.add(a.iata), true)));
}

function indexMap(header: string[]) {
  const get = (key: string) => header.indexOf(key);
  return {
    type: get("type"),
    name: get("name"),
    latitude_deg: get("latitude_deg"),
    longitude_deg: get("longitude_deg"),
    iso_country: get("iso_country"),
    municipality: get("municipality"),
    iata_code: get("iata_code")
  };
}

function splitCsvLine(line: string): string[] {
  // Minimal CSV splitter that supports quoted fields.
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}
