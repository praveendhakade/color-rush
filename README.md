# Color Rush

Color Rush is an Android-first reaction game: tap the requested color before time runs out. The game includes three lives per run, score and combo progression, a one-time rewarded-revive offer, local best-score persistence, restart, and accessible labeled tiles. The interface supports rotation and resizable large-screen windows.

## Requirements

Node.js 22.13+ is recommended by the current React Native toolchain, npm, an Android device/emulator with Expo Go or a development build, and an Expo account for cloud builds.

## Install and develop

```sh
npm ci
npm start
npm run android
```

Use `npm run lint`, `npm run typecheck`, and `npm test` before opening a pull request. CI resolves the Expo public configuration and bundles the Android JavaScript app locally for build validation without starting a cloud EAS build.

## Android and EAS

The Android package identifier is configured once in `app.json`; update it there when a final identifier is available. Android API 36 is explicitly configured. Expo SDK 57 applies edge-to-edge by default, and the Android activity is generated as resizable. Confirm the generated build configuration before a release.

```sh
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile internal
npx eas-cli submit --platform android --profile closed
```

`preview` produces an installable APK. `production` produces an AAB. The `internal` and `closed` submission profiles target the corresponding Google Play testing tracks after an explicit release workflow. Production submission requires an Expo token and Google service-account configuration in EAS/CI; never commit credentials.

## GitHub Actions and release process

Use `dev` for active development and integration, and `main` for stable production-ready code. Create feature branches from `dev` and merge them back through PRs. When a change is ready for production, open a PR from `dev` to `main`.

CI runs lint, typecheck, unit tests, and Expo configuration validation on every push to `dev`, every PR targeting `main`, and every push to `main`. Obsolete CI runs for the same branch or PR are cancelled. Preview builds remain manual. The release workflow is also manual, uses the protected `production` environment, and requires an explicit `internal` or `closed` track selection; merging to `main` never submits to Google Play.

Each new run starts with three lives. Wrong selections and timeouts consume one life, reset the combo, and preserve score and level. At zero lives the player can end the run or use the single revive. `RewardedAdService` defines the future ad boundary; actual AdMob integration is deferred until its production SDK, consent, and privacy requirements are reviewed. Development builds simulate a verified reward for flow testing; production builds report ads unavailable and never grant a life.

Use feature branches from `dev`, open a PR, pass CI, merge to `dev`, and test a preview build on a real Android device. When ready, PR `dev` into `main`. Bump the semantic version and trigger a production internal-test release manually. For new personal Play developer accounts, complete the currently required closed test cohort and duration before requesting production access.

See [game architecture](docs/game-architecture.md) for the lives, timer, and rewarded-ad flow.

See the [closed-test release checklist](docs/google-play-closed-test.md), [store asset checklist](docs/store-assets.md), and [privacy review draft](docs/privacy.md). `EXPO_TOKEN` and `GOOGLE_SERVICE_ACCOUNT_JSON` belong in GitHub Actions secrets, not `.env` or source control.

## Privacy policy

The public policy is hosted with GitHub Pages at
`https://praveendhakade.github.io/color-rush/privacy-policy.html`. Push the
policy to `main` and run the **Deploy privacy policy** workflow after enabling
GitHub Pages for the repository. Keep the policy and Google Play Data safety
answers accurate whenever app data practices change.

## Troubleshooting

If npm reports an engine warning, use Node 22.13 or newer. If an EAS build fails, verify Expo project setup, Android credentials, and the target API in the generated build logs; do not print tokens or service account JSON in logs.
