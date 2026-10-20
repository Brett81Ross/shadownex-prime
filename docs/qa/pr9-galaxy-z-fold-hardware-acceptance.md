# ShadowNex Prime™ — PR #9 Galaxy Z Fold hardware acceptance gate

Status: **NOT HARDWARE-APPROVED**. This is a reproducible field procedure, not a statement that on-device checks have passed.

## Evidence already collected
- The PR's exact GitHub GlobeController and worldwide 3D registry passed isolated mocked-runtime checks for regional activation, no simultaneous regional/global buildings, fallback outside coverage, camera movement budget, low-power budget, quality recovery, and 3D-off visibility.
- Earlier exact-head independent Node test and build run was recorded in the PR. **Do not interpret Node or mocked Cesium tests as physical GPU/WebGL acceptance.**
- PLATEAU Chiyoda endpoint availability, Android CORS/network access, actual 3D model quality and in-device performance remain unverified.
- No preview or production deployment is authorized, so browser/hardware acceptance must wait for an explicitly approved safe test build or accessible existing QA build that actually contains this PR. The current live app v2.2.7 does **not** establish PR #9 hardware behavior.

## Hardware test matrix (all unchecked until performed on a Fold)
Test once with the phone folded (cover screen) and once unfolded (main screen), in portrait and landscape. Use the same exact PR #9 build throughout, and record build SHA, device model, browser/WebView version, graphics settings and timestamp.

- [ ] **A1 · Layout/fold:** All controls and dialogs fully visible without horizontal scrolling or unintended pan of the interface. Navigation, Reset App and attributions never obstruct tap targets. Rotate and open/close the Fold repeatedly.
- [ ] **A2 · Baseline worldwide 3D:** Enable free 3D in geographically separate places; mountains and generic building extrusions remain visible where source coverage exists. Clearly identify 3D service outages instead of asserting false detail.
- [ ] **A3 · PLATEAU detailed Chiyoda:** Navigate to ~35.68°N, 139.76°E and below 150 km camera height; verify tileset actually fetches in browser, CORS succeeds, accurate roofs render, credit is visible, and model is correctly georeferenced. Record HTTP errors if any. A documented URL alone is **not** a pass.
- [ ] **A4 · Overlap/fallback:** Within PLATEAU coverage, regional buildings replace (rather than double-render) global extrusions. Exit the activation envelope, zoom out, disable 3D, disable/re-enable rapidly, and simulate or observe provider failure. Global buildings return outside PLATEAU and remain hidden when 3D is off.
- [ ] **A5 · Precision and selection:** Verify distinct sharp icons for camera, plane, vessel, quake, fire, launch, satellite. At dense-camera sites tap overlapping contacts repeatedly and check the count, cycling order, and that real source coordinates and live camera links remain intact.
- [ ] **A6 · Camera interaction:** Pan, zoom, rotate and tilt near mountain slopes, building edges and bridges. Look for camera jumping, terrain popping that never settles, marker movement unrelated to source data, clipped mountains, and blank tiles.
- [ ] **A7 · Fold graphics safety:** Perform five minutes of continuous 3D navigation and five minutes of repeated layer on/off and Fold orientation changes. Log FPS/framerate distribution if available, browser reloads, GPU context losses, lag/stutters, device heating and recovery. Do not invent a frame-rate measurement.
- [ ] **A8 · Low-power recovery:** With high marker density verify low-power activates as designed, markers remain selectable, and resolution/geometry recovers when load subsides.
- [ ] **A9 · Credits/accessibility:** Credits for Re:Earth/Mapterhorn, Overture/OSM and PLATEAU remain legible/scrollable and are not covered by the bottom nav; keyboard/large text scaling does not make controls inaccessible.
- [ ] **A10 · Reset/persistence:** Reset restores default globe and controls without losing watches/settings or leaving a 3D overlay visible. Camera selection and shared deep links still work.

## Reporting and gates
For each case record **PASS / FAIL / BLOCKED**, short reproduction steps, screen orientation, screenshot/screen recording where appropriate, and relevant console/network failure. Hardware QA can be approved only after all critical A1–A5, A7, A9–A10 cases pass on both cover and unfolded displays; do not waive data attribution, accurate selection, or safety. A6/A8 must show no serious degradation; all failures require tracked PR fixes and retesting.

**Release status:** BLOCKED pending actual Fold verification and a safe PR #9 test build authorized by owner. No GitHub Actions, merge, or deployment in this task.
