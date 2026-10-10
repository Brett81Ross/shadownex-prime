# ShadowNex Prime™ — Pre-Reconciliation Checkpoint

Date: 2026-10-07  
Repository: `Brett81Ross/shadownex-prime`

## Purpose

This file is a release-safety checkpoint for the SBL staging line. It is not a merge authorization and it is not a deployment authorization.

At the start of SBL-04:
- observed `main`: `9423586a4e62636ed45a5bc8bdc2249b7367f24f`
- observed staging head: `8583c5a708be5bd1c68d55a97c4ece9eee5b9da8`
- staging was 15 commits ahead and 30 commits behind `main`

The branches are materially diverged. **NO BLIND MERGE, FORCE MERGE, OR WHOLE-TREE OVERWRITE IS ALLOWED.**

## Reconciliation order

1. Freeze the final SBL staging candidate and record its SHA.
2. Re-read current `main` immediately before reconciliation. Do not rely on the SHA above if `main` has moved.
3. Compare `main` and staging file-by-file, starting with build/runtime configuration and files changed on both branches.
4. Preserve newer valid work from `main`; integrate SBL behavior deliberately rather than replacing `main` wholesale.
5. Preserve the production-output safeguards: Node 22, `scripts/build.mjs`, `dist`, zero npm dependencies, no service worker, proprietary ownership/third-party notices, and `git.deploymentEnabled=false` until deployment is explicitly authorized.
6. Run the complete QA chain and `npm run build` on Node 22 after conflicts are resolved.
7. QA the reconciled preview on mobile/Fold-sized layouts: first-run flow, Simple Mode, satellite imagery, Oklahoma CCTV, Search, subject cards, Explain This, Prime Brief, Watch Center, Back/Reset, Demo Mode, and Advanced/Simple return.
8. Check failure behavior with at least one source unavailable or key missing. The globe and healthy/local features must remain usable.
9. Only after reconciliation QA is green should a merge/PR be considered.
10. **Production deployment is a separate approval.** A successful merge or CI run does not authorize production.

## Required release gates

- `npm test` passes.
- `npm run build` passes.
- No JavaScript syntax failures.
- No service-worker registration.
- No unexpected runtime npm dependency.
- Detailed Earth view still has a resilient fallback.
- OKTraffic / Oklahoma camera integration remains present.
- User-facing units remain U.S. customary.
- English-first map/search presentation remains intact.
- Heuristic/estimated/stale states remain explicit.
- Prime Brief works without requiring OpenAI.
- Watch Areas never claim background monitoring.
- Demo Mode restores the user's prior state.
- Vercel Git deployment stays locked until explicit authorization.

## Rollback boundary

The final pre-reconciliation SBL staging SHA is the rollback point for the accumulated SBL-01 through SBL-04 work. Record that SHA in the conversation/release notes once SBL-04 advances the staging branch.


## SBL-06 convergence update

The main-only functional audit was completed against `9423586a4e62636ed45a5bc8bdc2249b7367f24f`.

Before a reconciled candidate is created, confirm again that main has not moved. The reconciled candidate must preserve:
- ADSB.lol primary aircraft source and opt-in OpenSky fallback.
- Native Android installation path and manifest icon.
- Detailed Esri World Imagery + Natural Earth fallback.
- SBL-01 through SBL-06 behavior and QA.
- `git.deploymentEnabled=false`.

The old standalone Demo/Help, basic OSM globe hotfix, and legacy globe-hotfix QA file are explicitly superseded and must not be reintroduced.


## SBL-07 reconciled candidate

Reconciliation candidate branch: `reconcile-v2.2.1-sbl-07`

The first real Node 22 CI attempt exposed corruption in the legacy core QA file before application tests could run. That QA file was repaired on staging and the reconciliation candidate was rebuilt without changing production.

A temporary QA-only branch then executed the complete test chain and deterministic build on GitHub Actions. Final QA-harness run:
- workflow run: `37882190789`
- Node: 22
- `npm test`: PASS
- `npm run build`: PASS
- deployment step: none

The temporary QA branch differs from the candidate only in QA-harness trigger/assertion lines needed to execute the workflow on a non-main branch. Application/runtime content is the reconciliation candidate content.

This checkpoint still does **not** authorize merge or production deployment.
