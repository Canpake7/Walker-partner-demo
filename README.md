# Walker Partner Demo

Small web app for testing partner wallet connection and spending in the four-repo Walker integration:

- `Walker`: API, hosted consent, wallet read/spend endpoints
- `Walker-ios`: official app that records activity for Walker wallets
- `Walker-sdk-js`: JavaScript SDK consumed by this demo app

## Run

```bash
npm install
npm run dev
```

Configure:

```text
VITE_WALKER_CLIENT_ID=wpk_...
```

Open:

```text
http://localhost:5173/demo/
```

The deployed root (`/`) renders the Walker landing page. The partner connect-and-spend tool is served from `/demo/`.

## Flow

1. Register `https://walker-partner-demo.onrender.com/demo/` for the partner app in Walker admin.
2. Set `VITE_WALKER_CLIENT_ID` to the Walker-provided client ID.
3. Open hosted Walker consent at `/connect`.
4. Sign in with Google and approve the connection.
5. Capture the returned `connectionToken` on this web app callback.
6. Use the JS SDK to read balance, list transactions, and spend credits.

## Notes

- The default API is `https://walker-xl5k.onrender.com`.
- The partner client ID is read from `VITE_WALKER_CLIENT_ID`.
- Render can deploy this as a Node web service using `render.yaml`.
- The demo installs the SDK from public GitHub via `git+https://github.com/Canpake7/Walker-sdk-js.git#2d92131bfca703df8ff80c1b803eccbcf7e043b3`.
- The client ID is a Walker partner client ID. It is not the Google OAuth client ID, Apple Team ID, or iOS bundle ID.
