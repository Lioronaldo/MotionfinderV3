export type Cabin = "economy" | "premium" | "business" | "first";

export type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

export type Segment = {
  from: string;
  to: string;
  airline: string;
  airlineCode: string;
  flightNumber?: string;
  durationMin: number;
};

export type BookingLink = {
  provider: "Google" | "Skyscanner" | "Kayak" | "Momondo";
  url: string;
};

export type BookingLinks = {
  best: BookingLink;
  others: BookingLink[];
};

export type FlightItinerary = {
  id: string;
  kind: "smart_suggestion" | "live_offer";
  label: string;

  oneWay: boolean;
  from: Airport;
  to: Airport;

  departDateISO: string;
  returnDateISO: string | null;
  departTimeLocal: string;

  cabin: Cabin;
  passengers: number;

  airline: string;
  airlineCode: string;

  stops: number;
  layovers: { airportCode: string; durationMin: number }[];

  totalDurationMin: number;
  segments: Segment[];

  bags: { carryOn: number; checked: number };

  // If live API configured, price is real from the API. Otherwise null.
  price: null | { amount: number; currency: string };
  priceNote: string;

  score: number;
  booking: BookingLinks;
};

export type SearchResponse =
  | {
      ok: true;
      error: null;
      itineraries: FlightItinerary[];
      summary: { count: number; bestScore: number; medianDurationMin: number };
      mode: "free" | "amadeus";
    }
  | {
      ok: false;
      error: string;
      details?: unknown;
      itineraries: FlightItinerary[];
      summary: null;
      mode: "free" | "amadeus";
    };
