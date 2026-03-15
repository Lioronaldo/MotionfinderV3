"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AirportCombobox } from "@/components/AirportCombobox";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { clamp } from "@/lib/utils";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function plusDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SearchForm({ compact }: { compact?: boolean } = {}) {
  const router = useRouter();
  const params = useSearchParams();

  const defaults = useMemo(() => {
    const t = todayISO();
    return {
      from: params.get("from") ?? "Amsterdam (AMS)",
      to: params.get("to") ?? "São Paulo (GRU)",
      departDate: params.get("departDate") ?? plusDays(t, 30),
      returnDate: params.get("returnDate") ?? plusDays(t, 44),
      oneWay: (params.get("oneWay") ?? "false") === "true",
      passengers: Number(params.get("passengers") ?? "1"),
      cabin: (params.get("cabin") ?? "economy") as "economy" | "premium" | "business" | "first",
      carryOn: Number(params.get("carryOn") ?? "1"),
      checked: Number(params.get("checked") ?? "1"),
      flexible: (params.get("flexible") ?? "false") === "true"
    };
  }, [params]);

  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [departDate, setDepartDate] = useState(defaults.departDate);
  const [returnDate, setReturnDate] = useState(defaults.returnDate);
  const [oneWay, setOneWay] = useState(defaults.oneWay);
  const [passengers, setPassengers] = useState(defaults.passengers);
  const [cabin, setCabin] = useState(defaults.cabin);
  const [carryOn, setCarryOn] = useState(defaults.carryOn);
  const [checked, setChecked] = useState(defaults.checked);
  const [flexible, setFlexible] = useState(defaults.flexible);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit() {
    const sp = new URLSearchParams();
    sp.set("from", from);
    sp.set("to", to);
    sp.set("departDate", departDate);
    sp.set("oneWay", String(oneWay));
    if (!oneWay) sp.set("returnDate", returnDate);
    sp.set("passengers", String(clamp(passengers, 1, 9)));
    sp.set("cabin", cabin);
    sp.set("carryOn", String(clamp(carryOn, 0, 3)));
    sp.set("checked", String(clamp(checked, 0, 3)));
    sp.set("flexible", String(flexible));

    router.push("/results?" + sp.toString());
  }

  return (
    <Card className={compact ? "p-4 md:p-5" : "p-5 md:p-7"}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <AirportCombobox label="From" value={from} onChange={setFrom} />
          <AirportCombobox label="To" value={to} onChange={setTo} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={swap} type="button" className="h-11 px-4">
            Swap
          </Button>
          <button
            type="button"
            onClick={() => setOneWay((v) => !v)}
            className={
              "h-11 rounded-xl border px-4 text-sm transition active:scale-[0.99] " +
              (oneWay ? "border-motion-orange/60 bg-motion-orange/10 text-motion-text" : "border-motion-border bg-motion-panel2 text-motion-muted hover:text-motion-text")
            }
            aria-pressed={oneWay}
          >
            One-way
          </button>
          <button
            type="button"
            onClick={() => setFlexible((v) => !v)}
            className={
              "h-11 rounded-xl border px-4 text-sm transition active:scale-[0.99] " +
              (flexible ? "border-motion-orange/60 bg-motion-orange/10 text-motion-text" : "border-motion-border bg-motion-panel2 text-motion-muted hover:text-motion-text")
            }
            aria-pressed={flexible}
          >
            Flexible ±3 days
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <label className="block md:col-span-2">
            <div className="mb-1 text-xs text-motion-muted">Depart</div>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
            />
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1 text-xs text-motion-muted">Return</div>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={oneWay}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60 disabled:opacity-50"
            />
          </label>

          <label className="block md:col-span-1">
            <div className="mb-1 text-xs text-motion-muted">Pax</div>
            <input
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
            />
          </label>

          <label className="block md:col-span-1">
            <div className="mb-1 text-xs text-motion-muted">Cabin</div>
            <select
              value={cabin}
              onChange={(e) => setCabin(e.target.value as any)}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <label className="block md:col-span-1">
            <div className="mb-1 text-xs text-motion-muted">Carry-on</div>
            <input
              type="number"
              min={0}
              max={3}
              value={carryOn}
              onChange={(e) => setCarryOn(Number(e.target.value))}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
            />
          </label>

          <label className="block md:col-span-1">
            <div className="mb-1 text-xs text-motion-muted">Checked</div>
            <input
              type="number"
              min={0}
              max={3}
              value={checked}
              onChange={(e) => setChecked(Number(e.target.value))}
              className="w-full rounded-xl border border-motion-border bg-motion-panel2 px-3 py-3 text-sm text-motion-text outline-none focus:border-motion-orange/60"
            />
          </label>

          <div className="md:col-span-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-motion-faint">
              Tip: type a city (e.g., London) and pick any airport in that city.
            </div>
            <Button onClick={submit} className="h-12 w-full md:w-auto">
              Find my motion
            </Button>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
