# State machines

Every part of Fuori that moves through states: what the states are, what moves it, who writes it, what must hold, how it's tested, and what's known to be wrong. Read this before changing any of them; update it in the same commit when you do.

Made 2026-11-15 from a review of the whole app (two agents read the iPhone app and the server; Josh: "Find all the state machines in the app. make the best decision that will evaluate all 3: ux, dev x, agent x always without breaking anything"). The decision: map them and fix what reaches a player, each fix with a test; no rewrite into a formal state-machine library (the conversation screen and the turn code are the most played code; a rewrite would break things).

**Words that mean more than one thing:** "step" is the Beginner step 1–6 (`learners.step`), the old path's step 1–5 (`conversation_records.state`), a lesson's step id, and the welcome's step; "stage" is the old Beginner's S1–S4 and the scaffold's read/choose. When writing about them, say which.

## Server

### 1. Level and Beginner step: the level up
- **State:** `learners.level` (null, beginner, intermediate, advanced); `learners.step` 1–6, `step_since`, `level_up_asked_at` (lib/level-up.ts).
- **Moves:** after 3 counted conversations (3+ learner replies each, since `step_since` or the last "Not yet") the app's offer; "yes" goes up a step, at step 6 to Intermediate, at Intermediate to Advanced (`moveFrom`, `offerDue`, `answerLevelUp`); "Not yet" sets `level_up_asked_at`. Josh's stepper: `setStep`. Settings: `/v1/me/level` → `changeLevel`.
- **Must hold:** the level is written after onboarding only by `setLevel` (lib/onboarding.ts), which restarts the count; a "yes" moves only when an offer is due (a double tap moves once); nobody is moved down by a score (Josh, 2026-11-15: "we arent ready for downlevelling yet"); onboarding sets the starting step (`finishOnboarding` → `startingStep`: 3 for a speaker judged Beginner, else 1).
- **Tests:** test:level-up, test:level-move, test:level-writers, test:no-downlevel, test:starting-step.
- **Known:** the count includes lessons, Magda and the welcome (Josh, 2026-11-15: skip for now); `isDue` (used only by test:level-up) still says no offer at step 6; the old Beginner (x-fuori-beginner: 1) counts but is never offered.

### 2. The old path and its records
- **State:** `conversation_records.state` (PathState: step 1–5, window, runs), `step`, `stage`, `moved`; placement `onboarding.startStep`, `placedAt` (lib/path.ts, lib/conversation-record.ts).
- **Moves:** `decide` at a conversation's end, only for versions with a `+S` tag (the old Beginner); frozen for the new Beginner. At Intermediate, `felt` and the hard run are still recorded but move nobody (2026-11-15).
- **Read by:** `pathState` on every Beginner turn (take-turn), only to tell Beginner from not; the step the new Beginner plays is `learners.step`.
- **Tests:** test:path. `recordConversation` and `pathState` untested.
- **Known:** idle-swept conversations (lib/sweep.ts) get memory but no record.

