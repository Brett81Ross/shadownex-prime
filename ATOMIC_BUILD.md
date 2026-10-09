# ShadowNex Prime™ Atomic Build

## v2.2.1+ — Stability, clarity, globe reliability

### TOP PRIORITY — IMPLEMENTED IN STAGING
1. **Always-visible 3D Earth / keyless default basemap**
   - The globe must render even when no Cesium Ion token is configured.
   - Live contacts must appear on top of a recognizable Earth, never on an empty dark field.
   - Enhanced Cesium Ion terrain/imagery remains optional.
   - Add a clear globe-loading/fallback state instead of silently showing dots only.
   - **IMPLEMENTED:** bundled Natural Earth II imagery is now the default keyless basemap, Ion is optional terrain enhancement, the globe has a visible colored fallback sphere, and first-open framing points directly at Earth.

### Already implemented in the v2.2.1 stability branch
- Fix unbounded aircraft entity growth on repeated refreshes.
- Prevent overlapping data refresh jobs and pause feed polling while backgrounded.
- On-demand Cesium rendering with mobile-safe resolution and density caps.
- WebGL loss/recovery message with reload control.
- Plain-language primary navigation.
- Advanced data/tools collapsed by default.
- One-time Quick Start onboarding.

### Navigation polish implemented in v2.2.1 staging branch
- Empty-globe click now deselects the current contact.
- Contact Details has an explicit close button and mobile auto-expand/collapse behavior.
- Settings explains what Cesium Ion, TomTom, and AISStream keys unlock and links to each provider.
- Traffic and Live Vessels show `KEY REQUIRED` before users tap into a dead end.
- A collapsible plain-language map legend explains the primary marker colors.

### Claude Quick Looks candidate — present in reviewed zip, not yet merged/deployed
- One-tap Quick Looks for aircraft, fires, earthquakes, ships, launches, and a night-style view.
- Plain-language NexCommand help/layers/reset commands.
- Best-effort in-memory rate limiting for AI briefings and boundary lookups.
- Needs final wording/behavior QA before merge so every Quick Look accurately describes what it actually does.
- Needs targeted tests for scenario switching and rate-limit behavior.

### Current atomic build — clarity/recovery pass implemented in staging
2. **Simple HOME / RESET VIEW button — IMPLEMENTED IN STAGING**
   - One tap returns to a useful full-Earth view and exits tracking/cockpit/tool modes.

3. **Plain-language map legend — IMPLEMENTED IN STAGING**
   - Explain what the main dot/icon colors mean without requiring branded subsystem knowledge.

4. **Globe + feed status strip — IMPLEMENTED IN STAGING**
   - Small readable status such as `MAP READY · AIRCRAFT LIVE · EARTHQUAKES LIVE`.
   - Errors must explain what failed.

5. **Automatic low-power fallback — IMPLEMENTED IN STAGING**
   - If mobile rendering struggles, lower contact density/trails before the app freezes.
   - Show a visible `LOW POWER` state instead of silently degrading.

6. **Cleaner first-open defaults — IMPLEMENTED IN STAGING**
   - Open on a recognizable full-Earth view.
   - Keep only the most useful live layers enabled initially.
   - No advanced panels open by default.

7. **Tap-target clarity — IMPLEMENTED IN STAGING**
   - Make selectable contacts and primary controls easier to hit on Android phones/Fold devices.

8. **Selected-contact focus cleanup — IMPLEMENTED IN STAGING**
   - Tap a contact → clearly highlight it → show the important details first.
   - Put deeper metadata behind `MORE DETAILS`.

9. **Feed retry + recovery — IMPLEMENTED IN STAGING**
   - Failed public feeds retry safely with backoff and recover automatically.
   - One failed source must never make the whole app feel frozen.

10. **Quick Guide refresh — IMPLEMENTED IN STAGING**
   - Center onboarding on `MOVE THE GLOBE → CHOOSE WHAT TO SEE → TAP A CONTACT`.
   - Keep ShadowNex terminology secondary until the basics are clear.

### Five priority upgrades approved for this atomic build
11. **Universal Search — IMPLEMENTED IN STAGING**
   - One obvious search box for cities, countries, airports, callsigns, satellites, vessels, landmarks, and coordinates.
   - Search result flies the globe to the target and exposes relevant nearby contacts.

12. **Mission Presets / Quick Looks — IMPLEMENTED IN STAGING**
   - Curated one-tap modes such as Global Overview, Air Traffic, Space, Natural Events, Infrastructure, and Maritime.
   - Claude's Quick Looks implementation is the current candidate foundation.
   - Presets must use truthful labels and clearly state when a key/data source is required.

13. **Automatic Recovery Watchdog — IMPLEMENTED IN STAGING**
   - Detect WebGL pressure, excessive entity counts, stalled feeds, repeated provider failures, and unhealthy refresh loops.
   - Automatically reduce density, clear stale objects, restart only the affected feed, and preserve the user's view.
   - Escalate to a simple recovery action only when automatic repair fails.

14. **Smart Clustering — IMPLEMENTED FOR PRIMARY AIRCRAFT FEED**
   - Cluster dense contacts while zoomed out instead of rendering a wall of dots.
   - Expand naturally as the user zooms in.
   - Prioritize selected/watched/high-importance contacts so they never disappear inside a cluster.

15. **Contact Confidence + Provenance — IMPLEMENTED IN STAGING**
   - Every selected contact should clearly show `LIVE`, `ESTIMATED`, or `INFERRED`.
   - Show source, last update age, and confidence/quality when applicable.
   - Heuristics such as military-likely classification must never be presented as confirmed fact.

