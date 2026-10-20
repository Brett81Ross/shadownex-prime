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