### 3. The Beginner turn's setup
- **State:** none stored; derived each request from the number of character turns, the step's cluster and a seed (`pickSetup`, lib/beginner-2.ts).
- **Moves:** turn 0 the opener (or, at a step with no answers, the step's own turn: fixed 2026-11-15, step 6 failed to open); turn 7 the goodbye; turn 8 on the close (take-turn ends the visit); between, a weighted draw with rules (no three in a row, no invitation after an invitation, Notice once a visit). About one visit in three an idiom replaces turn 3 (lib/idioms.ts). After the learner asks for help, every later turn carries the Help asked note (`hard` on a saved character turn).
- **Must hold:** every step can open a visit.
- **Tests:** test:beginner-2, test:idioms, test:help-asked.
- **Known:** the draw's chain doesn't know the idiom replaced turn 3.

### 4. A conversation's life
- **State:** `conversations` columns: `started_at`, `prompt_version` (opening only), `turns`, `ended_at`, `memory_turns`, `memory_at_start`; an in-memory save queue (`saveLater`, `savesDone`, lib/recording.ts).
- **Moves:** each turn appends (and reopens an ended conversation); the app's end → `markConversationEnded`, memory written once per new stretch (`claimForMemory`), the record written or rewritten (`recordAction`).
- **Known:** the server never refuses a turn after `done`; `claimForMemory` and `recordConversation` untested.

### 5. Onboarding and the welcome
- **State:** `learners.onboarding` (welcomed, path, startStep, placedAt), `onboarded_at`; the welcome's step derived from the learner's line count (lib/welcome.ts).
- **Moves:** the welcome's button (`finishWelcome`), the speaker path's send-off, Settings → Restart onboarding (`resetOnboarding`).
- **Tests:** test:welcome, test:onboarding, test:starting-step.

### 6. Lessons and culture stories
- **State:** the app sends the part and scene each turn; done is derived from saved conversation versions (`lessonsDone`).
- **Moves:** teach ends at 4 learner lines, practice at 3, review at 1; a culture story on its 3rd turn.
- **Known:** opening the review counts as done (Josh, 2026-11-15: keep it).

### 7. Others
- **Level check** (lib/learner-level.ts): off unless LEVEL_CHECK; through `setLevel`.
- **Hidden switches:** `x-fuori-beginner: 1` (old Beginner), `x-fuori-cluster` 2–6 (plays that step for the request; the level up counts the stored step).
- **A failed level read** fails the turn with a retryable error (2026-11-15), never a silent wrong level.
- **Magda's study file:** last write wins; two endings at once can drop one's notes.

## iPhone

### 1. A conversation turn (`ConversationModel.phase`)
- **States:** starting, speaking, listening, hearing, thinking, tapToTalk, choosing, micDenied, finished; with flags on top (`interrupted`, `awaitingQuestion`, `hearingLine`, `hearingAnswer`, `finishing`, `openingMic` and more).
- **Moves:** the opening reply → speaking → the voice ends → `openTurn` (listening, choosing, tapToTalk or finished); silence or a tap → thinking → the next reply; `interrupt()` on calls, Siri, route changes, sheets, backgrounding. Guard against stale work: `generation`, bumped by `interrupt`, the ending and `leave`.
- **Must hold:** the mic never reopens by itself after an interruption (CLAUDE.md); every exit saves through one leave, once (2026-11-15).
- **Tests:** CharacterBubbleTests (what the bubble shows, from the flags); nothing drives transitions.
- **Known (Josh, 2026-11-15: skip for now):** an interruption while thinking is lost (the reply is spoken and the mic reopens under a sheet); hear-it and the answer bubble's speaker reopen the mic after an interruption (they don't bump `generation`).

### 2. The app (`AppModel.phase`)
- **States:** choosingCountry, loading, onboarding, welcome, ready, failed, tooOld; Settings changes wait for the sheet to close (`pendingCountry`, `pendingRestart`).
- **Known:** no guard on `load()`: picking the other country before the first load finishes can leave the old country's content.

### 3. Lessons (`LessonFlow.Stage`): loading → part k → done or failed. Easy to follow.

### 4. Flashcards (flags: settled, listening, checking, held, openingMic; the schedule in UserDefaults)
- **Must hold:** a pause (call, Siri, backgrounding) keeps the mic closed until a tap or a new card (fixed 2026-11-15 for a tap during the word).
- **Tests:** FlashcardScheduleTests (the schedule only).

### 5. Onboarding (`OnboardingModel`): dead while `greeterTour` is false; if revived, `stop()` during thinking leaves it stuck.

### 6. Others
- **Level-up sheet:** shown when `AppModel.levelUp` is set after a save; swiping it away sends no answer.
- **Audio:** `Voice` (one finish, a watchdog), `Recorder`, `AudioSession` (stateless; every model activates and deactivates it globally: possibly racing when one lesson part hands over to the next).
- **Settings hidden panel:** a long press on Version.
