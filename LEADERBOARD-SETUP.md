# Shared friends leaderboard

The game tracks maximum cash held automatically. The sidebar saves locally until a server is configured; it never claims a local score is shared.

GitHub Pages serves static files and cannot accept score writes. `leaderboard-worker.mjs` is a small Cloudflare Worker that saves the three friends' highest scores to `leaderboard.json` in this repository. Players need no accounts or passwords. The host needs a Cloudflare account and a fine-grained GitHub token restricted to this repository, with Contents read/write permission. Never put the token in game files or chat.

1. Deploy `leaderboard-worker.mjs` as a Cloudflare Worker.
2. Set its secret `GITHUB_TOKEN` to that repository-scoped token in the Cloudflare dashboard.
3. Set `PLAYER_NAMES` to the three allowed names, comma-separated; set `GAME_ORIGIN` to `https://gelatofreeze.github.io`.
4. Put the Worker's HTTPS URL into `leaderboard-config.js` and publish that file.
5. Open the published game, save a score, and verify `leaderboard.json` updates and another phone sees the result.

Names and scores are public. With no player authentication this is an honor-system board: anyone who knows a player's name can submit as that name. Client-side chip totals are also editable. This is not a verified competitive ranking. The service validates inputs, never lowers a best score, retries GitHub commit conflicts, and stores its GitHub credential only server-side. Only publish the endpoint to your friends; for stronger abuse protection use server-side rate limiting and player authentication.

Status: backend code prepared; not deployed or configured. Local score saving works without it.
