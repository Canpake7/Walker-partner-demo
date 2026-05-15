# Walker Partner Demo Project Context

Walker-partner-demo is a small web app for testing partner wallet connection and spending across the four-repo Walker ecosystem.

## Related Repositories

- `Walker`: backend API, hosted `/connect` consent page, wallet endpoints
- `Walker-ios`: official iOS app that records HealthKit activity and can approve custom-scheme partner links
- `Walker-sdk-js`: TypeScript SDK consumed by this demo app

## Purpose

This app simulates a third-party partner app. It should help test:

1. hosted Walker consent URL generation
2. partner redirect callback handling
3. connection token storage
4. wallet balance reads
5. transaction listing
6. spending credits with idempotency

## Run

```bash
npm install
npm run dev
```

Local URL:

```text
http://localhost:5173
```

iPhone-on-Wi-Fi URL from the current Mac network, if testing a local dev server:

```text
http://YOUR_MAC_WIFI_IP:5173
```

## SDK Dependency

The demo depends on the SDK from GitHub:

```json
"@walker/walker-sdk-js": "git+https://github.com/Canpake7/Walker-sdk-js.git#2d92131bfca703df8ff80c1b803eccbcf7e043b3"
```

After SDK changes, push the SDK repository to GitHub and update this commit pin so installs stay deterministic.

## Main Flow

The primary cross-platform path is hosted Walker consent:

```text
https://walker-xl5k.onrender.com/connect?client_id=wpk_...&external_user_id=...&redirect_uri=...
```

Partner apps are created in Walker admin. For the hosted demo, register this exact callback URL:

```text
https://walker-partner-demo.onrender.com/callback
```

The user signs in with Google on Walker's hosted page, authorizes the connection, and Walker redirects back to this app with:

```text
walker_connection_token
walker_connection_id
external_user_id
scopes
```

The demo stores the connection token in `localStorage` and uses it for partner wallet API calls.

## Important IDs

- Partner client ID: issued by Walker, starts with `wpk_`
- Partner connection token: returned after authorization, starts with `wct_`
- External user ID: any stable ID from the partner app's own user system, such as `demo-web-user`

Do not confuse the partner client ID with Google OAuth client IDs, Apple Team ID, or the iOS bundle ID.

## Backend Requirements

For the hosted Render backend, CORS must allow this app's deployed origin:

```text
CORS_ALLOWED_ORIGINS=https://YOUR_PARTNER_DEMO_RENDER_URL
```

For local browser testing, add local origins such as `http://localhost:5173` or `http://YOUR_MAC_WIFI_IP:5173`.

For hosted `/connect` Google Sign-In, Walker needs:

```text
GOOGLE_WEB_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_IDS=<ios-client-id>.apps.googleusercontent.com,<web-client-id>.apps.googleusercontent.com
```

## Notes

- The `Open Walker app shortcut` button uses `walker://connect` and only works on devices where Walker iOS is installed.
- The `Dev connection` button uses development auth headers and only works when `DEV_AUTH_ENABLED=true`.
- `dist/`, `node_modules/`, and `*.tsbuildinfo` are generated and ignored.
