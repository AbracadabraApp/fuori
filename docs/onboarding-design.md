# Onboarding design (in progress)

Status (Josh, 2026-10-15): **"not great yet, getting better."** Working designs, not final. Mockups: the "Country choice: onboarding and settings" canvas in Josh's claude.ai artifacts (https://claude.ai/artifact/VAa17eWjDDcwnbyALZ45Fk). Pictures: `design/country-cards/`.

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

## Current flow (canvas row 2, Italy shown)

0. **Choose a country.** Two picture cards with the language and a greeting in it (*Ciao!*, *¡Hola!*).
1. **Welcome.** She greets you and asks your name. "Your turn" with Pause, and the helps used in the game: Replay, Slower, How do I say…?
2. **What brings you here?** Same your-turn layout. "Say what you hope to see and learn, and why you chose Italy. English is fine." (Replaced two coffee steps, Josh.)
3. **A question about what you said.** Your answer shown back; she asks a follow-up built on it, with two answers in Italian, underlined, no translation, to tap or say.
4. **Still comfortable?** "Keep going" / "That's enough for now" (or say it). More level steps can follow (answer in your own words; listen only).
5. **Send-off.** Her goodbye, one plain line on how people will talk to you, "Start exploring".

## Open

- Whether her line in step 3 also drops the English.
- Where the one-line AI note goes (proposed: under the country cards).
- The microphone permission prompt: proposed at step 1, first time she asks you to speak.
- The level steps after step 4, and how far the ladder goes in onboarding.
- Her name: none for now.
- The one-app name (Fuori or Afuera) where it appears in shared screens.
- Settings mockup: level (Beginner, Intermediate, Advanced), "More time to answer", About with the AI line.
