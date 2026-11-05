# Color Rush

Color Rush is a portrait Android-first reaction game: tap the requested color before time runs out. V1 is offline-first and includes scores, combos, level progression, local best-score persistence, restart, and accessible labeled tiles.

## Requirements

Node.js 22.13+ is recommended by the current React Native toolchain, npm, an Android device/emulator with Expo Go or a development build, and an Expo account for cloud builds.

## Install and develop

```sh
npm ci
npm start
npm run android
```

Use `npm run lint`, `npm run typecheck`, and `npm test` before opening a pull request.

## Android and EAS

The Android package identifier is configured once in `app.json` as `com.example.colorrush`; update it there when a final identifier is available. Portrait orientation and Android API 36 are explicitly configured there. Confirm the generated build configuration before a release.

```sh
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile internal
npx eas-cli submit --platform android --profile closed
```

`preview` produces an installable APK. `production` produces an AAB. The `internal` and `closed` submission profiles target the corresponding Google Play testing tracks after an explicit release workflow. Production submission requires an Expo token and Google service-account configuration in EAS/CI; never commit credentials.

## GitHub Actions and release process

CI runs lint, typecheck, and tests on pull requests and pushes to `main` or `develop`. Preview builds are manual. The release workflow is also manual, uses the protected `production` environment, and requires an explicit `internal` or `closed` track selection.

Use feature branches, open a PR, pass CI, merge to `develop`, test a preview build on a real Android device, then bump the semantic version and create a release tag before triggering a production internal-test release. For new personal Play developer accounts, complete the currently required closed test cohort and duration before requesting production access.

See the [closed-test release checklist](docs/google-play-closed-test.md), [store asset checklist](docs/store-assets.md), and [privacy review draft](docs/privacy.md). `EXPO_TOKEN` and `GOOGLE_SERVICE_ACCOUNT_JSON` belong in GitHub Actions secrets, not `.env` or source control.

## Privacy policy

The public policy is hosted with GitHub Pages at
`https://praveendhakade.github.io/color-rush/privacy-policy.html`. Push the
policy to `main` and run the **Deploy privacy policy** workflow after enabling
GitHub Pages for the repository. Keep the policy and Google Play Data safety
answers accurate whenever app data practices change.

## Troubleshooting

If npm reports an engine warning, use Node 22.13 or newer. If an EAS build fails, verify Expo project setup, Android credentials, and the target API in the generated build logs; do not print tokens or service account JSON in logs.
