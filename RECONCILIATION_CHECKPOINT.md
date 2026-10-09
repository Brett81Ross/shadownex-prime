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

## Reconciliation candidate

- Branch: `reconcile-sbl-v2.2.1`
- Base `main`: `9423586a4e62636ed45a5bc8bdc2249b7367f24f`
- Initial reconciled candidate: `032db7b1f151ff4c154e633f9daadce0c86b4a25`
- Candidate preserves ADSB.lol primary aircraft data, native install/branding, and the SBL-01 through SBL-04 feature line.
- The branch-only QA workflow trigger may add a later harness commit. It does not authorize merging or deployment.

## Reconciliation QA result

- Green functional candidate: `6d1023584ef666f3c97f8f27d73c6349f22c4b81`
- GitHub Actions green run: `37870552887`
- Node: 22.x
- Core QA: 34 passed, 0 failed
- ABL QA: 9 passed, 0 failed
- Intelligence QA: 7 passed, 0 failed
- Situation QA: 11 passed, 0 failed
- Everyday UX QA: 11 passed, 0 failed
- SBL-01 QA: 14 passed, 0 failed
- SBL-02 QA: 11 passed, 0 failed
- SBL-03 QA: 17 passed, 0 failed
- SBL-04 discovery QA: 16 passed, 0 failed
- Reconciliation gate: 10 passed, 0 failed
- Reconciled globe + aircraft QA: 24 passed, 0 failed
- Production build: PASS — deterministic `dist/` completed
- Total automated assertions across the chained application/reconciliation suites: 164 passed, 0 failed.
- The temporary reconciliation-branch workflow trigger was removed after the green gate; the workflow is restored to its normal `main` push trigger.
- This green result is a merge-readiness gate only. It is **not** production deployment approval.

## Rollback boundary

The final pre-reconciliation SBL staging SHA is the rollback point for the accumulated SBL-01 through SBL-04 work. Record that SHA in the conversation/release notes once SBL-04 advances the staging branch.


## SBL-06 convergence update

- SBL staging convergence head: `92474e1c7a540120363b530b0be84261787ba496`
- Main audited again: `9423586a4e62636ed45a5bc8bdc2249b7367f24f`
- Reconciliation inventory now classifies every remaining main-only file as preserved, superseded deliberately, or production/history-only.
- Environment documentation now reflects ADSB.lol as the primary no-key aircraft source and OpenSky as an explicit opt-in fallback.
- The approved ShadowNex manifest icon remains present without introducing a service worker.
- SBL-05 preservation QA and SBL-06 convergence QA are added to the normal `npm test` chain.
- The previously green reconciled `qa-globe-hotfix.mjs` remains as an additional reconciliation-specific workflow assertion.
- GitHub Atomic QA remains non-deploying and normal `main`/manual only.

This convergence update does not invalidate the earlier green gate; it adds release-contract checks on top. A fresh QA/build run is still required before any future merge approval.

### Superseded-main lock
Do not reintroduce:
- legacy page-loaded `src/demo-help.js`,
- the temporary OpenStreetMap-only globe hotfix,
- legacy simple `setInterval` feed retry behavior.

Their valid intent is covered by stronger reconciled SBL implementations.
