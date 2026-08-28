# ShadowNex Prime™
## Global Situational Intelligence

ShadowNex Prime is a proprietary, browser-based OSINT/GEOINT command center built by Cactus🌵Byte Studios™. This `2.2.1` branch is an independent implementation written under a new ShadowNex-native architecture.

### Core systems
- **NexVision™** — interactive 3D globe and live intelligence layers
- **NexPulse™** — runtime feed health and source telemetry
- **PrimeScope™** — selected-object intelligence panel
- **ShadowLens™** — Normal / NVG / Thermal / CRT visual modes
- **NexCommand™** — typed/voice command layer plus optional OpenAI briefing endpoint
- **Signal Share™** — native mobile sharing and a ShadowNex QR app-link panel

### Everyday-use improvements
The v2.2.1 staging build includes a keyless visible Earth, one-tap HOME reset, live map/feed status, mobile-safe low-power fallback, plain-English contact summaries, progressive technical details, and independent feed retry/backoff.

### Live / public-source layers
Aircraft, earthquakes, fires, satellites, launches, military/infrastructure context, public CCTV catalog data, radio stations, bike-share networks, optional TomTom traffic, and optional AISStream vessel positions.

### Local development
Requires Node 22. No npm dependencies are required.

```bash
npm run dev
```

Then open `http://localhost:4173`.

### QA
```bash
npm test
```

### Vercel
This app is static-first. Serverless functions under `/api` proxy aircraft/fire data and provide the optional NexCommand AI briefing endpoint. Do not expose `OPENAI_API_KEY` in client-side JavaScript.

### Ownership
Copyright © 2026 Cactus🌵Byte Studios™. All Rights Reserved. See `LICENSE.txt` and `THIRD_PARTY_NOTICES.md`.


## v2.1 command systems
- **NexDraw™**: marks, routes, measurements, areas, and resolved geographic boundaries.
- **PrimeCorrelate™**: nearby cross-feed relationships and nearest-contact selection.
- **SceneDirector™**: selected-target orbit, world sweep, and saved-route fly-through.

Example NexCommand phrases: `outline Oklahoma County`, `nearest military aircraft`, `draw route`, `measure`, `orbit selected`, and `play route`.
