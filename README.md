# Walker Partner Demo

Small web app for testing partner wallet connection and spending in the four-repo Walker integration:

- `Walker`: API, hosted consent, wallet read/spend endpoints
- `Walker-ios`: user authorization for partner connections through `walker://connect`
- `Walker-sdk-js`: JavaScript SDK consumed by this demo app

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Flow

1. Register `https://walker-partner-demo.onrender.com/callback` for the partner app in Walker admin.
2. Paste the Walker-provided client ID into this demo.
3. Open hosted Walker consent at `/connect`.
4. Sign in with Google and approve the connection.
5. Capture the returned `connectionToken` on this web app callback.
6. Use the JS SDK to read balance, list transactions, and spend credits.

## Notes

- The default API is `https://walker-xl5k.onrender.com`.
- The demo installs the SDK from public GitHub via `git+https://github.com/Canpake7/Walker-sdk-js.git#2d92131bfca703df8ff80c1b803eccbcf7e043b3`.
- For local backend testing, set the API field to `http://localhost:8000`.
- The development connection button uses `DEV_AUTH_ENABLED=true` fallback headers.
- The client ID is a Walker partner client ID. It is not the Google OAuth client ID, Apple Team ID, or iOS bundle ID.
- The Walker app shortcut uses `walker://connect` and only works on devices where the Walker app is installed.
