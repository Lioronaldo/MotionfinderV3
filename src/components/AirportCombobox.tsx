"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Airport } from "@/lib/types";

type Group = { city: string; country: string; items: Airport[] };

function groupByCity(results: Airport[]): Group[] {
  const map = new Map<string, Group>();
  for (const a of results) {
    const key = `${a.city}__${a.country}`;
    if (!map.has(key)) map.set(key, { city: a.city, country: a.country, items: [] });
    map.get(key)!.items.push(a);
  }
  return Array.from(map.values()).slice(0, 8);
}

export function AirportCombobox({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [activeFlat, setActiveFlat] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const url = new URL("/api/airports", window.location.origin);
      url.searchParams.set("q", q);
      url.searchParams.set("limit", "24");
      const res = await fetch(url.toString());
      const json = await res.json();
      if (alive) setResults(json?.results ?? []);
    }, 120);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const grouped = useMemo(() => groupByCity(results), [results]);
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  function choose(a: Airport) {
    const v = `${a.city} (${a.iata})`;
    onChange(v);
    setQ(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 text-xs text-motion-muted">{label}</div>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActiveFlat(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveFlat((x) => Math.min(x + 1, Math.max(0, flat.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveFlat((x) => Math.max(x - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const pick = flat[activeFlat];
            if (pick) choose(pick);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? "City or IATA (e.g., London / LHR)"}
        className={clsx(
          "w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none",
          "focus:border-motion-orange/60"
        )}
        inputMode="search"
        autoComplete="off"
      />

      {open && grouped.length > 0 ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-motion-border bg-motion-panel shadow-glow">
          {grouped.map((g) => (
            <div key={`${g.city}-${g.country}`} className="border-b border-motion-border/70 last:border-b-0">
              <div className="px-3 py-2 text-xs text-motion-faint">
                {g.city} • {g.country}
              </div>
              {g.items.map((a) => {
                const idx = flat.findIndex((x) => x.iata === a.iata);
                return (
                  <button
                    type="button"
                    key={a.iata}
                    onClick={() => choose(a)}
                    className={clsx(
                      "flex w-full items-start justify-between gap-3 px-3 py-3 text-left text-sm transition",
                      idx === activeFlat ? "bg-white/5" : "hover:bg-white/5"
                    )}
                  >
                    <div>
                      <div className="font-medium text-motion-text">
                        {a.name} <span className="text-motion-orange">({a.iata})</span>
                      </div>
                      <div className="text-xs text-motion-muted">{a.city}</div>
                    </div>
                    <div className="text-xs text-motion-faint">{a.iata}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