Status: atomic batch OPEN — items 1–20 are now integrated in staging. Smart clustering is currently applied to the primary high-density aircraft feed. Next focus starts at item 21: distinct map icon language.

### Next UX + intelligence upgrades approved for the ABL
16. **“What’s happening here?” primary action — IMPLEMENTED IN STAGING**
   - Analyze the current viewport and summarize the most relevant nearby events/contacts in plain English.
   - Link every statement back to the underlying live source/contact when possible.
   - **IMPLEMENTED:** a primary `WHAT’S HAPPENING HERE?` action analyzes the current viewport and opens a source-aware regional brief.

17. **Location-first opening experience — IMPLEMENTED IN STAGING**
   - First-open choices: `NEAR ME`, `SEARCH A PLACE`, or `EXPLORE THE WORLD`.
   - Never require location permission unless the user explicitly chooses a location-aware action.
   - **IMPLEMENTED:** first-open choices are `NEAR ME`, `SEARCH A PLACE`, and `EXPLORE THE WORLD`; browser geolocation is requested only after `NEAR ME` is tapped.

18. **Regional / Daily Briefing cards — IMPLEMENTED IN STAGING**
   - Surface the 3–5 most consequential items for the current area or a saved watch area.
   - Prefer relevance and significance over raw feed volume.
   - **IMPLEMENTED:** the brief shows the top 3–5 ranked contacts/events plus plain-language counts and source/freshness context.

19. **Importance scoring + visual hierarchy — IMPLEMENTED IN STAGING**
   - Rank events/contacts by freshness, severity, rarity, proximity, confidence, and user relevance.
   - Routine activity stays subtle; meaningful activity becomes visually prominent.
   - **IMPLEMENTED:** deterministic 0–100 importance scoring combines type/severity, freshness, proximity, source health, and explicit heuristic context; notable point contacts receive restrained visual emphasis.

20. **Human-readable explainable alerts — IMPLEMENTED IN STAGING**
   - Replace cryptic IDs/codes with plain-English alert summaries.
   - Clearly label heuristic/inferred classifications and why an alert was surfaced.
   - **IMPLEMENTED:** notable/high-priority cards include `WHY SHOWN`, source, age, and explicit language that military-likely callsign matching is heuristic rather than confirmed status.

21. **Distinct map icon language — IMPLEMENTED IN SBL STAGING**
   - Use recognizable icons for aircraft, vessels, satellites, fires, earthquakes, launches, cameras, and infrastructure.
   - Color supplements meaning but is never the only differentiator.

22. **Auto-zoom intelligence — IMPLEMENTED IN SBL STAGING**
   - Selected contacts/events automatically use a useful camera distance and orientation.
   - Prevent camera states that leave the user inside the globe, too far away, or unable to see the selected target.

23. **Context cards — UPGRADED IN SBL-08 STAGING**
   - Explain nearby relevant cities, airports, infrastructure, events, and correlated contacts around the selected item.
   - Present correlations as understandable context rather than raw matrices.

24. **Timeline ribbon — UPGRADED WITH LOCAL EVENT HISTORY IN SBL-08 STAGING**
   - Simple time scopes such as `NOW · 15 MIN · 1 HR · 6 HR · 24 HR`.
   - Use available history/trails/events to make change over time understandable.

25. **Watch Areas — UPGRADED WITH IN-APP ALERTS IN SBL-08 STAGING**
   - Save named geographic regions such as Home, Oklahoma City, Gulf Coast, or a drawn polygon.
   - Surface meaningful changes that occur inside watched areas.

26. **Favorites / Watchlist — IMPLEMENTED IN SBL-02 STAGING**
   - Star locations, aircraft, vessels, satellites, or events for fast return.
   - Keep watched items distinct from ordinary map clutter.

27. **Recent Activity feed — UPGRADED WITH INTELLIGENCE EVENTS IN SBL-08 STAGING**
   - Chronological plain-English stream of notable changes, detections, watch-area events, and tracked-item updates.
   - Avoid turning routine feed refreshes into noisy notifications.

28. **Automatic stale-data fading — IMPLEMENTED FOUNDATION IN SBL STAGING**
   - Fresh contacts render strongly; aging contacts fade and receive `STALE` status before removal.
   - Old data must never visually appear equally current with live data.

29. **Simple connection-quality indicator — IMPLEMENTED IN SBL STAGING**
   - Primary state: `LIVE`, `PARTIAL`, or `OFFLINE`.
   - Detailed source diagnostics remain available behind a secondary view.

30. **Self-healing feeds — IMPLEMENTED FOUNDATION IN STAGING**
   - Backoff/retry failed providers, preserve healthy layers, and recover feeds independently.
   - Provider failure must never freeze the whole app.

31. **Adaptive performance governor — IMPLEMENTED FOUNDATION IN STAGING**
   - Dynamically tune contact caps, trails, labels, refresh cadence, clustering detail, and render resolution based on device pressure.
   - Restore quality gradually after performance recovers.

32. **One-thumb mobile navigation — IMPLEMENTED FOUNDATION IN STAGING**
   - Target bottom navigation: `HOME · SEARCH · GLOBE · WATCH · MORE`.
   - Keep high-frequency actions reachable without opening tactical side panels.

33. **“Explain this” everywhere — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Add a concise explanation action to contacts, events, feed states, and modes.
   - Convert technical telemetry into plain-English context without inventing unsupported facts.

34. **Honest uncertainty model — IMPLEMENTED IN SBL-03 STAGING**
   - Standardize statuses such as `CONFIRMED`, `REPORTED`, `ESTIMATED`, `HEURISTIC`, and `STALE`.
   - Keep source confidence separate from user-facing importance/severity.

