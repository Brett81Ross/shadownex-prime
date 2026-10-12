# ShadowNex Prime™ — $0 Worldwide Webcam Activation

**Status:** Staged v2.2.7 (ABL #8). **Do not merge or deploy without owner approval.**

## What works without an account
Official public providers: Oklahoma ODOT/OTA, California Caltrans, City of Austin, Seattle DOT, Maryland CHART, Iowa DOT statewide, Washington State DOT statewide, and Transport for London. Video availability varies by provider. Snapshots and recorded clips are never represented as continuous live video.

## Activate optional Windy Webcams API Free
1. Open https://api.windy.com/keys and sign in/create a Windy account.
2. Create a **Webcams API** key on the **Free** tier (not a Point Forecast or Map Forecast key). Review https://api.windy.com/webcams/pricing and https://api.windy.com/webcams/terms.
3. In **Vercel → ShadowNex Prime → Settings → Environment Variables**, add a **Sensitive** variable with:
   - Name: `WINDY_WEBCAMS_API_KEY`
   - Value: your newly generated **Webcams** key
   - Environment: **Production** only.
4. Save the variable and tell the developer **“Windy key saved”**, without pasting the actual key into chat or GitHub.
5. Do not deploy until the owner gives explicit deployment approval. A saved variable only becomes available to a newly built production deployment.
6. After the approved **single** deployment, verify `/api/webcams?lat=35.4676&lon=-97.5164`, a second U.S. region, and an international region such as London. Only response state/count/status should be inspected; never return or log the key.

## Provider requirements and limitations
- Windy's V3 endpoint is `https://api.windy.com/webcams/api/v3/webcams`, with the server-side `x-windy-api-key` header. Never place API keys in client-side JavaScript, a URL query or a GitHub file.
- Webcams are selected by `nearby=latitude,longitude,radiusKilometers`; max radius 250 km, max 50 results per request. All-world search is a roaming discovery system, not a feed of every worldwide camera.
- Windy's free plan supports linked small images and embedded webcam player, not unrestricted photo mirroring or ad-free full-resolution content.
- Windy Webcams API free-tier image tokens expire after **10 minutes** per its docs (pricing says 15; honor the shorter limit). Cache window is only two minutes.
- Show **Webcams provided by Windy.com** and direct link to original webcam for displayed images/player, as required by their terms.
- Snapshot = published still; clip = recorded short video; LIVE = playable, actual live stream only after player receives frames. Source outages degrade gracefully.
- Without the Windy key: `/api/webcams` returns `{configured:false,points:[]}`, and no Windy upstream calls are made. Regional official public sources remain independently available.
- Owner retains the **$0** policy. Never upgrade to a paid tier, purchase additional services, or deploy without explicit approval.

## Release checklist
- [x] v2.2.7 staged in draft PR #8, preserving v2.2.6 rollback.
- [x] No-key global fallback, feed normalization, URL allowlisting, and representative HLS/clip/still browser QA.
- [x] WSDOT statewide image feed, Iowa statewide catalog, and Oklahoma playable video QA.
- [ ] Windy free key created by owner and saved to Vercel Production environment.
- [ ] Actual Windy Webcams API-key integration verified in production after owner-approved deploy.
- [ ] Physical Galaxy Fold smoke test, including fullscreen and rotating Fold while player is open.
- [ ] Production deployment expressly approved separately (one push only).
