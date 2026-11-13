# Bugs

Everything that plays wrong: what Josh (or anyone) reports from play, and what a review of transcripts finds. Ideas, wishes and design questions go elsewhere (`docs/ideas.md`, `docs/dialogue-ideas.md`, the plan docs). Started 2026-11-13, when a review of two days' transcripts turned up a dozen bugs and no place to put them (Josh: "how do we track bugs - most off these are not \"ideas\"").

**How to use it**
- One entry per bug, numbered B1, B2… and never renumbered. Josh's words quoted exactly, with the conversation id (the first 8 characters) and the date, or nothing.
- Status is one of: **open**; **fix on main** (commit, prompt version); **fix live** (after `npm run release`; check `git merge-base --is-ancestor <commit> origin/live`, not progress.md); **confirmed** (seen fixed in play, with the conversation id). A bug is closed only when confirmed; one that shows up again after a fix goes back to open with the new example.
- A fix's commit names the bug (`B4`). Fix globally, for every kind of conversation and both countries.
- Conversation ids are in the private archive: `node scripts/archive-conversations.mjs --since=<day>` writes `~/fuori-archive/`.

## Open

### B1. Turns with no English and no offered answers (Beginner)
Josh, 2026-11-13: "I did not get a help bubble." / "No tengo burbujas de ayuda. Puede ayudarme?" (Josué 8814eb6f); "there is no translation in your bubble", "there is no bubble to read, so I will say…" (Isidro d335b204); "just a note that your bubble has no English" (Don Chucho 499b9774); "that was a lot of Spanish with no English" (Carmen 09978a29).
Two things: (a) 8 of 100 character turns on the 11-12i version had no offered answers mid-visit (three in a row with Josué); (b) the opener is all Spanish, its English only as intro subtitles, so a learner who missed them has none. Probably the same as the screen list's "Don Chucho's bubbles absent" (progress.md, 2026-11-12, 015d2607). **Status: open.**

### B2. "¿Lo ve?" (the Notice question) in nearly every visit
Josh, 2026-11-13: "In this game, everyone likes to say, lo veo, lo ve." (Vale ba340097); "La ve, the question everyone likes to ask." (Carmen 09978a29); "Y la ve es la más popular pregunta." (Isidro d335b204); "It is right in front of my face." (Don Chucho 499b9774).
17 of 100 character turns on 11-12i; 5 in Isidro's visit, 4 in Josué's. Its rule (scaffolding.md 12f) says weight 1 and never twice running; across visits it still reads as every character's habit. **Status: open.**

### B3. The visit doesn't end when the learner wants to go
Josh, 2026-11-13, Isidro d335b204 (24 replies): "A bit of a strange question and a long conversation." / "I must see the dentist." / "Don Insidro, we must stop." / "Don Insidro, I must insist we stop." Josué 8814eb6f (20 replies): "Es mucho, mucho, mucho parlano."
After a goodbye turn, any reply that isn't a goodbye reopens the visit, and the character follows a leave-taking with a new question or a Notice. **Status: open.**

### B4. Repeats within a visit (on the version that should stop them)
Josh, 2026-11-13: "Don Insidro, ¿usted me preguntó esto antes?" (Isidro asked about the altars three times, d335b204). Earlier: Raymundo's back door three times, "Mire" every turn (45764841, 2026-11-12).
ed467dd (character.md 12b, "no repeats within a visit") was already live for d335b204. **Status: open (fix live, not working).**

### B5. Double goodbye
The character says goodbye, the learner says goodbye, the character says it again: every 11-12i Beginner visit that ended on a goodbye (e.g. 2008220a, 35f9fa93, 09978a29). ed467dd ("the goodbye left to the learner") was live for all of them. **Status: open (fix live, not working).**