35. **Source transparency without clutter — IMPLEMENTED IN SBL-03 STAGING**
   - Casual view shows source + update age.
   - Advanced view exposes richer provenance/endpoint/quality details.

36. **Selective Global Overview mode — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Show only significant events and meaningful/watchlisted activity instead of enabling every feed.
   - Use clustering/importance scoring to preserve a readable world view.

37. **Natural-language unified Search + NexCommand — UPGRADED WITH EXPLICIT NEAR-ME INTENTS IN SBL-08 STAGING**
   - Accept phrases such as “take me to Oklahoma City,” “show fires near Los Angeles,” or “aircraft around Dallas.”
   - Search and command behavior should feel like one intelligence system, not two unrelated interfaces.

38. **Predictable Back / Undo state — IMPLEMENTED FOUNDATION IN SBL-02 STAGING**
   - Back out of fly-tos, selected contacts, presets, cockpit scenes, and tool states predictably.
   - Preserve a small navigation/state history so users can recover from accidental actions.

39. **One-tap full Reset — IMPLEMENTED IN SBL-02 STAGING**
   - Restore safe camera, layer, modal, tracking, cinematic, filter, and tool defaults in one action.
   - Reset must always recover the app to a known usable state.

40. **Demo Mode / “Show Me ShadowNex” — IMPLEMENTED IN SBL-04 STAGING**
   - Optional 30–45 second guided tour using current live data.
   - Demonstrate search, presets, contact selection, briefing, and map movement without requiring documentation.

41. **Progressive feature discovery — IMPLEMENTED FOUNDATION IN SBL-04 STAGING**
   - Introduce NexDraw, SceneDirector, PrimeCorrelate, ShadowLens, subsea data, and reconstruction tools only as users explore deeper.
   - Avoid explaining advanced systems during first-run onboarding.

42. **Simple / Advanced interface toggle — IMPLEMENTED IN STAGING**
   - Simple mode is the default and changes presentation, not capability.
   - Advanced mode exposes raw telemetry, full feed controls, drawing, scenes, correlation, and diagnostics.

43. **Graceful degraded-data architecture — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Design the app to stay useful when providers rate-limit, go offline, change schema, or only partially respond.
   - Keep the globe, saved views, local UI, and healthy sources usable during provider outages.

44. **Prime Brief™ — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Signature plain-English intelligence briefing for a place or watch area: “What matters here right now?”
   - Combine currently available public sources with freshness, proximity, severity, confidence, and correlations.
   - Keep claims source-linked and explicitly distinguish known facts from estimates/inferences.

### New priority block — everyday usability + richer subjects
45. **Expanded camera coverage + viewport-aware camera results — IMPLEMENTED FOUNDATION IN STAGING**
   - Fix Caltrans pagination so statewide cameras are not truncated to the first 2,000.
   - Add vetted no-key public camera catalogs where endpoints and terms permit.
   - **IMPLEMENTED:** Caltrans statewide pagination plus London, Austin, Seattle DOT, and Maryland CHART; camera markers are prioritized nearest the current view instead of by provider order.
   - Continue adding vetted providers rather than implying unsupported global coverage.

46. **Imperial / U.S. customary presentation — IMPLEMENTED IN STAGING**
   - User-facing altitude, distance, depth, and area values use feet, miles, and square miles.
   - Aviation and vessel speed remains knots.
   - Internal geospatial math may remain metric where appropriate.

47. **English-first globe/search presentation — IMPLEMENTED FOUNDATION IN STAGING**
   - Keep the low-dependency globe and ensure app-generated geographic names prefer English.
   - Nominatim requests English results; OpenStreetMap context/subsea names prefer `name:en`.
   - If only non-Latin local text is available for contextual map objects, use a neutral English object label instead.
   - Actual callsigns, aircraft registrations, satellite names, and source-native identifiers are not mistranslated.

48. **Rich subject profiles — IMPLEMENTED FOUNDATION IN STAGING**
   - Aircraft: image when available, registration, manufacturer/type, registered owner, published route match, origin/destination airport names when available, and explicit mission/purpose caveats.
   - Satellites: English reference image, English description, and public mission/purpose summary when a reliable match exists.
   - CCTV: current image when a provider publishes a direct snapshot URL.
   - Never invent route, mission, operator, or imagery when a public source does not provide it.

49. **Simple Mode layout — IMPLEMENTED FOUNDATION IN STAGING**
   - Everyday interface is the default and hides advanced tactical controls.
   - Mobile bottom navigation: `HOME · SEARCH · WHAT'S HERE · LAYERS · MORE`.
   - Advanced Controls remains one tap away and does not remove underlying capability.

50. **Search subject shortcuts — IMPLEMENTED FOUNDATION IN STAGING**
   - Search provides direct layer shortcuts for Aircraft, Cameras, Satellites, Fires, and Quakes around the current searched/viewed area.
   - Search should guide users into useful data instead of requiring feed-architecture knowledge.

Status: atomic batch OPEN — everyday usability/data coverage is currently prioritized. Items 21–44 remain valid and will be resumed after this foundation is QA-stable.

51. **Oklahoma City CCTV / OKTraffic integration — IMPLEMENTED IN STAGING**
   - Add public OKTraffic camera poles and active web-camera locations, including Oklahoma City and Tulsa metro coverage.
   - Keep OKTraffic / ODOT-OTA attribution and treat stream availability as provider-dependent.

