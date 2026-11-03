# Onboarding: Giulia's welcome (Italy)

2026-11-02 · Script agreed with Josh · Not built. Mexico's version to follow (Josh: "then redo the path for Mexico").

Shown once, after the country choice. Giulia's regular portrait on the conversation screen, in the Beginner format: spoken English (heard, not shown), the Italian with its English, a question, answers to say back. Ends on the city list.

## 1 · Hello and your name
> *Ciao! Io sono Giulia.* (Hi! I'm Giulia.)
> *Come ti chiami?* (What's your name?)

Answers: *Mi chiamo …*

## 2 · Benvenuto or benvenuta
> *Piacere, {name}!* (Nice to meet you!)
> "One thing that matters in Italian: many words change between masculine and feminine, even 'welcome'. Should I say *benvenuto* or *benvenuta* to you?"

Answers: *Benvenuto* (masculine) / *Benvenuta* (feminine)

> *Benvenuta, {name}!* (or *Benvenuto*)
> *È la prima volta in Italia?* (Is this your first time in Italy?)

Answers: *Sì, è la prima volta.* / *No, non è la prima volta.*

## 3 · Her reaction, then your Italian
> If yes: "Then you've got so much ahead of you." *Che bello!* (How lovely!)
> If no: "So you know it a little already." *Bentornato!* / *Bentornata!* (Welcome back!, by their answer in 2)
>
> *Parli già italiano?* (Do you already speak Italian?)

Answers: *Non ancora.* (Not yet.) / *Sì, abbastanza bene.* (Yes, fairly well.)

## 4 · What Fuori is
> "In Fuori you can visit lots of cities and talk with interesting people: at the bar, the market, the piazza."
> *Ogni città è diversa.* (Every city is different.)
>
> "And whenever you need help, just ask in English or try your best in Italian. People are friendly."
> *Siamo molto simpatici!* (We're very friendly!)
>
> *Allora, dove andiamo?* (So, where shall we go?)

The mic doesn't open: the answer is a click (Josh, 2026-11-02). A button, *Andiamo!* (Let's go!; words from content), opens the city list.

## What the answers set
- Name. A misheard name is corrected the way you'd correct a person (*No, mi chiamo…*); it just works because Claude plays Giulia with this script as her brief, and the answers are read from the whole conversation when it ends, not one by one (Josh, 2026-11-02). A name Whisper can't transcribe stays wrong: accepted.
- Masculine or feminine (how characters address the learner). "Either is fine", non-binary or no clear answer → feminine (Josh, 2026-11-02); changeable in Settings.
- First time in Italy or not: into Giulia's memory of the learner.
- *Non ancora* → Beginner; *Sì, abbastanza bene* → Intermediate (Josh: Intermediate is more than OK, so "fairly well").

## Meeting her again (Josh, 2026-11-02)
Onboarding writes to her memory, so when the player later meets her in her city she recognises them (*Ah, {name}! Com'è andata?*). She is Rome's Giulia.

## Decided (Josh, 2026-11-02)
- **Mic refused:** if the player taps "Don't Allow", they can tap an answer bubble instead, and she says once that the mic can be turned on in Settings.
- **Shown once means finished:** it counts as shown only when the player reaches the last button. Leave partway and it starts again at the next launch.
- **Everyone goes through it once**, including players who already play (those who arrived during the skip have no name, gender or level). Settings' "start over" replays it.
- **Which Giulia:** Rome's (`giulia`, 32, barista, Bar Trastevere). **Changed (Josh, 2026-11-02): Luisa Cocco** (`luisa-cocco-nuova`, 39, barista at Roma nuova's morning bar) plays it, since Giulia lives in the original Rome, which players no longer see, so they could never meet her again. The script is the same with her name.

## Placement and the record (Josh, 2026-11-02: "make all your changes")
- **Placement by how they answer, not only what** (`lib/path.ts` → `placement`): *Non ancora* read back from the offered answer → the path's step 1; the same answer in their own words (anything more than the offered sentence) → step 3, since they're past saying back; *Sì, abbastanza bene* → Intermediate. Said back or own words is told apart in code, as the record does (`isSaidBack`). Stored as `startStep` in the learner's onboarding record.
- **Intermediate is a first guess the record corrects:** two hard conversations in a row at Intermediate (leaving without a word counts as hard) put them back on the path's last step.
- **Not in the record:** the onboarding conversation's prompt version starts with `onboarding`, so it isn't counted as a conversation on the path.

## Changed after play (Josh, 2026-11-02)
The welcome is a plain Beginner conversation, not a script: the character gets a short brief of goals (name; masculine or feminine, explained simply; first time in the country; how much of the language they speak; the cities and people, and asking for help in English or trying in the language) and says it her own way. The lines above are suggestions, not required wording. Two guards: the brief names the must-cover points, and if the reader at the end finds one missing she asks once more before the button. Why: forcing the exact script into the Beginner format made her repeat words, drop the English of a phrase, and copy the answer as its own English. It starts only after the country is chosen on the landing page.
