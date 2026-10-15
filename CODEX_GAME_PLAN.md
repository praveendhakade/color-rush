PROJECT: COLOR RUSH

OBJECTIVE

Build a polished, addictive, portrait-mode Android mobile game called Color Rush.

The game is a fast reaction game.

The player receives an instruction such as:

"TAP RED"

Several colored tiles appear.

The player must tap the tile matching the requested color.

Correct answers increase score and combo.

Wrong answers end the game.

The game progressively becomes faster and more difficult.

The project must be production-ready, testable, maintainable and deployable to Google Play.

TECH STACK

- React Native
- Expo
- TypeScript
- Expo Router
- EAS Build
- EAS Submit
- GitHub
- GitHub Actions
- Android
- Google Play Store

Use the latest stable versions compatible with one another.

Do not blindly downgrade dependencies to solve errors.

Before installing a dependency, determine whether it is actually necessary.

TARGET PLATFORM

Android first.

Portrait orientation.

Target Android API 36 or newer because this is a new Google Play app.

Keep architecture extensible for iOS later but do not spend time implementing iOS-specific functionality now.

APPLICATION ID

Use a placeholder package identifier:

com.example.colorrush

Make it easy to change later.

Do not hard-code the application ID throughout the project.

GAME PRINCIPLES

The game must:

- start quickly
- be understandable without a tutorial
- require one-thumb interaction
- respond immediately to taps
- progressively increase difficulty
- provide satisfying feedback
- work offline for core gameplay
- persist local high score
- avoid unnecessary loading screens

V1 FEATURES

Implement only:

1. Home screen
2. Play button
3. Game screen
4. Random target color
5. Random color tiles
6. Correct/incorrect detection
7. Score
8. Combo
9. Level
10. Increasing difficulty
11. Game over
12. Best score persistence
13. Restart
14. Home navigation
15. Basic animations
16. Basic sound/haptics abstraction
17. Unit tests for core game logic

Do NOT implement ads, accounts, online leaderboard, backend or analytics in the first gameplay milestone.

GAME STATES

Use an explicit game state:

idle
countdown
playing
paused
gameOver

Do not implement game state using a collection of unrelated boolean flags.

CORE TYPES

Create types/interfaces for:

ColorId
Tile
Difficulty
GameState
GameResult
GameConfig

Example:

type GameStatus =
  | "idle"
  | "countdown"
  | "playing"
  | "paused"
  | "gameOver";

A GameState should contain:

status
score
bestScore
combo
level
targetColor
tiles
timeRemaining

GAME COLORS

Create a central color configuration.

Initial colors:

red
blue
green
yellow
purple
orange

Do not scatter color definitions throughout components.

COLOR GENERATOR

Create ColorGenerator.

Responsibilities:

- choose target color
- generate tile colors
- guarantee that the target color exists
- avoid impossible rounds
- allow difficulty to control color count
- provide deterministic behavior when given a seeded/random provider for tests

DIFFICULTY MANAGER

Create DifficultyManager.

Difficulty must be configurable.

Difficulty should control:

- number of tiles
- number of available colors
- response time
- decoy frequency
- progression

Initial approximate progression:

Level 1:
4 tiles
4 colors
1500 ms

Level 2:
4 tiles
4 colors
1300 ms

Level 3:
6 tiles
4 colors
1200 ms

Level 5:
6 tiles
5 colors
1000 ms

Level 10:
9 tiles
6 colors
750 ms

Level 20:
12 tiles
6 colors
500 ms

Treat these as tuning defaults, not hard-coded game logic.

SCORE

Create ScoreManager.

Score should consider:

base score
speed bonus
combo multiplier
streak bonus

All scoring constants must be centralized in configuration.

COMBO

Correct answers increase combo.

Incorrect answer resets combo and ends the game in V1.

Display:

COMBO xN

when combo is active.

TIMING

Use safe timer management.

Timers must:

- stop on game over
- stop on unmount
- not create duplicate intervals
- not continue in background
- be cleaned up correctly

