# Changelog

## 2.2.1 — Stability + clarity hotfix
- Hard-capped aircraft entities and reduced mobile aircraft/trail load.
- Prioritized aircraft nearest the current view instead of allowing global entity accumulation.
- Replaced overlapping layer intervals with non-overlapping, background-aware refresh scheduling.
- Switched Cesium to on-demand rendering and reduced mobile render resolution.
- Added WebGL pause/recovery messaging and a reload action.
- Simplified the primary UI into Live Map Layers, Contact Details, Source Status, Map View, More Data Sources, and collapsed Advanced Tools.
- Added a one-time plain-language Quick Start guide.
- Added empty-globe deselection and an explicit Contact Details close button.
- Added a collapsible plain-language map legend.
- Added API-key explanations and provider links in Settings.
- Added visible `KEY REQUIRED` badges for Traffic and Live Vessels, with dead-end activation prevented.
- Added one-tap HOME view reset, live Earth/feed status strip, adaptive low-power map mode, and larger mobile tap targets.
- Added plain-English contact summaries with primary metrics and collapsible technical data.
- Added exponential feed retry/backoff so individual source failures recover independently.
- Refocused Quick Start on move globe → choose layers → tap a contact.
- Added Universal Search for active contacts, coordinates, and OpenStreetMap place/landmark lookup.
- Added guided Global Overview, Disaster & Emergency, Aviation & Maritime, Space & Exploration, and Infrastructure modes.
- Added a targeted feed recovery watchdog with cooldown protection.
- Added zoom-aware aircraft clustering to reduce dot overload at world/regional scale.
- Added contact confidence/provenance badges with source, age, and explicit heuristic/estimated labeling.
- Added a primary WHAT’S HAPPENING HERE? regional briefing action based on the current viewport.
- Added opt-in location-first entry choices: Near Me, Search a Place, or Explore the World.
- Added ranked regional briefing cards with source/freshness context and clear empty/degraded-data wording.
- Added deterministic importance scoring and restrained visual emphasis for notable point contacts.
- Added explainable notable/high-priority cards with WHY SHOWN reasoning and explicit heuristic caveats.
- Expanded public CCTV catalogs with Caltrans pagination plus Seattle DOT and Maryland CHART, while prioritizing cameras nearest the current view.
- Added imperial-first user presentation for feet, miles, square miles, knots, and feet-per-minute where appropriate.
- Made public map/search context English-first where source metadata supports an English name.
- Added rich aircraft profiles with public HexDB aircraft/image/route lookups and explicit mission caveats.
- Added English satellite profile images/summaries from public English Wikipedia/Wikimedia when a match exists.
- Added Simple Mode and one-thumb mobile navigation: Home / Search / What's Here / Layers / More.
- Added search subject shortcuts for Aircraft, Cameras, Satellites, Fires, and Quakes.
- Added OKTraffic / ODOT-OTA public camera coverage for Oklahoma City, Tulsa, and Oklahoma highways.
- Made detailed Esri World Imagery the default satellite/aerial Earth surface with Natural Earth II fallback.
- Added much closer globe zoom for neighborhood/house-scale imagery where source resolution supports it.
- Added a Satellite / Basic Earth-view switch with explicit non-live imagery wording.

### SBL-01 — core-loop usability staging
- Locked Simple Mode around a world-query search bar, Guided Modes, What’s Here, connection state, globe, and bottom navigation.
- Added common natural-language subject queries such as cameras in Oklahoma City, aircraft near Dallas, ISS lookup, strongest-loaded earthquake, and military-likely aircraft.
- Added What’s Here v2 with per-subject coverage and explicit partial-data wording.
- Added World Imagery metadata inspection for source, capture date, resolution, and positional accuracy when supplied by Esri.
- Added distinct subject symbols and subject-specific automatic selection zoom.
- Added stale/source-degraded visual fading.
- Expanded rich profiles for launches, earthquakes, fires, and vessels while preserving the no-invented-mission rule.

