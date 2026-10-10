# ShadowNex Prime™ — SBL-06 Reconciliation Inventory

Observed before SBL-05:
- main: 9423586a4e62636ed45a5bc8bdc2249b7367f24f
- SBL staging: 670679b7a1b921c1bdcfacc63393f4f15326fff4
- merge base: 8ed924f5c2ac493061d4c4fff55d02303b11763e

This is not merge or deployment authorization.

## Must preserve in SBL / reconciled candidate

### Resilient aircraft provider path
Main added viewport-scoped ADSB.lol as the primary aircraft source, bounded request time, a 120 NM reduced-radius retry, and an optional OpenSky fallback controlled by OPENSKY_FALLBACK_ENABLED=true.

SBL-05 preserves that provider path while retaining the SBL mobile entity caps, nearest-view prioritization, bounded trails, clustering, low-power handling, provenance, and stale-data behavior.

### Native Android installer
Main added native-install.js and deterministic static-build inclusion for the current ShadowNex Prime APK.

SBL-05 preserves the installer and places the primary action inside the Simple/More UI. A fallback install control appears only if the normal app UI does not mount one.

### Branding / release guardrails
Already preserved by the SBL line: approved cyan eye branding, Node 22, deterministic dist output, zero npm dependencies, no service worker, and git.deploymentEnabled=false.

## Superseded by SBL

### Legacy standalone Demo/Help
Main's src/demo-help.js predates SBL-04. The reconciled application must not load it. SBL-04 Quick Start, Show Me ShadowNex, contextual hints, Help & Guide, and the Advanced introduction are authoritative.

### Earlier basic basemap hotfix
Main's earlier OpenStreetMap/basic-basemap hotfix is superseded by the SBL detailed Earth stack: Esri World Imagery default, Natural Earth II fallback, imagery metadata inspection, and close zoom.

## Production/history-only commits
Production deployment and relock commits document release history. They do not represent missing application features that need to be replayed into the SBL source tree.

## Reconciliation rule
Re-read current main immediately before a reconciliation candidate is built. Preserve newer work deliberately. Never overwrite main with the SBL tree wholesale.

## SBL-06 complete main-only audit

Current main audited: `9423586a4e62636ed45a5bc8bdc2249b7367f24f`.

### Preserved from main
- ADSB.lol viewport-scoped aircraft backend, bounded provider timeouts, reduced-radius retry, optional OpenSky fallback, and ODbL provenance.
- Native Android installer script plus deterministic static-build copy.
- Cyan ShadowNex brand mark and native/PWA manifest icon metadata.
- Environment documentation for ADSB.lol default behavior and explicit `OPENSKY_FALLBACK_ENABLED=false`.
- A non-deploying GitHub Atomic QA workflow that runs the repository QA chain and deterministic build.

### Preserved by stronger SBL implementation
- Main's simple setInterval feed retry is superseded by SBL bounded retry/backoff, non-overlapping refresh, background-aware polling, and recovery watchdog.
- Main's OpenStreetMap/basic globe hotfix is superseded by Esri World Imagery + Natural Earth II fallback + imagery metadata + close zoom.
- Main's standalone `src/demo-help.js` is superseded by SBL-04 Quick Start v2, Show Me ShadowNex, Help & Guide, contextual discovery, and Advanced introduction.
- Main's `qa-globe-hotfix.mjs` assertions are superseded by the SBL QA chain plus SBL-06 dynamic aircraft normalization/provider tests.

### Audit conclusion
As of the main SHA above, every user-facing or release-critical main-only capability is either:
1. preserved in the SBL staging line,
2. preserved by a stronger SBL implementation, or
3. intentionally excluded as production/history-only behavior.

There is no known main-only application feature left to copy blindly into staging.
