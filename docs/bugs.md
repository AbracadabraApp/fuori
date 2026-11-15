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
Two things: (a) 8 of 100 character turns on the 11-12i version had no offered answers mid-visit (three in a row with Josué); (b) the opener is all Spanish, its English only as intro subtitles, so a learner who missed them has none. Probably the same as the screen list's "Don Chucho's bubbles absent" (progress.md, 2026-11-12, 015d2607). **Status: fix live (checked 2026-11-14: origin/live ea5a4838) (scaffolding.md 13c): answers required when a turn asks for them (0 of 46 replayed turns empty, from 3 of 24); (b), the all-Spanish opener, is the intro cut (13b).**

### B2. "¿Lo ve?" (the Notice question) in nearly every visit
Josh, 2026-11-13: "In this game, everyone likes to say, lo veo, lo ve." (Vale ba340097); "La ve, the question everyone likes to ask." (Carmen 09978a29); "Y la ve es la más popular pregunta." (Isidro d335b204); "It is right in front of my face." (Don Chucho 499b9774).
17 of 100 character turns on 11-12i; 5 in Isidro's visit, 4 in Josué's. Its rule (scaffolding.md 12f) says weight 1 and never twice running; across visits it still reads as every character's habit. **Status: fix live (checked 2026-11-14: origin/live ea5a4838) (13c): Notice at most once a visit, and it asks about the thing (what they make of it, which they like), not whether they see it.**

### B3. The visit doesn't end when the learner wants to go
Josh, 2026-11-13, Isidro d335b204 (24 replies): "A bit of a strange question and a long conversation." / "I must see the dentist." / "Don Insidro, we must stop." / "Don Insidro, I must insist we stop." Josué 8814eb6f (20 replies): "Es mucho, mucho, mucho parlano."
After a goodbye turn, any reply that isn't a goodbye reopens the visit, and the character follows a leave-taking with a new question or a Notice. **Status: fix live (checked 2026-11-14: origin/live ea5a4838) (scaffolding.md 13c–13d, dialogue.md 13a), at every level: leaving in any words ends the visit (replayed: Beginner 10 of 10, Intermediate 6 of 6; ordinary turns 0 of 28); the character closes a visit itself on the 8th turn at Beginner (goodbye offered on the 7th) and the 15th at Intermediate (Josh: "lets keep 8 for begginer; 15 for intermediate"); answers required, so the goodbye turn always has some.**
Played 2026-11-14 night, live 11-14e: all eight Beginner visits (c7c75e92, dbcd73fe, 67077cd2, db79bb48, 9d52e83b, 656e523d, dce87c69, 6ee0e530) had the goodbye on the 7th reply and the character's own close on the 8th, each with something for next time from its own world ("next time try the tamal de bola", "Come back another day and I'll tell you about the candles", "Next time I'll show you how we grind the beans by hand"). **Seen fixed in play; Josh to confirm it feels right.**

