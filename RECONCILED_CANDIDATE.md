# ShadowNex Prime™ — Reconciled Candidate

This branch is a non-production reconciliation candidate.

- Base main: `9423586a4e62636ed45a5bc8bdc2249b7367f24f`
- Frozen SBL staging: `92474e1c7a540120363b530b0be84261787ba496`
- Reconciliation method: current main tree + curated 72-file SBL overlay
- Intended branch: `reconcile-v2.2.1-sbl`
- Vercel Git deployment: locked
- Runtime target: Node 22
- npm runtime dependencies: zero
- service worker: prohibited

## Required candidate gate

1. GitHub Actions `npm test` passes.
2. GitHub Actions `npm run build` passes.
3. Manual Fold/mobile QA passes.
4. Re-read `main` again immediately before any PR/merge.
5. Merge approval and production deployment approval remain separate decisions.

This file is not merge or deployment authorization.