### SBL-02 — return, watch, and recover staging
- Added a local Watch Center for Saved Views, Watch Areas, Favorites, and Recent Activity.
- Added plain-language Nearby Context cards while preserving PrimeCorrelate™ for Advanced Mode.
- Added locally persisted Saved Views for camera/layer/lens/basemap restoration.
- Added Watch Areas with explicit in-app/loaded-source-only monitoring boundaries.
- Added Favorites with honest last-known-location fallback when a subject is not currently loaded.
- Added a 15 min / 1 hr / 6 hr / 24 hr event-window filter for loaded earthquake/fire events.
- Added a bounded Back/Undo map-state history and a one-tap Full Reset to everyday defaults.
- Changed the Simple Mode fourth bottom action from Layers to Watch; full Layers & Sources remains available under More.

### SBL-03 — trust, explanation, and Prime Brief staging
- Standardized user-facing certainty into CONFIRMED / REPORTED / ESTIMATED / HEURISTIC / STALE.
- Added Explain This for selected subjects, briefing cards, source-status feeds, and the current Guided Mode.
- Separated certainty from importance so high-priority items can still be heuristic/stale and say so.
- Reworked Source Status cards around provider, source state, freshness, loaded count, and explanation.
- Made Global Overview selective at world scale while preserving favorites and restoring routine contacts as users zoom in.
- Added launches to Global Overview.
- Added deterministic Prime Brief™ that works without OpenAI and reports source coverage honestly.
- Watch Area PRIME actions now generate Prime Brief after flying to the area.
- Formalized graceful degraded-data behavior on top of independent feed retry/recovery, local Watch Center state, and healthy-source continuity.

### SBL-04 — learn, discover, and release-gate staging
- Added Show Me ShadowNex: an approximately 35-second six-step guided tour with pause/next/stop controls.
- Demo Mode snapshots and restores the user's current map state instead of leaving the app rearranged.
- Replaced first-run instructional overload with a three-screen Quick Start v2: Search → Understand → Brief/Watch.
- Preserved the opt-in location-start flow and kept location permission out of onboarding.
- Added progressive one-time hints after Search, contact selection, Prime Brief, and Watch usage.
- Added local learning progress, hint on/off controls, and resettable contextual tips.
- Added a first-use Advanced Controls explainer before exposing drawing, scenes, map lenses, and raw controls.
- Added a Help & Guide center under More.
- Added a documented pre-reconciliation checkpoint and automated reconciliation-safety QA.
- Kept all discovery/tour state local to the device; no service worker or background process was added.

### SBL-05 — main-capability preservation staging
- Preserved main's viewport-scoped ADSB.lol aircraft provider with reduced-radius retry and optional OpenSky fallback.
- Merged that provider path with SBL's stricter aircraft caps, nearest-view prioritization, bounded trails, clustering, and low-power behavior.
- Preserved the real native Android APK installer and deterministic build inclusion.
- Integrated the Android install action into the Simple/More experience with a fallback control if the UI fails to mount.
- Classified the old standalone demo-help surface as superseded by SBL-04 instead of reintroducing duplicate onboarding.
- Added a SHA-specific reconciliation inventory and aircraft/native preservation QA gate.

### SBL-06 — main convergence audit staging
- Updated the environment contract to document ADSB.lol as the default no-key aircraft source and OpenSky as opt-in fallback only.
- Restored standalone manifest icon metadata using the approved ShadowNex brand mark without adding a service worker.
- Added a low-burden GitHub Atomic QA workflow for main/manual dispatch only; it runs QA/build and never deploys.
- Added dynamic ADSB.lol normalization QA for source/license identity and aviation-unit conversion at the server boundary.
- Added explicit ADSB.lol ODbL 1.0 and OpenSky-fallback terms guidance to third-party notices.
- Completed a SHA-specific audit of every remaining main-only file and documented which pieces are preserved versus deliberately superseded.

### SBL-07 — reconciled release candidate
- Created a dedicated two-parent reconciliation candidate preserving current main and audited SBL histories.
- Repaired a corrupted core QA script discovered by real Node 22 GitHub Actions.
- Expanded the core CCTV mock gate to cover Oklahoma, London, California, Austin, Seattle, and Maryland.
- Completed the full repository QA chain successfully in GitHub Actions.
- Completed the deterministic static build successfully in the same QA run.
- Kept the reconciliation candidate separate from main and production.

## 2.2.0
- Independent ShadowNex Prime production candidate.