### B6. Strange or ignored questions: the character doesn't take up what the learner said
Josh, 2026-11-13: "Hey, that is a strange question." (Raymundo asked if he likes walking the callejones, which he did last visit; 2008220a); "Are you not interested in the Fontana de los Cimbales?" (Don Chucho skipped Josh's walk to point at his brush; 499b9774).
Same family as dialogue-ideas.md "The character asks and carries on, as if answered" (character.md 12a, "take up what they just said", live). **Status: open.**

### B7. Too fast, too much Spanish at Beginner step 1
Josh, 2026-11-13: "mucho mucho inglés por favor" (Raymundo 2008220a); "puede hablar más despacio?", "¿hablo più inglés?" (Ofelia 71dc1d3b); "Perdón, puede hablar más despacio, por favor?" (Josué 8814eb6f). See B1(b). **Status: open.**

### B8. A misheard word taken as the learner's name, and remembered
Josh, 2026-11-13: "Don Isidro, could I explain to you that you misheard my name? My name is Joshua, not Kieran." Whisper turned "Quiero ver los altares" into "Kiran Velos Altera" (6159f8cb, 2026-11-12); Isidro took it as a name and opened the next visit with "don Kiran" (d335b204). **Status: open.**

### B9. Wrong facts from memory
Vale opened with "¿cómo está Silvia?" (the daughter is Sofía), then took Silvia as Josh's name (ba340097, 2026-11-13). Not raised by Josh; Josh corrected it in play ("Mi nombre es no Silvia", "Mi hija se llama Sofia"). **Status: open.**

### B10. The learner addressed in the feminine
Ofelia: "güerita", "mi reina", "qué gusto verla", "aquí la espero" to Josh (71dc1d3b, 2026-11-13). Not raised by Josh. **Status: open.**

### B11. Asked for help in English, answered only in the language (Intermediate)
Josh, 2026-11-13: "Excuse me, Elena. I don't speak Italian perfectly… What do I want to see before?" Elena answered in Italian only (252960a4). CLAUDE.md: a character helps in English when asked. Nunzio did it right the same morning (67edfe03). **Status: open.**

### B12. The character's bubble stays on screen too long
Josh, 2026-11-13, in play: "el personaje bubble está en la pantalla demasiado largo" (Ofelia 71dc1d3b). Which bubble and when, to ask. **Status: open (screen).**

### B13. Intermediate doesn't back off when the learner says it's hard
Josh, 2026-11-13, after play: "Intermediate didn't back off." In play: to Elena, "Excuse me, Elena. I don't speak Italian perfectly. It's a bit difficult for me." She reassured him in Italian and went on at the same length (252960a4; see B11). To Nunzio, "Mi piace parlare con lei… ma io non posso capire tutto. Forse un più facile parole"; Nunzio said "Va bene, Joshua, parlo più semplice" and kept it simple for two turns, then went back to new words ("corteccia", "scendono") until Josh ended with "questa conversazione è un po difficile… posso parlare con una topica più facile che i giardini" (67edfe03). The Beginner side of the same thing works: see "kept" below. Carried with dialogue-ideas.md's "Long replies in open-ended talk (Intermediate)". **Status: open.**

### B23. The intro is long and passive
Josh, 2026-11-13, after play: "The intro is not quite the right thing. Long. Passive." Today's 16 openers (both countries, both levels) run 80–109 words, six or seven sentences, the character describing what it's doing or the place's history before one choice question; the learner only listens (e.g. Ofelia 109 words, 71dc1d3b; Marisol on the heads in cages, f464791e). Two visits today were left during the intro with no reply (Fernanda 49bc093b, Marisol 4e0fb0f5). Josh, 2026-11-13: "I'd cut the intro as it is now and just start as before in the charracters conversation" (docs/mix.md). **Status: open; the fix is to cut it, not built.**

### Carried from progress.md's screen list (2026-11-12)
- **B14.** "The city didn't show" (Valenciana, Don Isidro's place). Which screen, asked. **Open.**
- **B15.** Doña Chuy's portrait is stereotypical; redraw. **Open.**
- **B16.** Speech-to-text mishears ("Arlante", "Criar por favor", "Como hache"; 2026-11-13: "Las Perrae Reyes", "¿Qué color es TNN?"). Giving Whisper the offered answers was dropped (Josh: Whisper mishears in noise but doesn't misunderstand). **Open.**

### Carried from dialogue-ideas.md's index (2026-11-12; details there)
- **B17.** A character who steps away comes back. Not checked.
- **B18.** "Stay within your job" turns away a question about the town. Not checked.
- **B19.** A correction for something the learner said right. Collecting examples.
- **B20.** "Say this" adds things the learner didn't say. Not checked.
- **B21.** A voice that seems to change mid-line. Not checked.

## Kept: what play says works

Not bugs; recorded so a fix doesn't undo them.
- **The dialogue is improving** (Josh, 2026-11-13, after play).
- **A Beginner character asked for more English adapts.** Josh, 2026-11-13: "Some character adapted to use more English." Ofelia, asked "¿hablo più inglés?", answered "Sure, mi reina, I'll use more English" and did (71dc1d3b); Carmen, told "that was a lot of Spanish with no English", said "I'll go slower" (09978a29).

## Closed

### B22. The receipt gate (Giulia, Bar Alba, Palermo)
Giulia sent Josh to a cash desk that wasn't there for about ten turns; he left without the brioche (d3fb15b8, 2026-11-12 00:02 UTC; dialogue-ideas.md has the entry). Fix: the cassa sentence removed from five bar characters' here lines (4d765c3, live). **Confirmed** 2026-11-13: Giulia served the brioche with no cassa (73415dce).
