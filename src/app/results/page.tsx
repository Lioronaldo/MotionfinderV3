"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { FlightCard } from "@/components/FlightCard";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/Skeleton";
import { MobileFiltersSheet } from "@/components/MobileFiltersSheet";
import type { SearchResponse } from "@/lib/types";
import { normalizeInt } from "@/lib/utils";

type SortKey = "best" | "fastest" | "fewestStops" | "priceLow";

export default function ResultsPage() {
  const params = useSearchParams();

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortKey>("best");
  const [maxStops, setMaxStops] = useState<number>(2);
  const [maxDurationHours, setMaxDurationHours] = useState<number>(30);

  const [airlineFilter, setAirlineFilter] = useState<string>("");

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setData(null);

      const url = new URL("/api/search", window.location.origin);
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);

      const res = await fetch(url.toString(), { method: "GET" });
      const json = (await res.json()) as SearchResponse;

      if (!cancelled) {
        setData(json);
        setLoading(false);
      }
    }

    run().catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const airlines = useMemo(() => {
    const items = data?.itineraries ?? [];
    return Array.from(new Set(items.map((i) => i.airline))).sort();
  }, [data]);

  const filteredSorted = useMemo(() => {
    const items = data?.itineraries ?? [];

    const filtered = items.filter((i) => {
      if (i.stops > maxStops) return false;
      if (i.totalDurationMin > maxDurationHours * 60) return false;
      if (airlineFilter && i.airline !== airlineFilter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "best") return b.score - a.score;
      if (sort === "fastest") return a.totalDurationMin - b.totalDurationMin;
      if (sort === "fewestStops") return a.stops - b.stops;
      // priceLow: only if live pricing exists
      const ap = a.price?.amount ?? Number.POSITIVE_INFINITY;
      const bp = b.price?.amount ?? Number.POSITIVE_INFINITY;
      return ap - bp;
    });
  }, [data, maxStops, maxDurationHours, sort, airlineFilter]);

  const summary = data?.summary;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-motion-border bg-motion-panel/70 p-4 shadow-glow md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-motion-muted">Search</div>
              <div className="mt-1 text-xl font-semibold">Refine your motion</div>
              <div className="mt-2 text-xs text-motion-faint">
                Live prices appear only when a legitimate API is configured. Otherwise, click to confirm on providers.
              </div>
            </div>

            <MobileFiltersSheet
              sort={sort}
              setSort={setSort}
              maxStops={maxStops}
              setMaxStops={setMaxStops}
              maxDurationHours={maxDurationHours}
              setMaxDurationHours={setMaxDurationHours}
              airlines={airlines}
              airlineFilter={airlineFilter}
              setAirlineFilter={setAirlineFilter}
            />
          </div>

          <div className="mt-4">
            <SearchForm compact />
          </div>

          <div className="mt-4 hidden items-center justify-between gap-3 md:flex">
            <div className="flex flex-wrap items-center gap-2 text-sm text-motion-muted">
              <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1">
                Sort: <span className="text-motion-text">{sort}</span>
              </span>
              <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1">
                Max stops: <span className="text-motion-text">{maxStops}</span>
              </span>
              <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1">
                Max duration: <span className="text-motion-text">{maxDurationHours}h</span>
              </span>
              <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1">
                Airline: <span className="text-motion-text">{airlineFilter || "Any"}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["best", "fastest", "fewestStops", "priceLow"] as SortKey[]).map((k) => (
                <button
                  key={k}
                  className={
                    "rounded-xl border px-3 py-2 text-sm transition active:scale-[0.99] " +
                    (sort === k
                      ? "border-motion-orange bg-motion-orange/15 text-motion-text"
                      : "border-motion-border bg-motion-panel2 text-motion-muted hover:text-motion-text")
                  }
                  onClick={() => setSort(k)}
                >
                  {k === "fewestStops" ? "Fewest stops" : k === "priceLow" ? "Price low→high" : k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : summary ? (
            <>
              <StatCard label="Itineraries" value={`${summary.count}`} />
              <StatCard label="Best score" value={`${normalizeInt(summary.bestScore)}/100`} />
              <StatCard label="Typical duration" value={`${normalizeInt(summary.medianDurationMin / 60)}h`} />
            </>
          ) : (
            <div className="md:col-span-3 rounded-2xl border border-motion-border bg-motion-panel/70 p-6 shadow-glow">
              <div className="text-lg font-semibold">No results</div>
              <div className="mt-2 text-sm text-motion-muted">Try different airports or dates.</div>
            </div>
          )}
        </section>

        <section className="grid gap-4">
          {loading ? (
            <>
              <Skeleton lines />
              <Skeleton lines />
              <Skeleton lines />
            </>
          ) : data?.ok === false ? (
            <div className="rounded-2xl border border-motion-border bg-motion-panel/70 p-6 shadow-glow">
              <div className="text-lg font-semibold">Search error</div>
              <div className="mt-2 text-sm text-motion-muted">{data.error}</div>
            </div>
          ) : (
            filteredSorted.map((it) => <FlightCard key={it.id} itinerary={it} />)
          )}
        </section>

        <Footer />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-motion-border bg-motion-panel/70 p-5 shadow-glow">
      <div className="text-sm text-motion-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
