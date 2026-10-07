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

## 2.2.0
- Independent ShadowNex Prime production candidate.
