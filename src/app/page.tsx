import { SearchForm } from "@/components/SearchForm";
import { Footer } from "@/components/Footer";
import { Icons } from "@/components/Icons";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <header className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-motion-border bg-motion-panel/60 px-3 py-1 text-sm text-motion-muted shadow-glow">
            <span className="h-2 w-2 rounded-full bg-motion-orange" />
            Live providers • smart scoring • global airports
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            This is <span className="text-motion-orange">Lio</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-motion-muted md:text-lg">
            Fasten your seatbelt before booking your next <span className="text-motion-orange">motion</span>.
            Search globally, filter hard, then book with one tap on trusted providers.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-motion-faint">
            {["No scraping", "Mobile-first", "Best-Deal scoring", "Deep links to live prices"].map((t) => (
              <span key={t} className="rounded-full border border-motion-border bg-motion-panel2 px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-2xl border border-motion-border bg-motion-panel p-4 shadow-glow">
            <div className="flex items-center gap-3">
              <Icons.Plane className="h-6 w-6 text-motion-orange" />
              <div>
                <div className="text-sm font-medium">Find your motion</div>
                <div className="text-xs text-motion-muted">Filter → score → book</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <SearchForm />
      </section>

      <section className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
        {[
          { title: "All airports in a city", body: "Type a city → see every airport (London: LHR, LGW, STN…)."},
          { title: "Real links that work", body: "Book buttons generate valid provider URLs with correct params."},
          { title: "Better UX than the clutter", body: "Warm design, fast results, and explainable ranking."}
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-motion-border bg-motion-panel/70 p-5 shadow-glow">
            <div className="text-lg font-semibold">{f.title}</div>
            <div className="mt-2 text-sm text-motion-muted">{f.body}</div>
          </div>
        ))}
      </section>

      <Footer />
    </main>
  );
}