52. **High-resolution satellite/aerial Earth view — IMPLEMENTED IN STAGING**
   - Make Esri World Imagery the default detailed Earth surface.
   - Allow zoom to neighborhood/house scale where source resolution supports it.
   - Keep Natural Earth II as the resilient basic fallback.
   - Add a simple `SATELLITE / BASIC` Earth-view switch.
   - Clearly state that basemap imagery is not live satellite video and varies by place/date/resolution.

53. **Imagery source/date inspector — IMPLEMENTED IN SBL STAGING**
   - Expose source/date/resolution for the viewed point when the provider makes that metadata available.
   - Never call imagery live unless a provider explicitly supplies live imagery.

### SBL-01 — Core loop usability (54–60)

54. **Lock Simple Mode UX — IMPLEMENTED IN SBL STAGING**
   - Simple Mode is now the dominant everyday presentation instead of a lightly modified tactical layout.
   - Primary surface: world-query search, guided mode chips, live/partial/offline coverage state, globe, and bottom navigation.
   - Layer/source/tactical panels remain available but stay out of the way until explicitly opened.

55. **Rich Contact Cards v2 — IMPLEMENTED FOUNDATION IN SBL STAGING**
   - Aircraft/satellite profiles remain picture-first when public imagery exists.
   - Aircraft cards preserve public registration/type/owner/published-route enrichment and the strict no-invented-mission rule.
   - Launch cards now capture rocket, provider, pad/location, mission description/type, orbit, imagery, status, and time when supplied by Launch Library 2.
   - Earthquake cards add felt reports, significance, alert/tsunami flags, and USGS context.
   - Fire cards explicitly avoid inventing size/containment/evacuation facts.
   - Vessel cards expose current AIS basics and clearly state when destination/purpose is unavailable.

56. **Unified World Search — IMPLEMENTED FOUNDATION IN SBL STAGING**
   - Understand common intent phrases such as `cameras in Oklahoma City`, `aircraft near Dallas`, `find the ISS`, `biggest earthquake today`, and military-likely aircraft queries.
   - Place + subject queries fly to the area and enable the relevant layer automatically.
   - Unmatched searches still fall through to the existing universal contact/place search.

57. **“What’s Here?” v2 — IMPLEMENTED IN SBL STAGING**
   - Briefing starts with per-subject coverage/status for Air Traffic, Cameras, Earthquakes, Fires, Satellites, and Vessels.
   - Uses a primary `LIVE / PARTIAL / OFFLINE` state.
   - Explicitly says that zero loaded items does not prove zero real-world activity.

58. **Imagery Inspector — IMPLEMENTED IN SBL STAGING**
   - Query Esri World Imagery metadata at the center of the current view.
   - Show imagery provider/source, capture date, ground resolution, and positional accuracy when Esri provides them.
   - Display resolution/accuracy in U.S. customary units.
   - Always state that basemap imagery is not live video.

59. **Distinct icons + smart selection camera — IMPLEMENTED IN SBL STAGING**
   - Aircraft, vessels, satellites, earthquakes, fires, launches, cameras, and infrastructure receive visually distinct map symbols rather than relying on color alone.
   - Tapping a subject automatically chooses a useful subject-specific camera distance.

60. **Simple connection state + stale fading — IMPLEMENTED FOUNDATION IN SBL STAGING**
   - Everyday connection state collapses source health into `LIVE / PARTIAL / OFFLINE`.
   - Aging aircraft/vessels and old event markers visually fade; degraded/stale source state also lowers visual prominence.
   - Detailed source diagnostics remain available behind Source Status.

**SBL-01 deployment state:** STAGING ONLY. Do not merge/deploy until reconciliation with current `main` and full QA are complete.

### SBL-02 — Return, watch, and recover (61–67)

61. **Nearby Context — IMPLEMENTED IN SBL-02 STAGING**
   - Simple Mode translates the technical nearby-correlation matrix into a plain `NEARBY CONTEXT` card.
   - Summarizes up to five loaded nearby contacts within 100 miles, with human-readable type and distance.
   - Technical PrimeCorrelate™ remains available in Advanced Mode.
   - Context explicitly says loaded-source coverage may be partial.

62. **Saved Views — IMPLEMENTED IN SBL-02 STAGING**
   - Save the current camera, active layers, lens, basemap mode, and selected-subject identity locally on the device.
   - Restore saved views without requiring a server account.
   - Keep up to 20 saved views.

63. **Watch Areas — IMPLEMENTED FOUNDATION IN SBL-02 STAGING**
   - Save the current map center with a 10 / 25 / 50 / 100 / 250 mile radius.
   - Scan currently loaded contacts/events for each Watch Area and surface total + notable counts.
   - One tap can reopen an area or fly there and launch a What's Here briefing.
   - **Truth boundary:** Watch Areas only scan sources loaded while the app is open; they are not background monitoring and do not run while ShadowNex is closed.

64. **Favorites / Watchlist — IMPLEMENTED IN SBL-02 STAGING**
   - Favorite a selected aircraft, vessel, satellite, event, camera, or other subject.
   - Reopen a currently loaded subject when available.
   - If it is not currently loaded, show its last-known saved position instead of pretending it is live.

65. **Recent Activity + event-window ribbon — IMPLEMENTED FOUNDATION IN SBL-02 STAGING**
   - Keep a local recent history of views, searches, modes, watch actions, favorites, timeline changes, and resets.
   - Add a simple `NOW · 15 MIN · 1 HR · 6 HR · 24 HR` event window for loaded earthquake/fire events.
   - This is a presentation/history filter, not fabricated historical telemetry.

66. **Predictable Back / Undo View — IMPLEMENTED FOUNDATION IN SBL-02 STAGING**
   - Maintain a small local stack of prior map states before searches, fly-tos, guided modes, saved views, favorites, watch areas, Home, and Reset.
   - Restore camera, layers, lens, basemap, and selected subject when that subject is still loaded.
   - Keep at most 12 prior states to avoid unbounded history.

