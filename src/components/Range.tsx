"use client";

export function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-motion-muted">
        <span>{label}</span>
        <span className="text-motion-text">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
