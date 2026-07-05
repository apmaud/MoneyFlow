# MoneyFlow — Frontend

React + Vite + MUI + Redux Toolkit client for the MoneyMovementSimulator API.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your Api project runs on a different port
npm run dev
```

The app runs at `http://localhost:5173` by default — which is also the exact
origin your backend's `AllowedOrigin` CORS setting already expects
(`MoneyMovement.Api/appsettings.json`), so no backend changes are needed.

Make sure the backend is running first (`dotnet run --project MoneyMovement.Api`
from the `backend/` folder) and that Postgres is up, or every request here
will fail with a network error.

## What's here

- **`src/api/`** — one file per backend controller (`authApi`, `accountsApi`,
  `transfersApi`), each a thin wrapper around `axiosClient`. Routes are
  matched exactly to `AuthController` / `AccountsController` /
  `TransfersController`.
- **`src/store/`** — Redux Toolkit slices. `authSlice` is the only one
  persisted to `localStorage` (via `redux-persist`) — that's what lets a
  page refresh keep you logged in without an extra round-trip to the
  backend just to check. `accountsSlice` caches the account list for the
  session so switching tabs doesn't re-fetch every time; a manual refresh
  button and any mutation (transfer, new account) explicitly re-fetch it.
- **`src/routes/RouteGuards.jsx`** — `RequireAuth` / `RequireGuest` read
  straight from persisted Redux state to decide redirects, no API call
  needed.
- **`src/theme/theme.js`** — the lavender/plum/mist palette and type scale.
  `moneyFontSx` is the shared style for every currency figure in the app.

## Known gaps / next steps

- **No "send to another user" lookup.** The backend has no endpoint to look
  up an account by owner email — `TransferTab` requires pasting a raw
  account ID for the recipient. A `GET /api/users/{email}/accounts` (or
  similar) endpoint would let this become a proper search field.
- **No "My other accounts" quick-pick** for the recipient — since the
  backend allows P2P transfers (see `ForbiddenAccountAccessException` only
  checking the *sender*, not the recipient), the To field is intentionally
  free-text rather than limited to the user's own accounts.
- **Profile page has limited data** — the JWT only carries id/email/name/exp
  (see `JwtTokenService`), so things like "member since" aren't shown. A
  `GET /api/auth/me` endpoint returning the full `UserDto` would let this
  page show more without stuffing extra claims into every token.
- **No toast/snackbar system** — form-level `Alert`s are used for
  success/error feedback for now; a global snackbar would read more
  polished for things like "Account created" confirmations.