67. **One-tap Full Reset — IMPLEMENTED IN SBL-02 STAGING**
   - Close dialogs, exit tracking/cockpit/scenes/tools, clear transient map annotations, restore normal lens + detailed satellite Earth, and return to Simple Mode.
   - Restore the everyday default live layers: Aircraft + Earthquakes.
   - Reset does not delete user settings, Saved Views, Watch Areas, Favorites, or Recent Activity.

**SBL-02 deployment state:** STAGING ONLY. No background monitoring, no service worker, no production deployment.

### SBL-03 — Trust, explanation, and Prime Brief (68–73)

68. **Explain This everywhere — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Selected subjects expose a plain-English `EXPLAIN THIS` action.
   - Situation/briefing cards expose the same explanation path.
   - Source Status cards can explain provider state, update age, provenance, and coverage limits.
   - `More → Explain Current Mode` explains what the selected Guided Mode does and does not prove.
   - Natural-language `explain this` works for the currently selected subject.

69. **Standard uncertainty model — IMPLEMENTED IN SBL-03 STAGING**
   - Primary certainty states are now `CONFIRMED · REPORTED · ESTIMATED · HEURISTIC · STALE`.
   - Importance/severity remains separate from certainty.
   - Satellites are explicitly estimated; military-likely aircraft are explicitly heuristic; degraded/unavailable sources become stale.
   - `CONFIRMED` is reserved for source states that actually justify it, such as reviewed earthquake records or completed launch outcomes.

70. **Source transparency without clutter — IMPLEMENTED IN SBL-03 STAGING**
   - Casual contact view shows certainty, source, source state, and freshness.
   - Source Status cards show provider + freshness and expose a one-tap explanation.
   - Advanced technical data remains available without forcing raw endpoint/schema detail into Simple Mode.

71. **Selective Global Overview — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Global Overview now includes launches but suppresses routine world-scale clutter.
   - Significant/notable events, military-likely aircraft, and favorites stay visible first.
   - Zooming into a region restores routine contacts automatically.
   - This is a presentation filter only; it does not delete underlying loaded data.

72. **Graceful degraded-data truth layer — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Prime Brief and Source Status remain useful when one or more providers are delayed/unavailable.
   - Healthy sources continue operating independently through the existing retry/backoff and recovery watchdog architecture.
   - Saved Views, Watch Areas, Favorites, globe controls, and local UI remain usable without pretending missing feeds are complete.
   - Coverage gaps are described as gaps, never as proof that nothing is happening.

73. **Prime Brief™ — IMPLEMENTED FOUNDATION IN SBL-03 STAGING**
   - Deterministic local briefing works without an OpenAI key.
   - Summarizes current-view importance, certainty, source freshness, and coverage health.
   - Shows up to four source-linked items with `VIEW · EXPLAIN · SOURCE` actions.
   - Watch Area `PRIME` actions fly to the area and generate the same source-aware brief.
   - Optional AI briefing remains a secondary enhancement; Prime Brief itself never depends on it.

**SBL-03 deployment state:** STAGING ONLY. No production deployment, no new runtime dependencies, no service worker.

### SBL-04 — Learn, discover, and release-gate (74–80)

74. **Show Me ShadowNex — IMPLEMENTED IN SBL-04 STAGING**
   - Add an optional approximately 35-second guided tour of the actual Simple Mode workflow.
   - Six steps: Earth → Search → Contact understanding → Prime Brief → Watch → Advanced.
   - Tour controls: `PAUSE · NEXT · STOP`.
   - Demo Mode snapshots the user's current view/layers before starting and restores them when the tour ends or is stopped.
   - The tour does not require a specific provider to be healthy and does not pretend demo callouts are live data.

75. **Quick Start v2 — IMPLEMENTED IN SBL-04 STAGING**
   - Replace the old instruction-heavy onboarding with a maximum three-screen flow:
     1. `Search the world`
     2. `Tap → understand`
     3. `Brief, save, and return`
   - Keep onboarding skippable.
   - Preserve the separate opt-in location-start choice; no location permission is required by the guide.
   - Settings → Quick Guide now opens the v2 guide.

76. **Progressive feature discovery — IMPLEMENTED FOUNDATION IN SBL-04 STAGING**
   - Learn from real usage milestones rather than dumping feature explanations on first launch.
   - Milestones: Search, subject selection, Prime Brief, Watch, and Advanced.
   - One-time contextual hints introduce the next useful capability after the user demonstrates the previous one.
   - Hints can be turned off or reset locally.

77. **Smarter Advanced-mode reveal — IMPLEMENTED IN SBL-04 STAGING**
   - First entry into Advanced Controls explains drawing/measurement, scenes, map lenses, and raw controls before opening them.
   - The explanation explicitly states that Advanced Mode changes control depth, not certainty of the underlying data.
   - After the first introduction, Advanced/Simple switching remains one tap.

78. **Help & Guide Center — IMPLEMENTED IN SBL-04 STAGING**
   - Add one place under `More` for Quick Start, the guided tour, feature-map explanations, contextual-hint controls, and learning progress.
   - Explain the product in four plain groups: Search & Explore, Understand, Brief & Watch, Advanced.
   - Avoid branded subsystem names until the user asks for deeper capability.

79. **Non-destructive teaching + contextual coaching — IMPLEMENTED FOUNDATION IN SBL-04 STAGING**
   - Demo Mode restores the user's pre-tour map state.
   - Contextual tips highlight the actual control being introduced and dismiss cleanly.
   - Tips are suppressed while the guided tour is running so competing guidance never stacks.
   - First-run teaching remains local-device state only.

