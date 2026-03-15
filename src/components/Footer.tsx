import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-motion-border pt-6 text-sm text-motion-muted">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-medium text-motion-text">Thank you for using this.</div>
          <div className="text-motion-muted">Make sure you don’t miss any motion this year.</div>
          <div className="mt-2 text-xs text-motion-faint">
            <Link className="underline hover:text-motion-text" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
        <div className="text-xs text-motion-faint">
          Prices & availability can change. We redirect you to providers to complete booking. We may earn a commission from
          some links.
        </div>
      </div>
    </footer>
  );
}
