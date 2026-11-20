# Game architecture: lives and rewarded revive

`GameEngine` remains the source of truth for the run. Its explicit status covers idle, countdown, playing, paused, revive offer, and game over. Session state adds lives and revives used; neither value is persisted. New games receive `LIVES_CONFIG.initialLives` and zero revives.

An incorrect tile or expired round uses the same life-loss transition. Each round accepts one answer, then locks stale callbacks. A surviving mistake resets combo and generates a safe round at the current level while preserving score. At zero lives, the engine enters `reviveOffer` when the player is eligible. The timer is stopped while paused or offering a revive, and restarted with the generated round after a successful revive.

`RewardedAdService` is the UI-facing boundary. It reports availability and a result that distinguishes verified reward completion from cancellation, failure, and unavailable inventory. The app grants a life only for a reward result with a transaction ID, and `GameEngine.grantRevive()` independently checks eligibility and the one-revive limit. Duplicate callbacks cannot grant another life after the engine leaves `reviveOffer`.

No AdMob SDK is included in this milestone. `__DEV__` selects a development simulator that reports a reward for exercising the flow. Production builds select an unavailable implementation, so they cannot simulate or grant rewards. Integrating AdMob later requires a real SDK adapter and review of consent, data collection, and privacy disclosures before release.

The app persists best score, games played, and highest combo when a run ends, using the existing local settings store. Active lives and revive count reset on every new game.