80. **Pre-reconciliation release gate — IMPLEMENTED IN SBL-04 STAGING**
   - Add a written reconciliation checkpoint before any merge to `main`.
   - Gate requirements include: Node 22, zero npm dependencies, no service worker, Vercel Git deployment locked, deterministic `dist` output, all SBL installers wired, and all SBL QA suites in the test chain.
   - Reconciliation must preserve newer `main` work deliberately; no blind force merge or overwrite.
   - Production deployment remains a separate explicit approval step after reconciliation and QA.

**SBL-04 deployment state:** STAGING ONLY. This is the planned usability/polish checkpoint before branch reconciliation.

### SBL-05 — Preserve main-only production capabilities (81–86)

81. **Resilient aircraft provider reconciliation — IMPLEMENTED IN SBL-05 STAGING**
   - Preserve main's viewport-scoped ADSB.lol primary aircraft source.
   - Preserve bounded provider timeout, 120 NM reduced-radius retry, and optional OpenSky fallback.
   - Retain SBL mobile caps, nearest-view prioritization, bounded trails, zoom-aware clustering, low-power behavior, provenance, and stale-data fading.

82. **Native Android installer preservation — IMPLEMENTED IN SBL-05 STAGING**
   - Preserve main's real APK installer and deterministic build copy.
   - Surface the installer inside More in the Simple experience instead of relying on a permanent floating control.
   - Keep a fallback install button if the normal app UI fails to mount.

83. **Legacy Demo/Help supersession — LOCKED FOR RECONCILIATION**
   - Do not load src/demo-help.js in the reconciled application.
   - SBL-04 Quick Start / Show Me ShadowNex / Help & Guide is the authoritative onboarding system.
   - Avoid two simultaneous onboarding/help frameworks.

84. **Main-only capability inventory — IMPLEMENTED**
   - Record must-preserve, superseded, and production-history-only main changes in RECONCILIATION_INVENTORY.md.
   - Re-read current main before reconciliation because this inventory is SHA-specific.

85. **Aircraft/native preservation QA — IMPLEMENTED**
   - Add a QA gate proving ADSB.lol normalization/fallback wiring, viewport query parameters, SBL caps/clustering, native installer inclusion, and absence of legacy demo-help loading.

86. **Reconciliation remains non-production — LOCKED**
   - SBL-05 does not merge to main and does not deploy.
   - A dedicated reconciled candidate must be built/tested before any PR/merge is considered.

**SBL-05 deployment state:** STAGING ONLY. This pass reduces the true reconciliation gap without overwriting main.

### SBL-06 — Main convergence audit (87–93)

87. **Aircraft environment contract — IMPLEMENTED IN SBL-06 STAGING**
   - Document ADSB.lol as the default no-key public aircraft source.
   - Document OpenSky as an explicit opt-in bounded fallback controlled by `OPENSKY_FALLBACK_ENABLED=false`.
   - Do not imply anonymous OpenSky is the primary aircraft path.

88. **Install manifest / app icon preservation — IMPLEMENTED IN SBL-06 STAGING**
   - Preserve the approved ShadowNex mark in the web-app manifest for standalone/native-adjacent install surfaces.
   - Manifest metadata does not add a service worker and does not change the no-service-worker rule.

89. **Low-burden Atomic QA workflow — IMPLEMENTED IN SBL-06 STAGING**
   - Preserve a GitHub Actions QA workflow for `main` plus manual dispatch.
   - Run Node 22, the complete `npm test` chain, and deterministic `npm run build`.
   - Use concurrency cancellation and a short timeout to avoid wasting CI minutes.
   - The workflow performs QA only; it does not deploy.

90. **Dynamic ADSB normalization gate — IMPLEMENTED IN SBL-06 STAGING**
   - Mock ADSB.lol at the API boundary and prove identity, source/license metadata, altitude conversion, groundspeed conversion, and vertical-rate conversion.
   - Prove the endpoint uses the bounded point API around the requested view.

91. **Explicit third-party aircraft license boundary — IMPLEMENTED IN SBL-06 STAGING**
   - Retain ADSB.lol ODbL 1.0 notice.
   - Keep OpenSky fallback disabled by default and subject to its current terms.

92. **Superseded-main lock — IMPLEMENTED IN SBL-06 STAGING**
   - Do not reintroduce legacy `src/demo-help.js`, the old OSM-only globe hotfix, or legacy setInterval feed behavior.
   - Their valid intent is already covered by stronger SBL implementations and QA.

93. **Main-only functional audit complete — IMPLEMENTED**
   - As of main `9423586a4e62636ed45a5bc8bdc2249b7367f24f`, every user-facing/release-critical main-only capability is preserved, superseded deliberately, or classified as production history.
   - Re-read main again before creating any reconciled candidate.
   - This does **not** authorize a merge or production deployment.

**SBL-06 deployment state:** STAGING ONLY. Functional convergence is audited; reconciliation/merge remains a separate step.

### SBL-07 — Reconciled release candidate (94–99)

94. **Dedicated reconciliation branch — IMPLEMENTED**
   - Created `reconcile-v2.2.1-sbl-07` from a two-parent reconciliation commit.
   - Current `main` history and the complete audited SBL staging history are both preserved.
   - Neither source branch was rewritten.

