# Onboarding design (in progress)

Status (Josh, 2026-10-15): **"not great yet, getting better."** Working designs, not final. Mockups: the "Country choice: onboarding and settings" canvas in Josh's claude.ai artifacts (https://claude.ai/artifact/VAa17eWjDDcwnbyALZ45Fk). Pictures: `design/country-cards/`.

## Restated vision (Josh, voice conversation, written up 2026-10-15)

An attempt to give an overview of onboarding in Josh's words. It sits **on top of** the work below and in [language-levels-plan.md](language-levels-plan.md); nothing here replaces or deletes it. Art is already in progress by the laptop session (country cards and greeters in `design/country-cards/`). Josh: "this captures about 50% of it"; the exact step-by-step isn't settled.

**The flow as Josh describes it (Italy path; Mexico mirrors it):**
1. **Choose a country** (Italy or Mexico).
2. **A greeter welcomes you.** Possibly asks your name and uses it from then on. Josh's doubt: the name may be a distraction and not worth requiring, though it does introduce the microphone.
3. **First branch: "Do you speak any Italian, or are you just getting started?"** Spoken in Italian, with the transcript and an English translation under it, and two answer buttons, each with a light English translation. (Replaces an earlier idea, "Have you been to Italy before?", which was only a proxy for level.)
4. **Just getting started → beginner, no assessment needed.** A gentle introduction: short Italian, English translations, answers by button, easing toward the microphone.
5. **Some Italian → let them talk.** An open prompt (tell us about yourself, why you love Italy, what you're looking forward to seeing) so the system hears a real sample. On screen: "Try to answer in Italian, or just answer in English." This is where the level is judged.
6. **Overstated level → quiet fallback.** Someone who says they speak some Italian but clearly struggles is moved to a gentler level without being stranded. The self-report sets the starting path; their actual speech can move it in either direction.
7. **Land on the cities page with a level already set.**

**Ideas running through it:**
- **The onboarding is the assessment.** Level is judged all along, not by a test at the end. Letting people talk early may make a long multi-step onboarding unnecessary.
- **A progression of answering:** tap a button (with English) → button without translation → speak. Buttons and the microphone could both be offered at any point.
- **It teaches the format:** Fuori is spoken, and the microphone is how you play.
- **Three tiers: beginner, intermediate, advanced.** Each sets three things in the game, not just in onboarding: how complex the dialogue is, how fast it's spoken, and how much scaffolding the screen shows. Roughly:
  - **Beginner:** short sentences, English under the Italian, answer by button.
  - **Intermediate:** spoken Italian with the Italian transcript, answer by speaking.
  - **Advanced:** dialogue only, no transcript, answer by speaking.

**Where this differs from the current flow (to reconcile, not decided):**
- The current step 1 asks your name and keeps it; Josh now doubts the name step is worth requiring.
- The current first question is "What brings you here?"; Josh's restated version opens with "Do you speak any Italian, or are you just getting started?" and only asks the open question on the "some Italian" path.
- The current flow climbs the beginner ladder for everyone; the restated version sends self-declared beginners straight to beginner and saves assessment for the "some Italian" path.
- Advanced with no transcript at all is stronger than anything in the current Settings mockup.

**Contradictions and gaps to reconcile (2026-10-15).** Flagged only; nothing here is resolved.

- **The name step is already decided and built the opposite way.** The decided flow has the greeter ask your name and keep it for Magda and the app. Josh now questions whether to require it, so a shipped decision runs against the restated vision.
- **The tiers and the beginner ladder are written down twice.** [language-levels-plan.md](language-levels-plan.md) already has the three tiers and a ladder nearly as Josh described by voice (tap answers → Italian phrases on buttons → spoken line with transcript → optional step without transcript). The two docs describe the same ladder and should cross-reference each other; ideally one owns it.
- **The scaffolding depends on a fix that isn't in yet.** language-levels-plan.md records (2026-10-15) that the system doesn't adapt: the character prompt carries no level, so characters guess it from the learner's words, which isn't working. "Beginners get short sentences, advanced gets no transcript" only holds once the tier is put into the prompt on every turn. The restated vision assumes the outcome of that unfinished fix.
- **"Advanced = no transcript at all" has no home yet.** The Settings mockup offers Beginner / Intermediate / Advanced, but no tier removes the transcript. Settings and the person screen would need that state.
- **"No English until the character has finished speaking"** (commit 3d4b268) constrains the onboarding steps that show an English translation under the Italian: the translation can appear, but not before the line has been spoken.

## Objectives (Josh agreed, 2026-10-15)

1. Find the learner's level.
2. Show them how to talk in Fuori.
3. Make them feel welcome, and want to come back.

## Decisions so far

- **No sign-in** (docs/12-native-app.md decision 3). The phone registers silently.
- **One app, country chosen first**, from two pictures (`it.jpg`, `es-mx.jpg`), also shown in Settings to switch.
- **No city or face picker.** The woman in the picture you tap is your guide (`it-greeter.jpg`, `es-mx-greeter.jpg`). She exists only in onboarding: no name or character details decided, no home city, not in the world afterwards.
- **After onboarding** you land on the country's city list.
- **Her name for you:** she asks it and uses it; it's kept for Magda and the app. Other characters don't get it: they learn it only if you tell them.
- Lines are generated in her language from fixed beats; no hand-written script.

**Approved for now (Josh, 2026-10-15):** the country choice and the Settings screens (canvas row 1). Steps 1–5 below are being reworked in plain text first, then images.

### Ship first: country choice and Settings (Josh, 2026-10-15)

Build these two screens in the iPhone app now, ahead of the rest of onboarding. Canvas row 1 shows them; the pictures are `design/country-cards/it.jpg` and `es-mx.jpg`.

- **Country choice (first launch):** two picture cards, Italy and Mexico, each with its language and a greeting in it. Tapping one picks that country's server (the `FuoriServers` list) and goes straight to its city list until the rest of onboarding exists. Shown once; switching later is in Settings.
- **Settings:**
  - **Explore** (was "Where you're living", Josh 2026-10-16): the same two cards, picture only (no country name under it), the current one marked "You're here"; tapping the other switches country. Progress stays with each country (per-country tokens).
  - **Your Italian / Your Spanish:** Beginner, Intermediate, Advanced, with the one-line note under it. Ship it now, greyed out with "Coming soon" under it, and turn it on when the M3 tier changes how people talk (Josh: he's the only user).
  - **Subtitles:** the website's two settings, *Show Italian words* and *Show English translation* (the app's existing Subtitles and English toggles). Hands-free stays as it is.
  - **About:** the one AI line ("Everyone you meet in Fuori is played by an AI") and Privacy.
  - **Allow dialect:** shown as on the website, greyed out with "Coming soon" (Josh). It does nothing yet; the plan is dialect that grows with level (docs/02-game-design.md).
  - **Removed:** the "Conversation / More time to answer" row from the mockup (Josh).
- Country names, language names and greetings come from `/v1/content`, not Swift.
- **Every website setting carries over to the app;** none is dropped when building the app (Josh). One that doesn't work yet shows greyed out with "Coming soon".
- **All of Settings on one screen:** every toggle and its checkmark visible at the default text size, with no scrolling box inside the sheet (no scroll within a scroll). At large text sizes the whole sheet scrolls as one.


**Clickable walkthrough:** `design/onboarding/walkthrough.html` (open in a browser), both countries, both paths, as the app should look. It is the reference for the build; the canvas row is the earlier static version. Her picture is moved up per country so her face stays clear of the text.

**Timing** (Josh, 2026-10-16): her line types out as she speaks; the English, the answer buttons, the mic and Andiamo appear only when she has finished. With Reduce Motion they appear with the full line, after her voice ends. While the learner is talking the controls stay put.

**Answer buttons** (Josh, 2026-10-16): light olive glass with black text and dark olive English, over her picture and set a little apart from her white line. White text on green glass was hard to read over bright parts of the picture (Josh). In the app this is iOS 26's own Liquid Glass with a light olive tint (`.glassEffect(.regular.tint(...).interactive())`), not a hand-made effect; the walkthrough imitates it with a blurred pale-olive gradient. Check text contrast at least 4.5:1 over the darkest and brightest parts of each picture. Andiamo stays solid olive.

## Her poses (Josh agreed, 2026-10-16)

Four pictures of her per country, the original plus three edits that keep her, the background and the framing the same. The picture changes with a plain cut, no fade or zoom (Josh's pick from the test page). With Reduce Motion it's the same cut.

| Moment | Pose | Italy | Mexico |
|---|---|---|---|
| Screen 1, her welcome question | Welcome (original) | `it-greeter.jpg` (waving) | `es-mx-greeter.jpg` |
| While the learner talks (mic open) | Listening | `poses/it-listen.jpg` | `poses/es-mx-listen.jpg` |
| Her speaker question and follow-up | Talking | `poses/it-talk.jpg` | `poses/es-mx-talk.jpg` |
| Both send-offs (beginner and speaker) | Laughing, warm | `poses/it-laugh.jpg` | `poses/es-mx-laugh.jpg` |

Her face must stay clear of her line and the buttons at every text size: anchor the picture so her face sits in the top part of the screen, and check at AX5. All in `design/country-cards/`. Expressive poses are fine for her because her lines are fixed; characters in open conversation would need neutral ones (docs/ideas.md). Mexico's poses took three rounds: the first moved her bag to the other shoulder, the second barely changed her (Josh: "not much variation"); the third asks for bigger movements (hair tucked behind her ear, an open-palm gesture, a hand over her laugh) and names where the bag stays.

## Current flow (canvas row 2, Italy shown; redrawn 2026-10-16 to this text)

**She always speaks the learned language; English is only ever subtitles, never spoken** (Josh). App text (the mic label, buttons' English lines) is separate.

**No Replay, Slower or "How do I say…?" buttons in onboarding** (Josh, 2026-10-15).


0. **Choose a country.** Two picture cards with the language and a greeting in it (*Ciao!*, *¡Hola!*).
1. **Welcome: do you speak any Italian?** (agreed, Josh 2026-10-15) No name asked. She: *Ciao, che bello conoscerti! Parli un po' d'italiano?* (Hi, lovely to meet you! Do you speak any Italian?), Italian with English subtitles. Two buttons, the learned language on top, English underneath: **Non ancora!** / Not yet! and **Sì, ma voglio migliorare** / Yes, but I want to improve (no "un po'": it fits both the modest and the B2 speaker). Mexico: *¡Hola, qué gusto conocerte! ¿Hablas algo de español?*; **¡Todavía no!** / **Sí, pero quiero mejorar**. "Che bello conoscerti" avoids benvenuto/benvenuta with no name. The tap is the first level signal; later steps confirm it. No third button for confident speakers: what they say sets the level, so it would add a choice without changing the outcome (decided 2026-10-15).
**Beginner path** ("Non ancora!"; agreed, Josh 2026-10-15): one screen. She: *Benissimo! Piano piano. Se hai bisogno di aiuto, chiedi pure: qui tutti ti aiutano.* (Great! Little by little. If you need help, just ask: everyone here will help you.), English subtitles. Button **Andiamo!** / Let's go! → the city list. Mexico: *¡Muy bien! Poco a poco. Si necesitas ayuda, nada más pregunta: aquí todos te ayudan.*; **¡Vamos!** / Let's go! No speaking on this path (Josh: no "say Ciao" try); the mic permission comes at the first conversation.

**Speaker path** ("Sì, ma voglio migliorare"); first screen agreed (Josh, 2026-10-15). Italian with English subtitles throughout. She:
> *Che bello che parli già italiano! Allora, raccontami: cosa ti piace dell'Italia?* (How lovely that you already speak a little Italian! So, tell me: what do you like about Italy?)
> *Prova in italiano, ma va bene anche in inglese. Tocca il microfono, parla, e poi toccalo di nuovo.* (Try in Italian, but English is fine too. Tap the microphone, speak, then tap it again.)

The microphone button; the first tap brings up iOS's permission prompt. She explains the mic in role: the one exception to never mentioning the app. Mexico: *¡Qué padre que ya hables español! Entonces, cuéntame: ¿qué te gusta de México?* / *Intenta en español, pero en inglés también está bien. Toca el micrófono, habla, y luego tócalo otra vez.* Avoid gendered words with no name (benvenuto/a, bravo/a). Then (agreed, Josh 2026-10-15):
- **Under the microphone, during onboarding only:** a label **Answer in Italian or English** (app text in English; language name from the country's data). With it, her screen-2 line drops "ma va bene anche in inglese" and is, as Josh wrote it: *Che bello che parli già italiano! Allora, raccontami: cosa ti piace dell'Italia? Tocca il microfono per parlare.* Mexico: *¡Qué padre que ya hables español! Entonces, cuéntame: ¿qué te gusta de México? Toca el micrófono para hablar.* "Tap again when done" is taught by the button, which shows **Press when done** while they talk (Josh, 2026-10-16).
- **Follow-up screen:** she reacts to their answer and asks one slightly harder question built on it (example *Ah, il cibo! Hai ragione. È la tua prima volta in Italia?*), ending on the question, since people answer the last thing they hear (Josh): no spoken mic reminder, the label covers it. **Italian only, no English**, since this is the best level signal; the English appears only if they stay silent or say they're lost.
- **Send-off:** she responds to what they said, encourages them on, and says explicitly that they can always ask for help: *Se hai bisogno di aiuto, chiedi pure a chiunque.* (If you need help, just ask anyone.) Mexico: *Si necesitas ayuda, nada más pregunta.* The send-off always shows the English subtitles, whatever the level (Josh), so the help message is never missed. **Andiamo!** → the city list.
- **Placement:** mostly English in their answers → beginner (same settings as the beginner path; her send-off pitched to match). Mostly Italian → the level judge reads both answers and sets intermediate or advanced. What they said decides, not the button: people often overstate their level because they know a few words (Josh).
Steps 2–5 below are the older draft.

2. **What brings you here?** Same your-turn layout. "Say what you hope to see and learn, and why you chose Italy. English is fine." (Replaced two coffee steps, Josh.)
3. **A question about what you said.** Your answer shown back; she asks a follow-up built on it, with two answers in Italian, underlined, no translation, to tap or say.
4. **Still comfortable?** "Keep going" / "That's enough for now" (or say it). More level steps can follow (answer in your own words; listen only).
5. **Send-off.** Her goodbye, one plain line on how people will talk to you, "Start exploring".

**The AI note lives in Settings → About only, not in onboarding** (Josh, 2026-10-15).

## Name and address (proposed 2026-10-21)

**Why now:** characters didn't know whether the learner is a woman or a man and defaulted to the masculine (Dario to Teresa: *benvenuto*, *sei tornato*, *un uomo che sa quello che vuole*; Josh's Italian teacher noticed it too). Told, they get it right every time (docs/prompt-trials.md → Learner gender). The name was left out of onboarding because you never meet her again (2026-10-15); now it has a job: it leads into how you want to be addressed, which every character uses (Josh, 2026-10-21: "now it trips a setting").

**Where:** right after the first tap (*Non ancora!* or *Sì, ma voglio migliorare*), before the paths split.

| Step | Italy | Mexico | English under it |
|---|---|---|---|
| Name (mic) | *Come ti chiami? Tocca il microfono e dimmi il tuo nome.* | *¿Cómo te llamas? Toca el micrófono y dime tu nombre.* | What's your name? Tap the microphone and tell me your name. |
| Address (Josh, 2026-10-22: the first wording was too subtle; say it plainly) | *Piacere, {name}! In italiano le parole cambiano con il genere. Ti dico «benvenuta» o «benvenuto»?* | *¡Mucho gusto, {name}! En español las palabras cambian según el género. ¿Te digo «bienvenida» o «bienvenido»?* | Nice to meet you, {name}! In Italian, words change with gender. Should I say benvenuta (female) or benvenuto (male) to you? |
| Buttons | **Benvenuta!** · **Benvenuto!** | **¡Bienvenida!** · **¡Bienvenido!** | female · male |
| After the tap | *Benvenuta, {name}!* / *Benvenuto, {name}!* | *¡Bienvenida, {name}!* / *¡Bienvenido, {name}!* | Welcome, {name}! |

- Fixed lines with the name filled in: no Claude call, no wait. Her line shows the name as Whisper heard it; tapping the mic again lets them say it again. The buttons save the address either way.
- **Stored:** `learners.addressed_as` (`f` / `m`) for every character (character.md `{person}`); the name only in `learners.onboarding`, for her. Characters still learn the name when you tell them.
- **Learners who were already playing** don't see onboarding (2026-10-17), so Settings gets the same choice: one row, the two words from content.
- Later, only if real conversations still show mistakes: the name, the voice's pitch and their own corrections as signals for learners who never chose.

**Build:** content lines in both `onboarding.ts`; the migration (`addressed_as` plus where it came from), which needs Josh; `POST /v1/onboarding/address` `{ addressedAs, name }`; `/v1/me` reports it; `LEARNER_ADDRESS=on` once migrated; a route test and `smoke:live`; then the iOS step in `OnboardingModel` / `OnboardingView` and the Settings row, checked on Josh's iPhone in both countries.

## Proposal: set up, then an optional tour; the panel as the place to explain (Josh, 2026-10-22; not decided)

- **The explanation panel** (the paper panel from [reply-panel.md](reply-panel.md)) becomes the standard place the game explains itself: the first time you meet the reply bubbles, the Learn link, the station, an offer to take a training wheel off, the flashcards. Short, how it works, **Next**. Learners learn the pattern: when the paper panel rises, the game is explaining, not the character speaking.
- **An orientation, character-led:** Josh: "we may need an option to give users a full orientation of how the game works; this might be more of a character-driven tour… a reworking of onboarding that is less language-immersive, more a set-up to play." The greeter (her poses already exist) walks you through picking a place, how talking works, Learn, how people remember you, travel; mostly in English; skippable at first launch and replayable from Settings ("How Fuori works").
- **So onboarding splits in two:** set-up (country, microphone, name, level; short, partly in the target language, as now) and the tour (optional, English, the greeter).
- **The game's rules don't apply to onboarding** (Josh, 2026-10-23: "Don't apply rules to onboarding"). The immersion rules (Italian only, English only when asked, never spoken English, no AI notes) are for conversations in the world; onboarding and the orientation tour can explain in English and talk about the app. This also overrides "She always speaks the learned language" above for the tour. Draft: [orientation-script.md](orientation-script.md).
- **Still open:** a recurring explanation panel during play is in the game, not onboarding, so CLAUDE.md's "no AI notes in the game" rule still needs Josh's call before anyone builds it.

## Open

- Later version (Josh, 2026-10-16): animate her with video loops. For now she changes pose instead (see "Her poses").

- For gameplay, not onboarding (Josh): teaching how to ask for help (*Può ripetere, per favore?*), e.g. a character offering it in role when the learner is lost.

- The microphone permission prompt: proposed at step 1, first time she asks you to speak.
- The level steps after step 4, and how far the ladder goes in onboarding.
- **Placement rests on too little (Josh, 2026-10-18: "the test should probably be more than 1").** Today one sentence in the language decides it: Josh's Mexico learner was placed intermediate because someone else spoke answer 2. Two ways to give it more: more questions in onboarding (longer before they play), or treat the onboarding level as a first guess and let the first few conversations confirm or move it (the design's own "the onboarding is the assessment… judged all along", and the learner-level item in the roadmap). Being tested, see `docs/test-ideas.md`.
- Her name: none for now. The learner's name: proposed again on 2026-10-21 to lead into how they want to be addressed (Name and address, above).
- The one-app name (Fuori or Afuera) where it appears in shared screens.

## Built (step 3, 2026-10-16/17)

Server and app built to the spec below; checked live in both countries (`smoke:live`) and in the simulator, not yet on Josh's iPhone.
- **Server:** her lines and voice in `content/<country>/onboarding.ts`; her prompt `content/<country>/prompts/onboarding.md`; `lib/onboarding.ts`; routes `/v1/onboarding/{follow-up,send-off,done,reset}`; `/v1/me` has `level` and `onboarded`; `/v1/content` has `onboarding`; `/v1/transcribe` mode `any`. `npm run test:onboarding` (both countries) runs the judge on fixed answers.
- **App:** `Onboarding/OnboardingModel.swift` and `OnboardingView.swift`; shown after the country loads while `/v1/me` says not onboarded; ends on the city list with English translation on for beginners, off otherwise. Settings → touch and hold Version → Restart onboarding clears the server's record too.
- **Differences from the spec:** her picture is placed by a `lift` per country (the walkthrough's 4% / 26%) rather than a focal point per pose; "Advanced: full speed" isn't applied yet (the app has one speed setting tied to English).
- **To watch:** with the language left open, Whisper labelled a one-word Italian "Buongiorno!" as Romanian (smoke test). Real answers are longer; if short ones go wrong, send the learned language as a hint.

## Engineering needs (step 2, drafted 2026-10-16)

From the agreed flow and the walkthrough (`design/onboarding/walkthrough.html`). Checked against the code on 2026-10-16. Josh answered the open points on 2026-10-16; this is the spec for step 3.

### What she says: fixed lines and two written by Claude
- **Fixed lines** (welcome question, both buttons, beginner send-off, speaker question, the help line, Andiamo) are the agreed text, so they are country content, not generated: `content/<country>/onboarding.ts`, each line with its English. Nothing Italian in Swift or prompt templates (CLAUDE.md).
- **Written by Claude**, through `lib/claude.ts`, reply `{ line, en }` like the characters:
  1. **Follow-up:** reacts to answer 1 and asks one slightly harder question that builds on it, ending on the question. Shown without English; its English appears only after a silent recording (decided, Josh 2026-10-16).
  2. **Send-off:** responds to answer 2, ends with the country's fixed help line. Shown with English.
- One short prompt, `content/it/prompts/onboarding.md` (version and changelog like `character.md`), language-neutral, with her voice: warm, simple, never gendered words for the learner (benvenuto/a, bravo/a…).

### Placement (the judge)
- Called once, after answer 2, with both answers. Returns `{ level: beginner | intermediate | advanced }` plus a one-line reason for the log. Rule from Josh: answers mostly in English → beginner; mostly in the language → the judge picks the level from what they said, so a few words don't place someone high. A judge call, not word lists (CLAUDE.md).
- The send-off is written in the same call, pitched to the level it picks, so the learner waits for one reply, not two.
- Beginner path: no Claude call; the level is set to beginner when they tap **Andiamo**.

### Server routes
- `POST /v1/onboarding/follow-up` `{ answer }` → `{ line, en }`.
- `POST /v1/onboarding/send-off` `{ answers: [a1, a2] }` → `{ line, en, level }`, and stores the level.
- `POST /v1/onboarding/done` `{ path: "beginner" }` → stores beginner. (Three routes, not one with a step field: Josh, 2026-10-16.)
- `GET /v1/me` adds `level` and `onboarded` (true once a level is stored), so the app knows whether to show onboarding.
- `GET /v1/content` adds an `onboarding` block: the fixed lines, her four pose image URLs with a focal point each (so her face stays clear of the text), and her voice.
- **Transcription:** `/v1/transcribe` always tells Whisper the learned language today (`mode` target or en). Onboarding answers can be English, so it needs a third mode with no language set, letting Whisper detect it; the detected language also helps the judge.
- **Voice:** a fixed ElevenLabs voice for her per country in `content/<country>/voices.ts` (`byCharacter.guide`).

### What's stored
- `learners.level` (text, null until placed) and `learners.onboarded_at`, added in `scripts/db-migrate.mjs`; run in production through `railway ssh` as before. Learners are per country (one sign-in per country's server), so the level is per country.
- `learners.onboarding` (jsonb): the two answers, the detected languages and the judge's level and reason, so placement can be checked and re-run. Not in `conversations`: visit counts, memory and the scorecard all read that table and would count her as a character.
- **Decided (Josh, 2026-10-16):** what they said (e.g. they love the food, it's their third visit) stays with onboarding; it doesn't reach characters or Magda. Characters learn it only if the learner tells them.

### Settings that follow the level
- Beginner: English translation on, slower speech. Intermediate: English off, normal. Advanced: English off, full speed (Josh: "no English and faster speech"). Set on the phone when onboarding ends, as the starting values; the learner can change them in Settings.
- The level control in Settings stays greyed out until the level is in the character prompt (roadmap 3); onboarding still stores the level now, so nothing is lost.

### The app (Swift)
- Shown after the country choice when `/v1/me` says not onboarded; ends on the city list. Every exit saves through the one leave function; leaving mid-way starts it again next time.
- One screen with steps, not a stack: welcome → beginner send-off, or speaker question → follow-up → send-off. The settings button top right as everywhere.
- Her picture: four poses from `/v1/content`, swapped with a plain cut, anchored by each pose's focal point; the welcome pose while she asks, listening while the mic is open, talking for her questions, laughing for send-offs.
- Her line types out in step with her voice (reuse the conversation's subtitles); the English, then the buttons, mic or Andiamo appear only when she has finished.
- Answer buttons: Liquid Glass with a light olive tint, the learned language on top, English under. Andiamo: solid olive.
- Mic: the conversation's tap-to-talk (tap, "Press when done"), always tap even with Hands-free on, with the label "Answer in <language> or English". The microphone permission prompt comes on the first tap.
- Silence: if a recording has no voice in it (the app's existing check), she doesn't move on; on the follow-up, that's when its English appears.
- Errors: a failed call shows the error code with Try again, never a silent skip.
- Settings → touch and hold Version → **Restart onboarding**, so Josh can test it. Built 2026-10-16: today it forgets the chosen country and goes back to the country choice, keeping each country's learner. When onboarding exists it must also clear the learner's `onboarded` state so she greets them again.
- **Decided (Josh, 2026-10-17, reversing 2026-10-16):** learners who were already playing don't see onboarding. Onboarded means finished it, or has conversations and no onboarding record; not "has a level". (On 2026-10-16 the plan was that existing learners see it once; on his iPhone it sent Josh, who had talked to people in both countries, to the greeter.) Restart onboarding leaves a `{ path: "reset" }` record so it still works for them.

### Checks before calling it done
- `smoke:live` gains the onboarding routes, Italy and Mexico.
- A judge test with fixed answers per country: all English → beginner; a few words → beginner; fluent, varied answers → advanced.
- The screen checks from CLAUDE.md (AX5, VoiceOver with her lines read in her language, 44 pt, Reduce Motion, a call and backgrounding mid-answer) on Josh's iPhone, both countries.

## Build plan (Josh, 2026-10-15)

1. **Define the frontend flow:** the screens, in order, until Josh approves it.
2. **Define the engineering needs** from the approved flow.
3. **Implement.**

Each step starts when the one before is done; nothing is specified ahead of it.
