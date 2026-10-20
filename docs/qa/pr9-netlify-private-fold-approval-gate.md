# ShadowNex Prime™ PR #9 — Netlify private QA preparation and approval gate

**Status: PLANNED ONLY — DO NOT CREATE PROJECT OR DEPLOY.** Prepared 2026-10-20.

## Facts observed in owner's Netlify screenshots
- Team: Brett Ross; plan **Free**; team contains **1 member**.
- Usage & billing for Oct 16–Nov 15: **300 credits available**, **0/1 concurrent builds** at capture time. These are snapshots, not a guarantee of continuing headroom.
- Under Visitor access, team **Default project visibility: Private for new projects** after the owner changed/saved it.
- The older screenshot showed both default project visibility and preview access as **Public**. The newest screenshot only proves the **new-project visibility** setting; **preview protection remains to be confirmed on the new project**. Do not assume both have been made private.
- No Netlify project, deployment or upload has been approved or created for ShadowNex.

## Exact application build and reproducibility
- Source: private GitHub `Brett81Ross/shadownex-prime`, draft PR #9, branch `work/abl9-zero-cost-3d-fold`.
- Freeze the **full HEAD commit SHA immediately before preparing the artifact**, and validate all modified file blob hashes against that commit; do not mistakenly use stale source or a previous snapshot.
- Node `>=22 <23` required by `package.json`; no npm dependencies are listed.
- QA procedure once separately authorized: `node --version`, `npm test`, `npm run build`. Build script copies `index.html`, `style.css`, `brand.css`, `native-install.js`, `brand/`, `src/` and `public/` into `dist/`.
- Produce an SHA256 manifest, archive and test/build logs; inspect all emitted static assets for API keys, secrets, personal data, service-worker cross-origin behaviors and references to production services.
- **No artifact has been built in this preparation-only step.** Fresh exact-head build success must not be presumed.

## Proposed $0 Netlify site — configuration not yet applied
- New separate QA project only; suggested recognizable name `shadownex-pr9-fold-qa` if available. No custom domain, no production aliases, no auto-Git connection or builds, no paid upgrade.
- Set **project visitor visibility private** and **deploy preview access private**; test denial from signed-out/incognito browser, and access from the authorized owner account. Do this **before uploading any ShadowNex source or build**.
- One manual upload of the locally validated static `dist/` artifact, not direct GitHub import. This eliminates auto-deploy triggers and separates GitHub minutes from hosting. Netlify Free usage is credit-based and may consume credits; stop if projected usage exceeds available free credits.
- Verify that private protection covers the primary site hostname, deploy-specific URLs and any branch/deploy previews; a team default alone is insufficient proof.
- Use safe test-only labels/manifest, prevent indexing and avoid Android production-install actions. **Do not import production environment variables**, saved watches or writable service credentials.
- The static `dist/` does not include Vercel `api/` routes. Test live layers and camera playback separately with explicitly approved **read-only fixtures or QA-safe endpoints**; mark cases blocked when those routes are unavailable.
- Data-provider terms/CORS and real PLATEAU LOD2 response on the Fold remain unverified; don't assert global photorealism or successful rendering without a device test.

## Phased approval and activation order
1. **Preflight (this phase):** document plan, account screenshots, source build recipe and access verification requirements. No activation.
2. **First separate owner approval:** permit creating an **empty private** Netlify QA project with its own isolated settings; **do not upload application yet**. After creation, verify the actual project visibility and deploy-preview policy, and confirm owner login and anonymous denial where possible.
3. **Second separate owner approval:** after account credit check, successful Node 22 local build, secrets review and verified private access, allow **one** pinned PR #9 static upload only to that isolated QA site. No public deployment and no upgrade.
4. **Hardware QA:** Galaxy Z Fold cover/main in portrait/landscape, A1–A10 in `docs/qa/pr9-galaxy-z-fold-hardware-acceptance.md`; capture PASS/FAIL/BLOCKED and no invented FPS measurements.
5. **Teardown:** remove test deployment/project and revoke QA access after testing; confirm Vercel production is unchanged and PR #9 remains draft.

## Non-negotiable stops
- If the Free plan cannot provide private access to both published and preview deployment URLs, **STOP**. Do not upload and do not rely on a secret/unlisted URL.
- If Netlify requires paid access protection, billing upgrade, repository sharing, or a credit purchase, **STOP**.
- If a QA test would mutate production, leak secret credentials, or bypass licensing/API rules, **STOP**.
- Actual device success is not established by source tests or a documentation-only step.

**Current gate: AWAIT OWNER'S EXPLICIT APPROVAL TO CREATE AN EMPTY QA PROJECT. This document is not that approval.**
