# Lio’s Motion Finder (Pro) ✈️🟠

A modern, mobile-first flight discovery app that:
- Autocompletes **all airports worldwide** (build-time dataset download)
- Ranks itineraries with an explainable **Best Deal** score
- Generates **working deep links** to trusted booking providers (Google Flights / Skyscanner / Kayak / Momondo)
- Optionally shows **live prices** if you configure a legitimate flight API (Amadeus)

## What this app does NOT do (on purpose)
- No scraping Google Flights/Skyscanner HTML.
- No “VPN/geo-price arbitrage” automation. That typically violates provider terms and can be considered abusive/fraudulent.
- No fake “from €850” numbers in free mode.

## Cost
### Free mode (default): **€0**
- Vercel Free hosting
- No API keys required
- Links open provider pages where **live price & availability** are confirmed

### Optional live pricing (may cost money)
- Amadeus Self-Service API keys (you control usage)
- This is OFF unless you add env vars.

---

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel (free)
1. Push this repo to GitHub.
2. Vercel → Add New → Project → import repo.
3. Deploy.

During build, the project tries to download a global airport dataset. If that download fails, it falls back to a small built-in dataset so the build still succeeds.

### (Recommended) Set your site URL for correct OG previews
Vercel → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SITE_URL` = your deployed URL

---

## Optional: enable live prices via Amadeus
Create Vercel env vars:
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `AMADEUS_BASE_URL` (optional, default uses test environment: `https://test.api.amadeus.com`)

Then redeploy.

### Notes
- Live offers are returned by the API. You still book on providers via deep links.
- Add caching/rate limiting before heavy usage.

---

## Security & GDPR basics
- No accounts, no cookies, no analytics by default.
- Privacy page clarifies that hosting providers may process IP addresses in logs for security/reliability.
- Security headers enabled in `next.config.mjs`.

---

## Tests
```bash
npm run test
```
