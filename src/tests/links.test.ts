import { describe, expect, it } from "vitest";
import { buildBookingLinks } from "@/lib/links";

describe("buildBookingLinks", () => {
  it("creates valid provider links", () => {
    const links = buildBookingLinks({
      fromIata: "AMS",
      toIata: "GRU",
      departDateISO: "2026-12-18",
      returnDateISO: "2027-01-08",
      oneWay: false,
      cabin: "economy",
      passengers: 1
    });
    expect(links.best.url).toMatch(/^https:\/\//);
    expect(links.others.length).toBeGreaterThanOrEqual(4);
  });
});
