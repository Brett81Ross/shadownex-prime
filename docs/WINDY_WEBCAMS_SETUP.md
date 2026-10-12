# ShadowNex Prime™ — Windy Webcams Free API Setup

**Scope:** Worldwide public webcam discovery near the globe camera, using the **Webcams API v3**, not Windy's weather API.

## Owner steps (Android or desktop)
1. Go to https://api.windy.com/keys and sign in or register with Windy.
2. Create a **Webcams API** key and choose the **Free** tier. Do not select Professional, Point Forecast or Map Forecast by mistake.
3. Keep the key private. Don't paste it into GitHub issues, repository files, screenshots, or chat.
4. Add the key to the **existing ShadowNex Prime** Vercel project as the **encrypted** Production environment variable `WINDY_WEBCAMS_API_KEY`. Use the exact name. Do not create a second Vercel project.
5. Run the existing release approval process, then one production deployment after the entire Atomic Build List is ready. Updating an environment variable alone does not update an already running deployment.
6. Confirm `/api/webcams?lat=35.4676&lon=-97.5164` reports `configured:true` and public webcam points, then test another part of the globe. No token or API key should ever appear in the browser response.

**Key status (2026-10-11):** The owner saved the key. Read-only Vercel metadata confirms `WINDY_WEBCAMS_API_KEY` in the existing ShadowNex project as Production-only and Sensitive. The value has not been inspected or revealed. Authenticated function execution is still unverified until the separately approved v2.2.7 production deployment.\n\n**Release gate:** Windy global cameras are OFF if no key is configured. Existing US and UK agency cameras should continue independently.

**Important provider terms:** Windy's Free Webcams API is free, but webcams must be visible in the free portion of the app; attribution and links to Windy are required. Supplied preview images must not be enlarged. Windy API v3 free image links expire (their documentation says about 10 minutes). The server cache is kept below that at 2 minutes. Do not redistribute the API or scrape/bulk-download cameras. Respect any embedded provider advertising.

**Verified references**
- https://api.windy.com/webcams/docs
- https://api.windy.com/webcams/pricing
- https://api.windy.com/webcams/terms
- https://account.windy.com/agreements/windy-api-webcams-terms-of-use

**Known limits:** Free tier max 50 cameras per nearby request, max 250 km radius. Globe movement requests a new nearby sample rather than fetching the world's entire collection. Sources are public and may go offline. Not all Windy webcams are continuous live video.