95. **Reconciled-content gate — IMPLEMENTED**
   - The candidate uses the audited SBL tree after SBL-05/SBL-06 preservation work.
   - ADSB.lol primary aircraft data, optional bounded OpenSky fallback, native Android installer, detailed satellite Earth, Oklahoma CCTV, SBL-01 through SBL-06 UX/intelligence, Node 22, zero npm dependencies, no service worker, and the deployment lock are all retained.

96. **Core QA corruption repair — IMPLEMENTED**
   - Replaced a corrupted legacy `scripts/qa.mjs` file that prevented Node from parsing the QA chain.
   - Rebuilt the core gate with clean syntax and six-source CCTV mocks including Oklahoma.

97. **Real Node 22 CI gate — PASSED**
   - Executed the full `npm test` chain in GitHub Actions on Node 22 using a temporary QA-only branch derived from the reconciliation candidate.
   - All SBL/core/preservation/convergence suites passed after the QA-harness-only workflow assertion was adjusted for the temporary branch.

98. **Deterministic build gate — PASSED**
   - The same real GitHub Actions run completed `npm run build` successfully after the QA chain.
   - This validates deterministic `dist` construction on the reconciled application tree.

99. **Production hold — LOCKED**
   - The reconciled candidate is not merged to `main`.
   - Vercel Git deployment remains disabled.
   - Creating or testing the reconciliation candidate does not authorize production deployment.

**SBL-07 deployment state:** RECONCILED CANDIDATE QA-GREEN, NOT MERGED, NOT DEPLOYED.

### SBL-08 — Operational watch intelligence (100–106)

100. **In-app Watch Alerts v1 — IMPLEMENTED IN SBL-08 STAGING**
   - Watch Areas establish a silent first-scan baseline and alert only on newly loaded notable activity after that baseline.
   - Initial notable rules: M4+ earthquakes, wildfire events/detections, launches, and military-likely aircraft heuristics.
   - Alerts clearly remain in-app only; they require ShadowNex to be open with the relevant feed loaded.
   - Each Watch Area can mute/unmute its own alerts.
   - Military-likely alerts explicitly retain heuristic wording.

101. **Local 24-hour event history — IMPLEMENTED IN SBL-08 STAGING**
   - Persist notable events ShadowNex actually observed from loaded feeds on this device for up to 24 hours.
   - Reuse the existing `NOW · 15 MIN · 1 HR · 6 HR · 24 HR` window to filter the local history.
   - Historical items can reopen the currently loaded subject or fly to the last locally observed position.
   - Explicitly state that this is a local observation history, not a complete authoritative historical archive.

102. **Intelligence-aware Recent Activity — IMPLEMENTED FOUNDATION IN SBL-08 STAGING**
   - Newly observed notable events are added to Recent Activity after the initial baseline.
   - Watch Alerts also appear in Recent Activity.
   - Routine feed refreshes remain suppressed to avoid notification noise.

103. **Watch Area change detection — IMPLEMENTED FOUNDATION IN SBL-08 STAGING**
   - Track the set of currently notable event keys inside each Watch Area.
   - Alert only when a notable event key appears after the previous scan.
   - Persist a bounded seen-key baseline so ordinary refreshes do not retrigger the same alert.

104. **Explicit near-me world queries — IMPLEMENTED IN SBL-08 STAGING**
   - Understand user-initiated phrases such as `what's flying over me`, `cameras near me`, `fires nearby`, and `what's happening around me`.
   - Request device location only because the user explicitly asked a near-me query.
   - Never request location in the background or simply because Search is open.

105. **Context Coverage v2 — IMPLEMENTED IN SBL-08 STAGING**
   - Nearby Context now also shows the selected source state, count of live/partial enabled feeds, and Watch Area membership.
   - Continue to describe context only from loaded public sources.

106. **Post-reconciliation safety boundary — IMPLEMENTED**
   - SBL-07 staging SHA `93086d8b2cf201d8259adf20a257542a53b966a8` is the protected reconciled/QA-green rollback checkpoint.
   - SBL-08 is additive post-reconciliation staging work and does not change the prior main-convergence audit conclusions.
   - Production remains locked and no merge/deploy is authorized by this batch.

**SBL-08 deployment state:** POST-RECONCILIATION STAGING ONLY. In-app alerts only; no service worker, background monitor, push notification, merge, or production deployment.

### SBL-09 — Subject experience and camera discoverability (107–114)

107. **Mobile subject bottom sheet — IMPLEMENTED IN SBL-09 STAGING**
   - In Simple Mode on phones/Fold-sized layouts, selected-subject details now behave as a map-first bottom sheet instead of a permanent desktop-style side panel.
   - The sheet can expand for deeper inspection and collapses when selection is cleared.
   - Desktop/Advanced behavior remains available without removing underlying detail.

108. **Unified subject action rail — IMPLEMENTED IN SBL-09 STAGING**
   - Put high-value actions directly under the selected subject name: `FOLLOW · FAVORITE · WATCH 50 MI · PRIME HERE · WHERE IS THIS? · EXPLAIN`.
   - FOLLOW appears only for moving aircraft/vessel/satellite subjects.
   - Watch/Favorite/Prime reuse the existing Watch Center and Prime Brief systems rather than creating parallel state.

109. **Aircraft Dossier v3 — IMPLEMENTED IN SBL-09 STAGING**
   - Combine current public position telemetry with public identity/reference enrichment in one card.
   - Show photo when available, callsign, registration, aircraft type, registered owner, Mode-S hex, altitude in feet, speed in knots, heading, ground state, and published route match when available.
   - Preserve the strict rule that a published route or military-likely callsign does not prove current mission, passengers, cargo, crew, or intent.

