import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-motion-orange/60",
        variant === "primary" &&
          "border border-motion-orange/40 bg-motion-orange text-black shadow-glow hover:brightness-110",
        variant === "secondary" &&
          "border border-motion-border bg-motion-panel2 text-motion-text hover:border-motion-orange/40",
        variant === "ghost" &&
          "border border-transparent bg-transparent text-motion-muted hover:bg-white/5 hover:text-motion-text",
        className
      )}
      {...props}
    />
  );
}