### B4. Repeats within a visit (on the version that should stop them)
Josh, 2026-11-13: "Don Insidro, ¿usted me preguntó esto antes?" (Isidro asked about the altars three times, d335b204). Earlier: Raymundo's back door three times, "Mire" every turn (45764841, 2026-11-12).
ed467dd (character.md 12b, "no repeats within a visit") was already live for d335b204. **Status: open; mostly a symptom of B3 (Isidro ran out of material past the visit's end); recheck after 13c is played. The richer first turn (saved beats) should also help.**
Again on the live version, inside the visit's eight turns (2026-11-14, Totò, Palermo, f23f7b64, 11-14e): he asked about the panella on three turns running ("Lo vuole con una panella?", "Ne vuole una?", "Vuole una panella con il panino?"), after the learner had asked how it's made and been told. So not only a symptom of B3. **Still open.**
Also 2026-11-14 night: Mariano asked "¿Quiere entrar a ver?" and three turns later "¿Quiere entrar a la iglesia?", and offered the answer "¿Cuántas ramas lleva usted hoy?" on two turns running (dbcd73fe); Davide asked "Vuole sentire una canzone?" then "Vuoi sentire una canzone?" three turns later, the song never played (db79bb48).

### B5. Double goodbye
The character says goodbye, the learner says goodbye, the character says it again: every 11-12i Beginner visit that ended on a goodbye (e.g. 2008220a, 35f9fa93, 09978a29). ed467dd ("the goodbye left to the learner") was live for all of them. **Status: probably fine; the visits that ended went: the character winds down, the learner says goodbye, the character says it back (one each). Some wind-downs still sound like a farewell; Josh to judge by ear.**

### B6. Strange or ignored questions: the character doesn't take up what the learner said
Josh, 2026-11-13: "Hey, that is a strange question." (Raymundo asked if he likes walking the callejones, which he did last visit; 2008220a); "Are you not interested in the Fontana de los Cimbales?" (Don Chucho skipped Josh's walk to point at his brush; 499b9774).
Same family as dialogue-ideas.md "The character asks and carries on, as if answered" (character.md 12a, "take up what they just said", live). **Status: open.**

### B7. Too fast, too much Spanish at Beginner step 1
Josh, 2026-11-13: "mucho mucho inglés por favor" (Raymundo 2008220a); "puede hablar más despacio?", "¿hablo più inglés?" (Ofelia 71dc1d3b); "Perdón, puede hablar más despacio, por favor?" (Josué 8814eb6f). See B1(b). **Status: open.**

### B10. The learner addressed in the feminine
Ofelia: "güerita", "mi reina", "qué gusto verla", "aquí la espero" to Josh (71dc1d3b, 2026-11-13). Not raised by Josh. Cause (2026-11-14): not his address (set to "a man" on both his learners), but Ofelia's notes from 2026-10-24, written before addresses existed: "Her name is Joshua; she…", "Ofelia calls her güerita and mi reina", copied forward every visit; Nonno Ettore's said "Name is Giosue; a woman". **Status: fix live** (memory.md 2026-11-14a, b1e1ab33: notes say "they" and never note what the character calls them; live, checked 2026-11-14 against origin/live ea5a4838) **and the two characters' notes corrected in the database** (Josh, 2026-11-14: "just change in db"). Closes when a visit to Ofelia is played without it.

### B11. Asked for help in English, answered only in the language (Intermediate)
Josh, 2026-11-13: "Excuse me, Elena. I don't speak Italian perfectly… What do I want to see before?" Elena answered in Italian only (252960a4). CLAUDE.md: a character helps in English when asked. Nunzio did it right the same morning (67edfe03). **Status: watching, likely a one-off.** Josh, 2026-11-13: "intermediate does help in english when asked" (as CLAUDE.md says: it works in play without being in the prompt). The gap is B13: help that doesn't last.

### B12. The character's bubble stays on screen too long
Josh, 2026-11-13, in play: "el personaje bubble está en la pantalla demasiado largo" (Ofelia 71dc1d3b). Which bubble and when, to ask. Josh, 2026-11-14, what he meant: "when the reply is given, the reply bubbles disaappear. The revious character bubble hanges there until new dialogue arrives -- they should both go afteer reply". **Status: fix in the app** (059fc9f, D21: the character's bubble and the answers go when the reply is sent, at every level; in build 16, TestFlight, 2026-11-14). Closes when Josh sees it on the phone.

### B13. Intermediate doesn't back off when the learner says it's hard
Josh, 2026-11-13, after play: "Intermediate didn't back off." In play: to Elena, "Excuse me, Elena. I don't speak Italian perfectly. It's a bit difficult for me." She reassured him in Italian and went on at the same length (252960a4; see B11). To Nunzio, "Mi piace parlare con lei… ma io non posso capire tutto. Forse un più facile parole"; Nunzio said "Va bene, Joshua, parlo più semplice" and kept it simple for two turns, then went back to new words ("corteccia", "scendono") until Josh ended with "questa conversazione è un po difficile… posso parlare con una topica più facile che i giardini" (67edfe03). The Beginner side of the same thing works: see "kept" below. Carried with dialogue-ideas.md's "Long replies in open-ended talk (Intermediate)". **Status: fix live** (32c601f, D12: the reply's `hard` flag is saved and every later turn of the visit gets dialogue.md's Help asked note; Nunzio replayed: "quercia (oak)" 6 of 6, median 29 words against 39; live, checked 2026-11-14). Closes when a visit where Josh says it's hard stays easy to the end.
Played 2026-11-14 night: Nunzio (bbb5a0f5), asked on the second reply to speak more simply, kept to short sentences with a word of English where needed ("le foglie, le leaves", "spazio, space") through all 16 turns and closed with "La prossima volta ti faccio vedere le radici più vecchie"; Elena (5279b94e), asked to slow down, did ("Parlo piano. Domani mangiamo cose semplici. Il pane, le panelle (chickpea fritters)."). **Seen fixed in play; Josh to confirm.**

### B23. The intro is long and passive
Josh, 2026-11-13, after play: "The intro is not quite the right thing. Long. Passive." Today's 16 openers (both countries, both levels) run 80–109 words, six or seven sentences, the character describing what it's doing or the place's history before one choice question; the learner only listens (e.g. Ofelia 109 words, 71dc1d3b; Marisol on the heads in cages, f464791e). Two visits today were left during the intro with no reply (Fernanda 49bc093b, Marisol 4e0fb0f5). Josh, 2026-11-13: "I'd cut the intro as it is now and just start as before in the charracters conversation" (docs/mix.md). **Status: fix live (checked 2026-11-14: origin/live ea5a4838) (7162a0f): the intro cut at every level (Josh, 2026-11-13, on Intermediate too: "yes"); a visit opens on the character's first ordinary turn. Seen in the first visits after the release (eight Beginner visits, 2026-11-14 evening, all opening on an ordinary turn with two answers); Josh to confirm by ear.**

### B24. The character's closing questions are a few kinds, over and over (Beginner)
Josh, 2026-11-14, on the closing question of every character turn in five Mexico Beginner visits (Carmen 09978a29, Don Chucho 499b9774, Renata 35f9fa93, Vale ba340097, Isidro d335b204; all on 11-12i, before the 2026-11-13 release): "These questions in the game are very repetitive".
The 43 questions, tagged by what they ask (his ask: "be specific but use least number of tags"): **Do you want…?** 17 (to see something 12, to know or hear 3, other 2; "¿Quiere ver los detalles de cerca?"); **Do you see it?** 9 (B2); **A or B?** 6 (every visit's opener, and once more); **Do you like…?** 4; **What do you think of…?** 3; **Have you…?** 2; **What / which…?**, open, 2. So 35 of 43 can be answered sí or no, and "Do you want to see…" with "Do you see it?" is 21 of 43. By setup: the opener is always A or B, Notice is always "¿Lo ve?", and the two-answers turn is where "¿Quiere ver…?" comes from. 15 turns of 58 closed on no question (the questions-to-ask turns and goodbyes). **Status: open. Counted before 13b–13d went live (Notice once a visit and about the thing, the intro cut, visits closing on the 8th turn); recount on the first Mexico Beginner visits played on the live version before changing anything.**
The offered answers in the same five visits (2026-11-14): 27 of 55 pairs are yes and no, the yes an echo of the question; "No, no lo veo" was offered nine times and never said; "es muy bonito/bonita" is in 7 bubbles and "me gusta(n) mucho" in 6; quiero, veo, me gusta and prefiero do nearly all the work. Over ten days of Beginner play the yes/no share was a fifth to a quarter before 11-12i and a third on it, so part of this is that version, and most of it comes from sights, not shops. Counts, and the ideas that came from them, in [questions-and-bubbles.md](questions-and-bubbles.md).

Since then (2026-11-14, live): the pair rules (392587e: two answers that go somewhere, not a yes and a no), the comment turn (d18ac92), the help answer (eb48ab3). In the first eight Beginner visits after the release (seven of them short test runs, one real: Totò, f23f7b64) no pair is a yes and a no and there is no "¿Lo ve?". The questions are still yes or no ("Le piace il formaggio?", "Ne vuole una?", "Vuole una panella?"), and the pairs have a new sameness: B25. The new kinds of question (D8) are held until Josh has played.

### B25. The second answer is "what is X?" on nearly every turn (Beginner, live 11-14e)
Seen 2026-11-14 in the first visits after the release, not raised by Josh. Totò, Palermo (f23f7b64): all seven pairs are an answer and a question about a word: "Maritata, per favore." / "Che cos'è la schietta?"; "Una maritata, per favore." / "Cos'è la milza, esattamente?"; "Sì, mi piace molto il formaggio." / "Che cos'è il caciocavallo?"; "Sì, con una panella, grazie." / "Com'è fatta la panella?". The same in the test runs: "¿Cuánto cuesta una boleada?", "Che cos'è il cornetto?", and Don Chucho was offered "¿Qué es la grasa?" on two turns running, the first right after he had said what it is ("la grasa, the polish"), against the Answers block's "never about something already explained". Likely cause: two instructions that both ask for a question as the second answer ("an answer that asks you something back", and the help answer about a word given no English), so the rule against one pattern made another. **Status: open.** Recount once Josh has played more; a fix should take words out of the Answers block, not add a rule against "what is".
Recounted on the eight Beginner visits of 2026-11-14 night (56 pairs, goodbyes left out): 2 are a yes and a no; 51 have a question as one of the two answers; 10 of those are "what is X?" ("¿Qué es el atole?", "¿Qué es el chipilín?", "¿Qué es un coleto?", all Juana, a food stall); at sights the question answer is more varied ("¿Cuál santo cuida usted?", "¿Cómo es la finca de su familia?", "Quali altre statue parlanti ci sono a Venezia?"). So the pattern is narrower than the first visit suggested and strongest where the talk is about food. The character's own questions are still mostly yes or no ("¿Quiere…?", "Vuole…?", "Le piace…?"). The questions-to-ask turn did not come up once in 72 character turns (two answers 28, comment 13, notice 4, idiom 3; dialogue-plan.md D47).

### B26. The Learn page corrects lines the learner read from an offered answer, or that were misheard
Found 2026-11-14 by running the live Learn writer on four of Josh's Beginner visits (read-only): every page is full (2–3 fixes, 5–7 words, 3–4 verbs, a culture note), but about half the fixes are not the learner's mistakes. "No quiero ver más el mural" was the offered answer "No, quiero ver más el mural", and the page called it rude to a guide (Renata 35f9fa93); "Todavia no vale la pena" was the answer "Todavía no. ¿Vale la pena?" (Carmen 09978a29); "mejor me cuento aquí" was "me quedo" misheard (Isidro d335b204); "pinto" for "pintó" is a spelling the learner can't make in speech. Real ones on the same pages: "Come fate la panella?" → "Come fa…", "la más popular pregunta" → "la pregunta más popular". Same family as B19. The writer isn't given the answers that were offered. **Status: open** (dialogue-plan.md D51: at most one fix, never from a line that matches an offered answer).

### B27. An idiom turn used "gringo", about the learner
2026-11-14 night, Juana, San Cristóbal (c7c75e92): "Some people here would look at you and say gringo, American, but I just say come eat. ¿Qué cree que significa «gringo»?" with the answers "Es un extranjero de Estados Unidos." / "Es un tipo de tamal." Not raised by Josh. Two things: "gringo" is in the idiom store though it is a word, not a saying, and the character applied it to the learner, which assumes where they are from (CLAUDE.md: the game assumes nothing about where the learner is from). **Status: open.**

### B28. Reading an offered "what is…?" answer marks the learner as finding it hard
2026-11-14 night: Juana's turn after the offered answer "¿Qué es un coleto?" was saved `hard` (c7c75e92), and Davide's after the offered "Cosa significa 'O sole mio?" (db79bb48), so every later turn of those visits got the Help asked note (D12). After it Davide's turns went short and he repeated his question about the song. The help answer (D25) and help that lasts (D12) were built the same day; together, taking an answer the game itself offered counts as asking for help. **Status: open.**

### B29. A word glossed with itself, and a gloss dropped into the middle of an English sentence
Josh, 2026-11-14 night, to Giuseppe in Lecce (6ee0e530): "I also have to notice that you are repeating an Italian word with another Italian word." His line before it had "il rustico, the rustico" twice. The same night: "A coleto, person from San Cristóbal is someone born here" and "Chipilín, a small leafy herb is the green herb in your tamal" (c7c75e92): the piece and its English, put together by code (docs/mix.md), land in the subject of an English sentence and break it. **Status: open.**

### B30. A date in the notes stays "tomorrow"
2026-11-14 night, Elena, Palermo (5279b94e): she opened on the plan made on 2026-11-13 ("Domani alle nove e mezza ci vediamo davanti al Massimo, vero?"), which is the thread kept (dialogue-plan.md D2). But it was still "tomorrow" a day later, and when Josh asked why she hadn't come on Thursday she said they had only met in the workshop and "domani andiamo a Ballarò per la prima volta". The notes have no dates, so a plan for "tomorrow" never arrives. **Status: open.**

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

### B9. Wrong facts from memory
Vale opened with "¿cómo está Silvia?" (the daughter is Sofía), then took Silvia as Josh's name (ba340097, 2026-11-13). Not raised by Josh; Josh corrected it in play ("Mi nombre es no Silvia", "Mi hija se llama Sofia"). **Closed** by Josh, 2026-11-14, with no fix, as with B8: he corrected it in play and the memory takes corrections.

### B8. A misheard word taken as the learner's name, and remembered
Josh, 2026-11-13: "Don Isidro, could I explain to you that you misheard my name? My name is Joshua, not Kieran." Whisper turned "Quiero ver los altares" into "Kiran Velos Altera" (6159f8cb, 2026-11-12); Isidro took it as a name and opened the next visit with "don Kiran" (d335b204). **Closed** by Josh, 2026-11-14, with no fix: "Kiran was also self-corrected" (he corrected Isidro in play and the memory took the correction), and "I also give different characters different names for me", so a name one character holds isn't wrong for being different.

### B22. The receipt gate (Giulia, Bar Alba, Palermo)
Giulia sent Josh to a cash desk that wasn't there for about ten turns; he left without the brioche (d3fb15b8, 2026-11-12 00:02 UTC; dialogue-ideas.md has the entry). Fix: the cassa sentence removed from five bar characters' here lines (4d765c3, live). **Confirmed** 2026-11-13: Giulia served the brioche with no cassa (73415dce).
