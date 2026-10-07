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

21. **Distinct map icon language**
   - Use recognizable icons for aircraft, vessels, satellites, fires, earthquakes, launches, cameras, and infrastructure.
   - Color supplements meaning but is never the only differentiator.

22. **Auto-zoom intelligence**
   - Selected contacts/events automatically use a useful camera distance and orientation.
   - Prevent camera states that leave the user inside the globe, too far away, or unable to see the selected target.

23. **Context cards**
   - Explain nearby relevant cities, airports, infrastructure, events, and correlated contacts around the selected item.
   - Present correlations as understandable context rather than raw matrices.

24. **Timeline ribbon**
   - Simple time scopes such as `NOW · 15 MIN · 1 HR · 6 HR · 24 HR`.
   - Use available history/trails/events to make change over time understandable.

25. **Watch Areas**
   - Save named geographic regions such as Home, Oklahoma City, Gulf Coast, or a drawn polygon.
   - Surface meaningful changes that occur inside watched areas.

26. **Favorites / Watchlist**
   - Star locations, aircraft, vessels, satellites, or events for fast return.
   - Keep watched items distinct from ordinary map clutter.

27. **Recent Activity feed**
   - Chronological plain-English stream of notable changes, detections, watch-area events, and tracked-item updates.
   - Avoid turning routine feed refreshes into noisy notifications.

28. **Automatic stale-data fading**
   - Fresh contacts render strongly; aging contacts fade and receive `STALE` status before removal.
   - Old data must never visually appear equally current with live data.

29. **Simple connection-quality indicator**
   - Primary state: `LIVE`, `PARTIAL`, or `OFFLINE`.
   - Detailed source diagnostics remain available behind a secondary view.

30. **Self-healing feeds**
   - Backoff/retry failed providers, preserve healthy layers, and recover feeds independently.
   - Provider failure must never freeze the whole app.

31. **Adaptive performance governor**
   - Dynamically tune contact caps, trails, labels, refresh cadence, clustering detail, and render resolution based on device pressure.
   - Restore quality gradually after performance recovers.

32. **One-thumb mobile navigation**
   - Target bottom navigation: `HOME · SEARCH · GLOBE · WATCH · MORE`.
   - Keep high-frequency actions reachable without opening tactical side panels.

33. **“Explain this” everywhere**
   - Add a concise explanation action to contacts, events, feed states, and modes.
   - Convert technical telemetry into plain-English context without inventing unsupported facts.

34. **Honest uncertainty model**
   - Standardize statuses such as `CONFIRMED`, `REPORTED`, `ESTIMATED`, `HEURISTIC`, and `STALE`.
   - Keep source confidence separate from user-facing importance/severity.

35. **Source transparency without clutter**
   - Casual view shows source + update age.
   - Advanced view exposes richer provenance/endpoint/quality details.

36. **Selective Global Overview mode**
   - Show only significant events and meaningful/watchlisted activity instead of enabling every feed.
   - Use clustering/importance scoring to preserve a readable world view.

37. **Natural-language unified Search + NexCommand**
   - Accept phrases such as “take me to Oklahoma City,” “show fires near Los Angeles,” or “aircraft around Dallas.”
   - Search and command behavior should feel like one intelligence system, not two unrelated interfaces.

38. **Predictable Back / Undo state**
   - Back out of fly-tos, selected contacts, presets, cockpit scenes, and tool states predictably.
   - Preserve a small navigation/state history so users can recover from accidental actions.

39. **One-tap full Reset**
   - Restore safe camera, layer, modal, tracking, cinematic, filter, and tool defaults in one action.
   - Reset must always recover the app to a known usable state.

40. **Demo Mode / “Show Me ShadowNex”**
   - Optional 30–45 second guided tour using current live data.
   - Demonstrate search, presets, contact selection, briefing, and map movement without requiring documentation.

41. **Progressive feature discovery**
   - Introduce NexDraw, SceneDirector, PrimeCorrelate, ShadowLens, subsea data, and reconstruction tools only as users explore deeper.
   - Avoid explaining advanced systems during first-run onboarding.

42. **Simple / Advanced interface toggle**
   - Simple mode is the default and changes presentation, not capability.
   - Advanced mode exposes raw telemetry, full feed controls, drawing, scenes, correlation, and diagnostics.

43. **Graceful degraded-data architecture**
   - Design the app to stay useful when providers rate-limit, go offline, change schema, or only partially respond.
   - Keep the globe, saved views, local UI, and healthy sources usable during provider outages.

44. **Prime Brief™**
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

### Product rule
**Simple by default. Powerful by choice. The user asks a simple question; ShadowNex handles the complicated part.**