110. **Satellite Dossier v3 — IMPLEMENTED IN SBL-09 STAGING**
   - Preserve English reference imagery/mission summary and add public orbital context: NORAD ID, orbit band, altitude in miles, approximate period, inclination, and TLE epoch.
   - Enrich parsed TLE records with NORAD catalog number.
   - Keep position explicitly estimated from public TLE propagation, not direct live spacecraft telemetry.

111. **Vessel Dossier v2 + AIS static data — IMPLEMENTED FOUNDATION IN SBL-09 STAGING**
   - Subscribe to AIS `ShipStaticData` in addition to position reports when AISStream is configured.
   - Merge available vessel name, call sign, IMO, AIS vessel type, destination, ETA, and dimensions into the live position contact.
   - State clearly that AIS identity/destination/ETA can be self-reported, delayed, incomplete, or absent.

112. **Camera Coverage browser — IMPLEMENTED IN SBL-09 STAGING**
   - Add `More → Camera Coverage` and searchable `camera coverage / camera regions` intent.
   - Show provider health/counts and quick-jump regions for Oklahoma City, Tulsa, California, London, Austin, Seattle, and Maryland/DC.
   - Oklahoma City/Tulsa remain backed by the public OKTraffic catalog.
   - Explicitly state that unsupported ShadowNex coverage does not mean cameras do not exist in that place.

113. **English nearby-place context — IMPLEMENTED IN SBL-09 STAGING**
   - `WHERE IS THIS?` resolves the selected subject position through cached English OpenStreetMap/Nominatim reverse context.
   - Surface nearby locality/region/country and road when available.
   - The lookup is user-invoked and does not continuously reverse-geocode moving subjects.

114. **SBL-09 safety/QA boundary — IMPLEMENTED**
   - Add dedicated QA for dossier wiring, AIS static-data merge path, TLE/NORAD orbital metadata, camera regions, English reverse-place lookup, mobile sheet, and boot order.
   - Preserve Node 22, zero npm dependencies, no service worker, Vercel deployment lock, SBL-07 QA-green rollback point, and all SBL-08 operational watch behavior.
   - SBL-09 remains post-reconciliation staging only; no merge or production deployment is authorized.

**SBL-09 deployment state:** POST-RECONCILIATION STAGING ONLY. No merge, no production deployment, no service worker.

### SBL-10 — World Explorer depth (115–122)

115. **Simple-mode GLOBE surface — IMPLEMENTED IN SBL-10 STAGING**
   - Simple bottom navigation becomes `HOME · SEARCH · GLOBE · WATCH · MORE`.
   - `GLOBE` opens one clear World Explorer surface instead of forcing users to know which technical panel contains place, imagery, or camera tools.
   - Existing What's Here remains available inside World Explorer and through natural-language search.

116. **Address / property / landmark search — IMPLEMENTED FOUNDATION IN SBL-10 STAGING**
   - Add an English Nominatim geocoder returning up to five user-invoked place/address results.
   - House/building results use close viewing altitude; cities/regions remain framed appropriately.
   - Never claim every address/building is present or exact; results inherit OpenStreetMap/Nominatim completeness.

117. **One-shot ground inspection — IMPLEMENTED IN SBL-10 STAGING**
   - `TAP MAP` explicitly arms a one-shot ground inspector.
   - The next empty-ground click resolves latitude/longitude instead of silently deselecting.
   - Ground inspection never runs passively and automatically disarms after a successful point.

118. **World Explorer place card — IMPLEMENTED IN SBL-10 STAGING**
   - Inspect the center, a search result, or a tapped ground point.
   - Show English street/place/neighborhood/locality/region/postcode/country context when Nominatim supplies it.
   - Preserve exact coordinates for transparency.

119. **Point-specific imagery quality — IMPLEMENTED FOUNDATION IN SBL-10 STAGING**
   - Reuse Esri World Imagery metadata for the inspected point.
   - Surface source, acquisition date when supplied, positional accuracy, and an honest detail band: `VERY HIGH · HIGH · GOOD · STANDARD · UNKNOWN`.
   - Detail band is derived from provider resolution metadata, not image sharpening or fabricated precision.
   - Continue to state clearly that imagery is not live.

120. **Nearby public-camera discovery — IMPLEMENTED IN SBL-10 STAGING**
   - One tap enables the connected CCTV layer and lists up to eight loaded public cameras within 25 miles of the inspected point.
   - Distances use U.S. customary units.
   - No-result wording explicitly says unsupported/empty ShadowNex coverage does not prove no cameras exist.

121. **World Explorer actions — IMPLEMENTED IN SBL-10 STAGING**
   - From one surface: `INSPECT CENTER · TAP MAP · WHAT'S HERE · PRIME BRIEF · IMAGERY INFO · CAMERAS NEARBY · SAVE VIEW · WATCH 50 MI`.
   - Reuse existing Prime Brief, Watch Areas, Saved Views, CCTV, imagery metadata, and navigation history rather than adding parallel state.

122. **SBL-10 safety/QA boundary — IMPLEMENTED**
   - Add targeted QA for exact-place altitude logic, imagery detail bands, English geocoding, one-shot ground inspection wiring, GLOBE nav, camera-radius discovery, and installer order.
   - Preserve the SBL-07 QA-green rollback point, SBL-08 alerts/history, SBL-09 dossiers/camera coverage, Node 22, zero npm dependencies, no service worker, and locked Vercel deployment.
   - SBL-10 remains post-reconciliation staging only; no merge or production deployment is authorized.

**SBL-10 deployment state:** POST-RECONCILIATION STAGING ONLY. No background inspection, no merge, no production deployment, no service worker.

### Product rule
**Simple by default. Powerful by choice. The user asks a simple question; ShadowNex handles the complicated part.**
