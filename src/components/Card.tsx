import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("rounded-2xl border border-motion-border bg-motion-panel/70 p-5 shadow-glow", className)} {...props} />
  );
}
