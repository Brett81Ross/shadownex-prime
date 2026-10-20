# ShadowNex Prime™ PR #9 — Isolated Galaxy Z Fold test-build and access plan

**Status: PREPARED ONLY — OWNER APPROVAL REQUIRED.** No build has been served, no preview created, no settings changed, and no QA access activated.

## Goals and non-negotiable boundaries
- Test the exact frozen PR #9 commit on a real Galaxy Z Fold without changing production v2.2.7.
- $0 additional spend; no GitHub Actions; no merge; no production or preview deployment without a separate explicit owner authorization.
- Keep the PR private. Never publish server/API keys, saved watches, personal location, camera credentials, telemetry or production data.
- Do not use any live production writable services for test mutations. No payments, account changes, public traffic-camera probing or high-rate remote polling.
- Do not represent Node mocks or screenshots of the older production app as PR #9 hardware acceptance.

## Source/build provenance (prepare after authorization)
1. Freeze and record PR #9 **full commit SHA**, exact changed-file blob hashes and `node --version` (Node 22 required).
2. In an isolated temporary directory, obtain the actual branch content directly from GitHub (or reconstruct and verify *every* modified path against its GitHub blob SHA, with unchanged files from the same base commit). Verify checkout and diff; do not use an older build.
3. Run `npm test` and `npm run build` locally, save exit codes, test/build logs, and SHA256 manifest for the generated `dist/`. This is independent of GitHub Actions and has no build-service charges. **Do not execute as part of this plan-only phase.**
4. Inspect the output for inadvertently bundled secrets and confirm that external data feeds need no private production credentials. Set test keys blank; opt-in to public community 3D. The app build currently copies `src/`, `public/`, `index.html` and related static files into `dist/`.
5. Ensure a unique nonproduction identity (test banner, test manifest or private build token in test-only wrapper) without changing the actual PR application or overriding production app/PWA associations.

## Recommended first hardware access path: private USB debugging / port forwarding
**Requires an owner's computer, USB debugging authorization on the Fold, and compatible Android debugging tools.** The computer alone serves the static PR build on localhost; this is not a cloud deployment.

1. Serve the isolated `dist/` from **127.0.0.1** on an unused local port with a minimal static server; do not expose the existing repository `scripts/dev.mjs` because it binds to all interfaces and proxies `/api/*` requests without login.
2. Connect the Fold by USB; manually authorize the computer's debugging fingerprint.
3. Set up Android Debug Bridge reverse port forwarding (`adb reverse tcp:4173 tcp:4173`) and visit `http://127.0.0.1:4173` in the Fold browser. This stays between the trusted phone and local computer. Check WebGL, camera and network behavior in the actual Fold browser. HTTP loopback is ordinarily treated as a potentially trustworthy origin; verify the browser's behavior rather than assuming PWA/native-install capability.
4. Static build **does not include** the repository `api/` serverless endpoints: source feeds that call `/api/*` will fail unless separately provided by a QA-only API implementation. For 3D geometry/layout/marker visuals use controlled fixtures or explicitly approved read-only QA endpoints; do not claim live-camera or feed acceptance without actual endpoints.
5. When finished, stop the local server, remove reverse forwarding (`adb reverse --remove tcp:4173`), revoke device authorization if desired, and delete temp files/logs with sensitive test data.

**Availability prerequisite:** Confirm the owner has a suitable computer and USB cable. If not, the USB path is **not currently executable**; choose the fallback only after owner approval.

## Alternative only after separate owner approval: protected QA preview
- Plan a distinct isolated preview deployment on an existing no-additional-cost allowance **only after verifying provider quota/entitlements and access controls**; never promise free capacity without checking. Keep it separate from production, protected by a tested authentication gate, and prevent public search/indexing.
- Use independent QA environment values; no production secrets or writable database credentials.
- Existing `vercel.json` has `git.deploymentEnabled:false`. Do **not** alter or bypass this during preparation. Any deliberate preview deployment requires a new explicit approval covering provider, access method, hostname, cost and teardown.
- The static `dist/` may require nonproduction API routes or local fixtures to exercise data layers. Identify missing read-only routes before activation.
- After authorized use, revoke credentials, disable/remove preview and confirm production remains intact.

## Acceptance and evidence capture
Use `docs/qa/pr9-galaxy-z-fold-hardware-acceptance.md` cases A1–A10. Repeat on cover and main displays in portrait/landscape. Collect orientation/device/browser/commit SHA, short screen recording/screenshots, network/CORS console diagnostics, source attribution, marker selection, PLATEAU roof/building quality, camera orbit/tilt, overlapping data behavior, low-power recovery, FPS/graphics-loss evidence where measurable, and a PASS/FAIL/BLOCKED disposition for each case. Avoid exact private address or personal contacts in screenshots.

## Stop/rollback criteria
- Untrusted/public access, unexpected paid billing, suspected key exposure, production URL or data mutation, or device instability => **STOP**, disable local forwarding/QA access, restore initial settings, report evidence.
- PLATEAU endpoint unavailable or no CORS => mark that test BLOCKED; global fallback should continue. Never manufacture a PASS.
- Production remains untouched throughout. PR #9 remains draft until all critical cases pass and owner authorizes a separate release.

## Decision requested from owner
Approve **one specific access route** and its prerequisites in a later turn:
**A (preferred)**: USB/ADB private localhost test once a computer/cable are available; or **B**: authorize preparation of a separately gated hosted preview after quota/security review.
**No execution, preview activation, network tunnel or device action is authorized by approval of this planning document alone.**
