# Project Status

Last reviewed: 2026-05-16

## Working
- Facebook Marketplace **cars** sniper (`lib/fb-scraper.js`, `lib/scanner.js`) — production-ish, runs the local Electron dashboard fine.
- Discord webhook routing scaffold (`lib/shared-marketplace/notifier.js`).

## Partially working / WIP
- **Wallapop sniper** — scaffold in place, API endpoint + device-id header changed since v2.0.0, listings come back empty.
- **Vinted sniper** — multi-region host map is correct, but cookie + CSRF flow broke around late April. See FIXMEs in `lib/vinted-sniper.js`.
- **Mercari sniper** — search endpoint structure outdated (`/v1/search` 404s), and the token refresh needs HMAC-signed nonce work that isn't done.
- **Facebook electronics sniper** — never finished; only the cars path is wired through `fb-scraper.js`.

## Not implemented
- Auto-update flow (mentioned in README but the actual `electron-updater` plumbing isn't here).
- Migration assistant from v1 watchlist format.
- Mercari iPhone-keyword detection ranking.

If you'd like to contribute on any of the WIP platforms, the structure is in place — PRs welcome.
