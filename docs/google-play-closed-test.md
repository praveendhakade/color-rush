# Google Play closed-test release checklist

This is an operational checklist, not legal or policy advice. Verify each item in Play Console immediately before the first closed-test submission.

## One-time Play Console setup

- [ ] Register the Google Play developer account and finish any required identity or payments verification.
- [ ] Create the Play Console app with the permanent package name `com.alphaprogaming24.colorrush`. This identifier cannot be changed after the app is created.
- [ ] Set the app type, category, contact email, and availability countries/regions.
- [ ] Complete the store-listing, content-rating, target-audience, app-content, and Data safety tasks using reviewed, final information.
- [ ] Publish a public privacy-policy URL if Play Console requires it for the app's declared behavior or audiences. Review [privacy.md](privacy.md) before making any claims.
- [ ] Create a closed testing track, add the intended tester list or Google Group, and add a feedback email or URL.
- [ ] Enable Google Play Android Developer API access, create a least-privilege service account, grant it the Play Console release permission, and save its JSON only as the GitHub `GOOGLE_SERVICE_ACCOUNT_JSON` secret.
- [ ] Add an Expo personal access token as the GitHub `EXPO_TOKEN` secret. Scope both secrets to the `production` GitHub environment and protect that environment with required reviewers.

## Build and test readiness

- [ ] Run `npm run lint`, `npm run typecheck`, and `npm test` successfully.
- [ ] Trigger **Build Android preview APK** in GitHub Actions and install the resulting APK on at least one real Android device.
- [ ] Verify portrait layout, touch targets, timing behavior, backgrounding, offline play, persistence, and restart/home flows on the device.
- [ ] Confirm the EAS production build resolves Android `targetSdkVersion` 36 or newer and produces an AAB.
- [ ] Increase the release version using semantic versioning. EAS remote version management increments Android version codes for production builds.

## Closed-test submission

- [ ] Ensure no outstanding Play Console release blocks a new submission.
- [ ] In GitHub Actions, run **Release Android to Google Play testing** and choose `closed`.
- [ ] Confirm the EAS submission and Play Console release are associated with the expected package, version code, and closed track.
- [ ] Share the Play opt-in URL and feedback channel with the tester cohort.

For personal developer accounts created after 13 November 2023, Google currently requires at least 12 testers continuously opted in for 14 days before production access can be requested. Internal testing supports up to 100 selected testers but does not replace that closed-test requirement.
