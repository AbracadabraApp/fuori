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

## Current flow (canvas row 2, Italy shown)

**No Replay, Slower or "How do I say…?" buttons in onboarding** (Josh, 2026-10-15). The canvas mockups still show them.


0. **Choose a country.** Two picture cards with the language and a greeting in it (*Ciao!*, *¡Hola!*).
1. **Welcome: do you speak any Italian?** (agreed, Josh 2026-10-15) No name asked. She: *Ciao, che bello conoscerti! Parli un po' d'italiano?* (Hi, lovely to meet you! Do you speak any Italian?), Italian with English subtitles. Two buttons, the learned language on top, English underneath: **Non ancora!** / Not yet! and **Un po', ma voglio migliorare** / Some, but I want to improve. Mexico: *¡Hola, qué gusto conocerte! ¿Hablas algo de español?*; **¡Todavía no!** / **Un poco, pero quiero mejorar**. "Che bello conoscerti" avoids benvenuto/benvenuta with no name. The tap is the first level signal; later steps confirm it. Optional third button for confident speakers (*Sì, abbastanza bene*) not decided.
**Beginner path** ("Non ancora!"; agreed, Josh 2026-10-15): one screen. She: *Benissimo! Piano piano. Qui tutti ti aiutano.* (Great! Little by little. Everyone here will help you.), English subtitles. Button **Andiamo!** / Let's go! → the city list. Mexico: *¡Muy bien! Poco a poco. Aquí todos te ayudan.*; **¡Vamos!** / Let's go! No speaking on this path (Josh: no "say Ciao" try); the mic permission comes at the first conversation.

**Speaker path** ("Un po', ma voglio migliorare"); first screen agreed (Josh, 2026-10-15). Italian with English subtitles throughout. She:
> *Che bello che parli già un po' d'italiano! Allora, raccontami: cosa ti piace dell'Italia?* (How lovely that you already speak a little Italian! So, tell me: what do you like about Italy?)
> *Prova in italiano, ma va bene anche in inglese. Tocca il microfono, parla, e poi toccalo di nuovo.* (Try in Italian, but English is fine too. Tap the microphone, speak, then tap it again.)

The microphone button; the first tap brings up iOS's permission prompt. She explains the mic in role: the one exception to never mentioning the app. Mexico: *¡Qué padre que ya hables un poco de español! Entonces, cuéntame: ¿qué te gusta de México?* / *Intenta en español, pero en inglés también está bien. Toca el micrófono, habla, y luego tócalo otra vez.* Avoid gendered words with no name (benvenuto/a, bravo/a). Next, being worked out: a follow-up built on their answer, a little harder, then the send-off (**Andiamo!** → city list). Steps 2–5 below are the older draft.

2. **What brings you here?** Same your-turn layout. "Say what you hope to see and learn, and why you chose Italy. English is fine." (Replaced two coffee steps, Josh.)
3. **A question about what you said.** Your answer shown back; she asks a follow-up built on it, with two answers in Italian, underlined, no translation, to tap or say.
4. **Still comfortable?** "Keep going" / "That's enough for now" (or say it). More level steps can follow (answer in your own words; listen only).
5. **Send-off.** Her goodbye, one plain line on how people will talk to you, "Start exploring".

## Open

- Whether her line in step 3 also drops the English.
- Where the one-line AI note goes (proposed: under the country cards).
- The microphone permission prompt: proposed at step 1, first time she asks you to speak.
- The level steps after step 4, and how far the ladder goes in onboarding.
- Her name: none for now. The learner's name is not asked in onboarding either (Josh).
- The one-app name (Fuori or Afuera) where it appears in shared screens.
- Settings mockup: level (Beginner, Intermediate, Advanced), "More time to answer", About with the AI line.

## Build plan (Josh, 2026-10-15)

1. **Define the frontend flow:** the screens, in order, until Josh approves it.
2. **Define the engineering needs** from the approved flow.
3. **Implement.**

Each step starts when the one before is done; nothing is specified ahead of it.
