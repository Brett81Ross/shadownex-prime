# PR #9 — Protected online Fold QA: quota, security and approval gate

**Decision status: REVIEW ONLY / NO ACTIVATION.** Prepared 2026-10-20. Do not deploy, create a preview, expose a URL, change project settings, bypass authentication, purchase anything, or merge PR #9 without the owner's separate approval.

## Live verified Vercel account configuration
- Team: `brett-ross-projects1`, **Hobby** plan.
- Existing Vercel project: `shadownex-prime`, id `prj_9HhZynvdeJY9iqYsdO9Zm8cWWlTm`; linked to private GitHub `Brett81Ross/shadownex-prime`.
- Current project authentication: `ssoProtection.enabled=true`, scope `all_except_custom_domains`. Password protection **off**; trusted IP protection **off**. **Do not** turn off or bypass SSO.
- Project Node version currently **24.x** while `package.json` requires **Node >=22 <23**. Before preview activation prepare and validate a Node **22.x** build plan, without silently changing production project settings.
- Git integration deployment is disabled in repository `vercel.json`: `git.deploymentEnabled:false`. Preserve this barrier. Production is not to be touched.
- The latest listed project deployment was production; no new preview was created as part of this review.

## Plan entitlement vs remaining quota
Current provider documentation:
- Vercel Authentication protection is included on all plans; eligible logged-in Vercel members with access can open a protected preview. On Hobby, do not rely on password protection.
- Hobby published limits include 100 deployments/day, 1 concurrent build, 100 MB static-file uploads, 45-minute maximum build time, and up to 32 build deployments/hour. A September 2026 announcement also identifies a 10 GB Hobby deployment-storage allowance.
- Hobby plan is free but use is subject to included usage and **noncommercial** restrictions. ShadowNex QA must be confirmed to be permitted use before hosting here.
- **ACCOUNT-SPECIFIC REMAINING QUOTA NOT VERIFIED.** Connector access exposed plan/project settings, but not the current live team Usage/storage counters or quota headroom. Check Vercel team > Usage and storage/deployment capacity directly before executing. Stop if near limits or if any fee/upgrade appears. No credit card, Pro trial, paid security addon or billing changes.
- Sources: https://vercel.com/docs/limits ; https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage ; https://vercel.com/docs/deployment-protection ; https://vercel.com/docs/limits/fair-use-guidelines ; https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan

## Proposed access configuration — not implemented
1. Use a **separate QA Vercel project** rather than modifying existing `shadownex-prime` production project. No production aliases or domains may be assigned to the QA project. First confirm whether one additional project fits quota and Hobby restrictions.
2. Deploy **only one** pinned PR #9 commit with its verified source tree and static build; use Node 22. Explicitly specify a non-production environment. Any repository `/api` routes, test credentials and data sources must be reviewed separately; do not inherit production secrets, writable databases, or tokens.
3. Configure Vercel Authentication with Standard Protection **before** any QA URL becomes accessible. Verify denied anonymous requests and authorized owner sign-in from the Fold. Use normal authenticated access only; **do not** issue a bypass/shareable link.
4. Disable indexing, service-worker/PWA association to production, public install links, telemetry writes and external side effects on the QA build. Treat these as required implementation checks, **not currently established facts**.
5. Record the exact PR commit SHA, Node version, output checksum, authorization/account scope, and QA hostname, then test `docs/qa/pr9-galaxy-z-fold-hardware-acceptance.md` on cover and unfolded displays.
6. Stop on unauthorized access, non-zero charges, unreviewed API keys, live production writes or visual instability. Delete the QA project/deployment and revoke QA access when testing ends. No merge or production deployment automatically follows QA.

## Open prerequisites blocking activation
- Actual **available** Vercel Hobby usage/deployment storage capacity not accessible from current account read tools.
- Owner's sign-in ability/access membership on the Galaxy Z Fold has not been tested.
- Eligibility for Hobby noncommercial use must be established. Otherwise choose another authorized no-cost noncommercial/private testing method.
- Build Node 22 vs project Node 24 mismatch must be isolated without changing production.
- Exact static app/QA API behavior, service-worker implications and full production-secret isolation need verification.
- Real PLATEAU endpoint behavior and Fold rendering remain pending hardware QA.

## Next owner approval
Approve only the following future **single controlled action** after the blockers are explicitly resolved: create one separate authentication-protected QA project and one nonproduction preview from the pinned PR #9 commit, with zero purchases/paid services, then verify access from the Fold. The owner has **not** yet granted that activation approval.

## Follow-up account-level read audit — 2026-10-20 (no changes applied)
- Re-read live `shadownex-prime` project: `nodeVersion=24.x`, `ssoProtection.enabled=true` (`all_except_custom_domains`), password protection off, trusted IP protection off. Existing project and production untouched.
- Team member list contains **one confirmed OWNER**. This establishes a plausible authorized Vercel login path; Galaxy Z Fold browser sign-in is **not yet tested**, and a *new separate QA project* must have protection explicitly verified before a URL is used.
- Queried `GET /v1/billing/charges` for October 2026 and received **404 `costs_not_found`**; no account-specific consumption or remaining deployment/storage headroom could be established. Do not interpret the error as no spend or as free capacity.
- Vercel docs say Hobby supports Vercel Authentication with **Standard Protection**, not paid password protection. Avoid authentication bypass/shareable links and verify unauthenticated denial as well as owner acceptance. Reference: https://vercel.com/docs/deployment-protection and https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication
- Vercel Node runtimes support **22.x**. For an isolated QA project, explicitly select `22.x` (and preserve `package.json.engines.node=">=22 <23"`); do **not** update the existing production project. Reference: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Official Hobby limits include up to **200 projects**, **100 deployments/day**, **one concurrent build**, **100 MB static uploads**. Those are tier maximums and *not* current remaining capacity. Reference: https://vercel.com/docs/limits
- Hobby eligibility: confirm this specific preview is personal/noncommercial testing under Vercel's applicable fair-use terms before using Hobby. Do not infer eligibility merely from a low request volume or draft status. Reference: https://vercel.com/docs/plans/hobby

### Final execution hold points
1. Check the **live Vercel Usage dashboard** and confirm remaining free deployment/build/storage/function allowance; provide a recorded snapshot or numbers. Charges API unavailable is not sufficient.
2. Verify this specific PR #9 test use is allowed on Hobby; if business/commercial QA, stop and select a separately authorized eligible service/path.
3. Confirm the Fold uses the **same Vercel owner account** and can reach its sign-in flow. No shareable bypass link.
4. Obtain separate approval for **one new isolated QA project**, Vercel Authentication Standard Protection enforced and checked, Node 22, pinned Git SHA, no production environment variables, no production aliases, safe read-only/fixture APIs, no PWA/install cross-contamination, no auto deployments.
5. Build in a guarded sequence where protection is verified **before** exposing any test URL; stop on a protection failure, paid upgrade prompt, quota shortfall, or unexpectedly public URL. Request **a second explicit deployment authorization** if the owner only approves project setup.
6. Tear down QA project after acceptance; do not touch production and do not run GitHub Actions.

**Current disposition: NOT APPROVED FOR ACTIVATION. This document updates planning evidence only.**
