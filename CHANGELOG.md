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

## 2.2.0
- Independent ShadowNex Prime production candidate.
