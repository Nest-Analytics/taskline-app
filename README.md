# Star Dash

A Vite + React browser game, ready for cloud deployment.

## Local Run

```bash
npm install
npm run dev
```

The dev server binds to `0.0.0.0` and uses:
- `PORT` if provided
- otherwise `VITE_PORT`
- otherwise `5173`

## Port Guide

- Local development uses `npm run dev`, which typically runs on `5173`.
- Production/server mode uses `npm start`, which reads `PORT`.
- On the VM workflow, the app is forced to run on `8080`.

Example VM/production command:
```bash
PORT=8080 npm start
```

## Production

```bash
npm run build
PORT=8080 npm start
```

`npm start` serves the built `dist/` app and binds to `process.env.PORT` (default `8080`), which works for Azure Web App, GCP, and AWS setups that inject a port.

For Azure ZIP deploys on Linux, set:
- startup command: `bash startup.sh`
- app setting: `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- runtime stack: Node 20 LTS or newer

For Azure Windows App Service, keep `web.config` at the app root.

## App Env Variables

Set these in your Web App environment settings:
- `APP_ENV=production`
- `APP_TITLE=Velo-learn Cloud Demo`
- `APP_THEME_DEFAULT=corp`
- `APP_SHOW_ENV_BADGE=true`
- `APP_ENABLE_THEME_SWITCHER=true`
- `APP_BRAND_TAGLINE=Arcade challenge game`

Runtime behavior:
- `APP_TITLE` updates browser tab title and app heading.
- `APP_ENV` shows as environment badge in the UI.
- `APP_THEME_DEFAULT` sets startup theme.
- `APP_SHOW_ENV_BADGE` shows/hides environment badge.
- `APP_ENABLE_THEME_SWITCHER` enables/disables theme buttons.
- `APP_BRAND_TAGLINE` replaces the header tagline.

Allowed values:
- `APP_THEME_DEFAULT`: `corp`, `school`, `stem` (fallback: `corp`)
- `APP_SHOW_ENV_BADGE`: `true` or `false` (fallback: `true`)
- `APP_ENABLE_THEME_SWITCHER`: `true` or `false` (fallback: `true`)
- `APP_ENV`: any text, e.g. `production`, `staging`, `dev`
- `APP_TITLE`: any text
- `APP_BRAND_TAGLINE`: any text

Local/dev fallback (optional):
- `VITE_APP_TITLE`
- `VITE_APP_ENV`
- `VITE_APP_THEME_DEFAULT`
- `VITE_APP_SHOW_ENV_BADGE`
- `VITE_APP_ENABLE_THEME_SWITCHER`
- `VITE_APP_BRAND_TAGLINE`

## Cloud Deploy Presets

Deployment starter files are in:
- `deploy/azure`
- `deploy/gcp`
- `deploy/aws`

## Controls

- Move: mouse/touch/trackpad, `ArrowLeft`/`ArrowRight`, or `A`/`D`
- Session controls: `Pause`, `Resume`, `Restart`, `Special Pulse`

Collect blue stars for points, avoid red bombs, and survive until time runs out.

Green power-up orbs grant a temporary shield that blocks bomb damage.

Scoring:
- Stars build a combo.
- Higher combo increases score multiplier.
- Bomb hits or combo timeout reset combo.
- Power-ups also add bonus points.
- Gold stars grant extra points.

## Product Features

- Level progression and dynamic difficulty scaling during runs.
- Win/loss session outcomes with pause overlay.
- Pause/resume/restart controls.
- Combo multiplier scoring and live combo HUD.
- Best score tracking in-game.
- Boss wave encounter every 4 levels (defeat target before timer expires).
- Special Pulse ability with cooldown.
- Multiple power-up types: Shield, Freeze, and Rush.
- Top runs leaderboard and recent run history.