GAME ENGINE

Keep gameplay rules outside React UI components.

Create a GameEngine or equivalent domain layer responsible for:

startGame
generateRound
handleCorrectAnswer
handleWrongAnswer
advanceRound
calculateScore
increaseDifficulty
endGame
resetGame

React components should render state and send user actions to the game layer.

UI

Design should feel like a polished casual arcade game.

Use:

- large typography
- large touch targets
- rounded tiles
- strong contrast
- clean spacing
- portrait layout
- colorful but controlled visual style

Do not make it look like a default React Native demo.

SCREENS

Home:

COLOR RUSH
Best score
PLAY button

Game:

score
level
combo
target instruction
color grid
optional timer/progress indicator

Game Over:

GAME OVER
score
best score
combo
PLAY AGAIN
HOME

ANIMATION

Add lightweight animations:

correct tile:
scale up/down

score:
brief scale/fade

wrong answer:
small shake

combo:
brief emphasis animation

level change:
short level indicator

Animations must not delay gameplay.

HAPTICS

Create a haptics abstraction.

Correct:
light feedback

Combo:
medium feedback

Wrong:
strong feedback

Haptics must be configurable and disabled gracefully when unavailable.

AUDIO

Create a sound abstraction.

Sounds:

tap
correct
wrong
combo
levelup
gameover

Do not make gameplay depend on audio assets being present.

Allow sound to be disabled.

PERSISTENCE

Persist:

bestScore
gamesPlayed
highestCombo
soundEnabled
hapticsEnabled

Use a simple local persistence mechanism.

Do not add a backend.

TESTING

Create unit tests for:

ColorGenerator
DifficultyManager
ScoreManager
GameEngine

Test:

- target always exists
- invalid taps are rejected
- correct tap increments score
- wrong tap ends game
- combo increments
- combo resets
- difficulty increases
- timers don't affect pure game logic
- high score updates correctly

Create component tests for critical gameplay UI.

CI must run:

lint
typecheck
tests

CODE QUALITY

Use strict TypeScript.

Avoid any unless absolutely unavoidable.

Use ESLint.

Use Prettier.

Keep functions small.

Keep game rules deterministic where practical.

Do not put business/game logic directly into JSX.

Do not create giant components.

Do not add unnecessary state libraries.

Do not over-engineer V1.

ACCESSIBILITY

Use accessible labels for important buttons.

Touch targets should be comfortably large.

Ensure sufficient contrast.

Do not rely only on color where a semantic label is available.

PERFORMANCE

Avoid unnecessary re-renders.

Use stable callbacks.

Avoid recreating expensive data on every render.

Clean up timers and animations.

Test on a real Android device.

PHASE 2

Only after V1 gameplay is stable, implement:

- Stroop/deception mode
- better animations
- sound assets
- haptics
- theme system
- settings screen
- statistics screen
- daily challenge architecture

PHASE 3

Implement monetization and growth:

- analytics abstraction
- ad abstraction
- rewarded ads
- carefully controlled interstitial ads
- share score
- generated share card
- deep link support if appropriate

Do not interrupt gameplay unnecessarily with ads.

Do not add tracking that is not required.

PHASE 4

Implement online features:

- global leaderboard
- daily challenge
- challenge-a-friend
- anti-cheat considerations

Keep online services behind interfaces so the core game works without network access.

PHASE 5

POLISH

Add:

- onboarding only if testing shows it is needed
- polished transitions
- better sound design
- additional game modes
- unlockable themes
- improved score feedback
- empty/error/offline states

Do not add features solely because they are technically interesting.

GITHUB

Create a Git repository.

Recommended branches:

main
develop
feature/*

main represents production-ready code.

develop represents active development.

Every feature should be developed on a feature branch.

CI should run on pull requests and pushes to main/develop.

CI workflow:

checkout
setup Node
npm ci
lint
typecheck
tests

Do not publish to Google Play automatically on every main push.

VERSIONING

Use semantic versions:

MAJOR.MINOR.PATCH

Android versionCode must increase for every Play Store submission.

Automate version management where safe.

EAS

Configure:

development
preview
production

Development:
local development

Preview:
installable Android APK for testers

Production:
signed Android App Bundle (.aab)

Create eas.json.

Production build must generate an AAB suitable for Google Play.

GOOGLE PLAY

Prepare project for:

Google Play internal testing
Google Play closed testing
Google Play production

Use EAS Submit for automated submission.

Do not commit Google service-account credentials.

Use environment secrets.

Expected CI secrets may include:

EXPO_TOKEN
GOOGLE_SERVICE_ACCOUNT_JSON

Use GitHub Actions secrets/environment variables.

Never print secrets in logs.

CI/CD

Create:

.github/workflows/ci.yml
.github/workflows/preview.yml
.github/workflows/release.yml

CI:

on pull request
on push to main/develop

Run:

npm ci
lint
typecheck
tests

Preview:

manual trigger or develop push.

Create EAS preview Android build.

Release:

manual workflow_dispatch and/or Git tag.

Create production EAS Android build.

Submit to Google Play using EAS Submit.

Do NOT automatically promote to production until explicitly configured.

Prefer:

release tag
→ production build
→ Play internal/closed testing track

Then production promotion can be a separate deliberate step.

SECRETS

Never commit:

.keystore
*.jks
*.p12
Google service account JSON
Expo tokens
API keys
.env files containing secrets

Provide .env.example.

README must explain required secrets without exposing values.

RELEASE PROCESS

Recommended:

1. develop feature
2. PR
3. CI
4. merge
5. preview build
6. manual QA
7. version bump
8. create release tag
9. production EAS build
10. submit to Google Play internal/closed testing
11. testers test
12. fix issues
13. submit production release when eligible

GOOGLE PLAY TESTING

For new personal developer accounts subject to Google's current requirements:

- internal testing can be used for early QA
- closed testing must have at least 12 opted-in testers
- testers must remain opted in continuously for at least 14 days
- then apply for production access

Do not assume production access is automatic.

STORE ASSETS

Create a docs/store-assets.md containing a checklist for:

app name
short description
full description
icon
feature graphic
phone screenshots
privacy policy
content rating
target audience
data safety
category
contact information

Do not invent legal/privacy claims.

PRIVACY

Before adding analytics or ads, document what data each SDK collects.

Create:

docs/privacy.md

as a draft requiring review.

Do not claim compliance with laws or Play policies without verification.

PLAY STORE TARGET API

Configure Android target API 36 or newer for this new app.

Verify the actual generated build configuration before release.

DOCUMENTATION

README must contain:

project overview
requirements
installation
development commands
testing
lint
typecheck
EAS setup
Android build commands
preview build
production build
submission
GitHub Actions setup
required secrets
release process
troubleshooting

DEFINITION OF DONE FOR V1

V1 is complete only when:

- app launches
- home screen works
- game starts
- target color is generated
- target tile always exists
- correct taps work
- wrong taps end the game
- score works
- combo works
- difficulty increases
- game over works
- restart works
- best score persists
- timers clean up
- no obvious crashes
- TypeScript passes
- ESLint passes
- tests pass
- Android preview build succeeds
- app runs on a real Android device
- README is updated

IMPORTANT DEVELOPMENT BEHAVIOR

Work incrementally.

Before modifying files, inspect the existing project.

Do not overwrite working configuration blindly.

If the repository is empty, initialize the Expo project.

After each logical phase:

1. run tests
2. run TypeScript
3. run lint
4. inspect failures
5. fix them
6. summarize what changed

Do not claim a build works without actually running the relevant command.

Do not claim Play Store publishing is complete unless the submission actually succeeded.

If a step requires human credentials or Google Play Console interaction, stop and clearly identify the exact manual action required.

Never expose secrets.

Start by creating the project structure and implementing V1 only.