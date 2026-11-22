# Privacy draft — review required

Color Rush works offline. It stores player display names, built-in avatar IDs, individual score records and statistics, and game preferences only in application storage on the device. Existing installations migrate the saved best score and available aggregate statistics to a local “Player 1” profile. The app has no account system, analytics, advertising SDK, backend, or online leaderboard.

Local profiles and scores may be lost if the user clears application data or uninstalls the app. Backup and restore are not currently available.

Before release, review this document against the final app behavior and Google Play's current Data safety requirements. Do not make legal or policy-compliance claims from this draft.

Any future analytics, ads, or online feature must document its SDK, purpose, data collected, retention, sharing, and opt-out behavior here before integration.
