"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { FlightItinerary } from "@/lib/types";
import { minutesToHM, normalizeInt } from "@/lib/utils";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function FlightCard({ itinerary }: { itinerary: FlightItinerary }) {
  const [open, setOpen] = useState(false);

  const badge = useMemo(() => {
    if (itinerary.kind === "live_offer") return { label: "Live", tone: "border-motion-orange/40 bg-motion-orange/10" };
    if (itinerary.stops === 0) return { label: "Fast", tone: "border-motion-orange/40 bg-motion-orange/10" };
    if (itinerary.stops === 1) return { label: "Balanced", tone: "border-motion-border bg-white/5" };
    return { label: "Long", tone: "border-motion-border bg-white/5" };
  }, [itinerary.kind, itinerary.stops]);

  const best = itinerary.booking.best;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={"rounded-full border px-3 py-1 text-xs " + badge.tone}>{badge.label}</span>
            <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1 text-xs text-motion-muted">
              Score: <span className="text-motion-text">{normalizeInt(itinerary.score)}/100</span>
            </span>
            {itinerary.price ? (
              <span className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1 text-xs text-motion-muted">
                Price: <span className="text-motion-text">{money(itinerary.price.amount, itinerary.price.currency)}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-3 text-lg font-semibold">
            {itinerary.from.city} ({itinerary.from.iata}) → {itinerary.to.city} ({itinerary.to.iata})
          </div>

          <div className="mt-1 text-sm text-motion-muted">
            Airline: <span className="text-motion-text">{itinerary.airline}</span> • Stops:{" "}
            <span className="text-motion-text">{itinerary.stops}</span> • Duration:{" "}
            <span className="text-motion-text">{minutesToHM(itinerary.totalDurationMin)}</span>
          </div>

          <div className="mt-2 text-xs text-motion-faint">
            Bags: carry-on {itinerary.bags.carryOn}, checked {itinerary.bags.checked} • {itinerary.priceNote}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:min-w-[280px]">
          <a href={best.url} target="_blank" rel="noreferrer">
            <Button className="h-12 w-full">Book Best Deal</Button>
          </a>
          <div className="grid grid-cols-3 gap-2">
            {itinerary.booking.others.slice(1, 4).map((o) => (
              <a key={o.provider} href={o.url} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="h-11 w-full px-2 text-xs">
                  {o.provider}
                </Button>
              </a>
            ))}
          </div>
          <Button variant="ghost" className="h-11" onClick={() => setOpen((x) => !x)}>
            {open ? "Hide details" : "View details"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3 rounded-2xl border border-motion-border bg-motion-panel2 p-4">
              <div className="text-sm font-medium">Segment timeline</div>
              <div className="grid gap-2">
                {itinerary.segments.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                    <div className="text-motion-text">
                      {s.from} → {s.to}{" "}
                      <span className="text-motion-muted">
                        ({s.airlineCode}{s.flightNumber ? s.flightNumber.replace(s.airlineCode, "") : ""})
                      </span>
                    </div>
                    <div className="text-motion-muted">{minutesToHM(s.durationMin)}</div>
                  </div>
                ))}
              </div>

              {itinerary.layovers.length ? (
                <div className="mt-2 text-xs text-motion-muted">
                  Layovers: {itinerary.layovers.map((l) => `${l.airportCode} (${l.durationMin}m)`).join(" • ")}
                </div>
              ) : null}

              <div className="mt-2 text-xs text-motion-faint">
                Why this deal? Higher score = fewer stops, shorter duration, and fewer painful layovers. If a live API is enabled, prices come from that API; otherwise you confirm live prices on the provider.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
