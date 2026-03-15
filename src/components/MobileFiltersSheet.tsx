"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Range } from "@/components/Range";

export function MobileFiltersSheet({
  sort,
  setSort,
  maxStops,
  setMaxStops,
  maxDurationHours,
  setMaxDurationHours,
  airlines,
  airlineFilter,
  setAirlineFilter
}: {
  sort: "best" | "fastest" | "fewestStops" | "priceLow";
  setSort: (v: "best" | "fastest" | "fewestStops" | "priceLow") => void;
  maxStops: number;
  setMaxStops: (v: number) => void;
  maxDurationHours: number;
  setMaxDurationHours: (v: number) => void;
  airlines: string[];
  airlineFilter: string;
  setAirlineFilter: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button variant="secondary" onClick={() => setOpen(true)} className="h-11 px-4">
        Filters
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-3xl border border-motion-border bg-motion-panel p-4 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Filters</div>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <Card className="p-4">
                <div className="text-sm font-medium">Sort</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["best", "fastest", "fewestStops", "priceLow"] as const).map((k) => (
                    <button
                      key={k}
                      className={
                        "rounded-xl border px-3 py-3 text-sm transition active:scale-[0.99] " +
                        (sort === k
                          ? "border-motion-orange bg-motion-orange/15 text-motion-text"
                          : "border-motion-border bg-motion-panel2 text-motion-muted")
                      }
                      onClick={() => setSort(k)}
                    >
                      {k === "fewestStops" ? "Fewest stops" : k === "priceLow" ? "Price low→high" : k[0].toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <Range label="Max stops" value={maxStops} min={0} max={2} step={1} onChange={setMaxStops} />
                <div className="mt-4">
                  <Range label="Max duration" value={maxDurationHours} min={6} max={40} step={1} suffix="h" onChange={setMaxDurationHours} />
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-sm font-medium">Airline</div>
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
                >
                  <option value="">Any</option>
                  {airlines.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Card>

              <Button onClick={() => setOpen(false)} className="h-12">
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
