# Turn notes and thicker characters: notes from 2026-11-16

Josh, after a morning's play and talk: "can you catch these notes in a doc and I will comeback to it after more play". Nothing here is decided except where it says so. His words are quoted as written.

## What started it

Josh: "the characters like to ask the question do you like some plain thing in the game that we don't normally ask someone if they like like do you like the square or do you like the church or do you like the flowers?"

His example, Don Anselmo in Mazatlán's Plazuela Machado (Beginner): "¿Qué le parece el kiosco?" with the answers "Es muy bonito, me gusta." / "¿Para qué sirve el kiosco?".

Josh's test of the difference: "the baseball 'do you like baseball' worked. The kiosk 'do you like the kiosk' didn't". Baseball is a thing people have a taste in, and it is Don Anselmo's own (his notes: "talks baseball with anyone"). The kiosk is an object a turn note made him point at.

## The goal Josh agreed to

The learner leaves the visit knowing one real thing about this place and able to say something about it. (Josh: "i like the goal statement".) It follows from the game's goal: learn the country, to discuss real things with real people.

## What a character is told, in four layers

1. **Who you are** (per character): name, age, job, city, three personality words, and the background (`here`).
2. **How to talk** (every character, every level): take turns, take up what they said, stay within the job, forgive mishearings, goodbye.
3. **Who you're talking to** (per learner): first meeting or met before, what's remembered, the level. For a Beginner: the rules for offered answers and each sentence written with its English.
4. **This turn's note** (changes every turn; `lib/beginner-2.ts` draws it, `scaffolding.md` holds the texts): opener; two answers (weight 3); comment (2); notice (1); two questions to ask (1); no answers (2, steps 3–6); idiom (one visit in three); goodbye (the 7th turn).

Layer 4 is the only layer that changes turn to turn, so it is where anything can be guaranteed to vary. Today it guarantees variety of form (question, comment, questions to ask, no answers). On subject it narrows more than it varies: "two answers" says "ask about what's here or what you're doing", and notice says "something they can see"; nothing ever turns the talk to the character's life, the learner, food or the past.

## How notice got here

- 11-11, Josh: "no variation. It's like Dora the Explorer" (every question "this or that?").
- 11-12: notice added as a new kind of question (from his bids notes, "notice or do"): point at something and ask whether they see it.
- 11-12: it repeated ("¿Los ve?"); patched to "not shown yet", made rarer.
- 11-13, Josh: "everyone likes to say, lo veo, lo ve"; patched to "what they make of it, which they like, what they think it's for", once a visit.
- 11-16: that patch is "do you like the kiosk".

Three patches, each curing one repeated line and starting the next. Other notes at this layer did the same (the goodbye ten turns running; "is there anything you'd like to know").

## Josh's question, and Claude's read

Josh: "the dialogue does mostly wwork - all the things leading up to here have value - but I wonder today if we are either delivering the wrong source material or phrasing - or has been the pattern - over constrainnig cluade".

Claude's read, in order of weight:
- **Over-constraining**, most: the character copies a note nearly word for word; the line that worked came from a turn where no note chose the subject.
- **Source material**, real: freed to pick his own subject, Don Anselmo chose shrimp both times; he has two things that are his.
- **Phrasing**, least: three phrasings gave three versions of the same problem.
- The two connect: the notes may have grown to make up for thin backgrounds.

## The looks run today (`tests/experiments/notice-look.mts`; a first reply at five or six sights, both countries, two runs each)

| Notice wording | "Do you like / what do you think of" the plain thing | Says something about it |
|---|---|---|
| Original (live): "ask them something about it: what they make of it, which they like, what they think it's for" | 10 of 10 | 3 of 10 |
| 2026-11-16a (on main, not released): "tell them one thing about it that someone from here would know; then ask what follows" | 4 of 10 | 10 of 10, some invented ("de la época de los barcos de plata") |
| Tried, not put in: "bring up something you care about or know from here … and ask them about it" | 3 of 12 | thinner; 7 of 12 asked about something worth liking (shrimp, marigolds, live music, Lucio Dalla) |

Josh on all three wordings: "these seem off bases too". Each is a stage direction about what to say.

## Ideas, and where each stands

**Dropped (Josh: "when i think about all that scripting of facts it feels wrong")**
- A hand-written list of things to notice per place.
- Giving the character its picture's description to point at (Josh: "pictures are static").
- A calendar of what happens each month per country (Josh: "every character is in the same city").
- A line per character per month (818 characters; the fact-checking is the cost). Josh liked the quality ("the month had some qoodd qualitites if it didn't get echoed by city but by person/place") but not the scripting.

**Open, for after more play**
- **Notes keep the form, lose the subject.** The code still draws a form each turn. "Two answers" becomes "End on a question, and give them two short answers they could say back"; notice is removed and its share goes to the others. Proposed; not built.
- **Keep the turn constraint.** Josh: "losing the turns constraint might be a real loss". The code picking the form each turn and the 7th-turn goodbye both stay. (Claude had floated the character choosing its own form from a standing paragraph, with a one-line fact about its recent turns; set aside.)
- **Tell the character the visit is short.** Josh: "you could tell the prompt it has less than 8 turns". Once: "A visit is short: fewer than eight turns of yours"; each turn, as a fact, which turn it is. Could give the visit a shape and a natural ending; unknown whether it paces well or says the count aloud. Not built.
- **Thicker characters.** Josh: "i wonder now if the characters are thick enough". Don Anselmo is three adjectives and two sentences of his own. A thicker one has family, a past, tastes, opinions, something on today (Claude's example: a widower; a daughter with a seafood stand; a grandson at shortstop; his boat the Doña Chuy, sold ten years ago; aguachile as hot as it comes; can't stand farmed shrimp; dominoes with his compadre; a game tonight). It is who he is, not lines to say; fiction about a person, so nothing to fact-check; drafted per character from job and city. Close to Josh, 11-13: return visits "less about job or weather, more about the culture or family". Not built.
- **Wikipedia in the background.** Josh: "it was wikipedia in a shrimp captains background". Most of Don Anselmo's `here` is the square's history. Trade characters are fine (the mezcal bar, the salumeria: things in their hands); the plaque kind is mostly people at sights and Mexico's newer cities, where real history went in on purpose (11-09). Nothing changed. (dialogue-ideas.md.)
- **A side-by-side look**, offered and not run: the same few visits played with a stand-in learner as today, with form-only notes, and with form-only notes plus a thicker background (and the short-visit line), on a page for Josh to read.

## What changed today

- `scaffolding.md` 2026-11-16a, both countries: the notice wording in the table's second row. On main on Josh's "ok - sounds like a good change"; not released, not walked, not heard. If the form-only notes go ahead, this is moot.
- Nothing else. No background, no other note, no code.

## What the same day's play showed (eight visits, Mazatlán and Guadalajara, steps 1 and 2; read 2026-11-16)

- **Notes copied word for word, again:** the Notice turn as "¿Qué le parece…?" in five of eight visits (bugs.md B2), and every visit closed on the Close note's three beats: enjoyed it, have to get back, next time I'll show you (B31).
- **The best visit was the thickest character.** Memo at the tejuino cart: the stone on his table ("¿Qué cree que es?", a guess with a right answer), his mother who ground corn on it, her saying "Madre sólo hay una", the tub where the masa ferments two days. A family, a past and something in his hands.
- **The thinnest was told so.** Andrés has one subject, the flames of the Man of Fire, on five of seven turns and on the last visit too; Josh told him he'd said almost all the same things last time (B39).
- **The turn constraint's cost:** the 7th-turn goodbye cut off a song Josh had just asked for (B40). A character that knew the visit was short might have played it sooner.
- **Ratings from the debug panel, the first:** five taps. Good: Lalo's "desde hace mucho, for a long time" turn. Bad: Lupita's turn 4, Chuy's turn 5. Bug: Chuy, "Repeats exclamation" and "Repetitive character" (B4).
- **Step 1's mixed sentences with a verb or adjective in Spanish** ("very bonito, pretty", "the children juegan, play there"): Claude listed them as a bug from the page; Josh: "This is actually nice on the ear - like practical vocab pointer". Kept (bugs.md).

## Rules or prompt: can one line give a thin character a life? (a look, 2026-11-16)

Josh, on Memo's mother and metate being made up in the visit, not written: "rules vs prompt". Tried (`tests/experiments/life-line-look.mts`): three thin characters (Don Anselmo; Don Lalo, Guadalajara's bolero; Don Chucho, Mexico City's bolero), an opener and five turns each at step 2 with a stand-in learner who takes the offered answers, three ways, one run each: as it is; with a standing line ("You have a whole life of your own: family, a past, tastes, opinions, something on today. Draw on it when it fits. What you say about the real place and its history stays to what you know."); and with the line and "no stories or explanations" taken out of the level text.

- **Turns that carry something of a life** (family, a feeling, an opinion, a past beyond years on the job), of 18 each: as it is 1; with the line 5; with the line and stories allowed 4. One run each, so the gap between the last two means nothing.
- **What came out:** Don Chucho, "My dad left it to me, he was a shoe shiner too… I still feel like he's watching me when I work in this chair"; Don Lalo, "My wife sewed it for me from an old shirt, and that's why I'm fond of it"; Don Anselmo, "the best shrimp are the ones you eat fresh off the boat… That's my opinion as a captain, and nobody takes it from me."
- **What didn't:** nothing like Memo's visit. The life came late (turns 4 and 5), usually after an offered answer asked for it ("Did your dad work here too?"). Don Anselmo never got to baseball or a family in any version, and opened on "Do you like the plaza?" in all three. Three of the invented lives were the same one: my father did this before me.
- **Reading:** the line helps a little and costs a sentence; alone it isn't the answer. What drew a life out of Memo was a turn that needed one (a saying needs someone who said it); what drew it out here was a question from the learner's side.
- Not put in any prompt.

## Are the learner's bubbles interesting enough? Josh's replies against the bubbles offered (2026-11-16)

Josh: "maybe the learner's bubbles aren't interesting enough"; then, to going through what he said when he ignored them, "yes - try to note also how often a bubble answered and added vs. just answered". All of Josh's Beginner visits since 2026-11-09 on his two learner records (Mexico and Italy): 49 visits, 463 replies, 421 of them on turns with bubbles. Each reply matched to that turn's bubbles by a script, then the "added" and "own words" replies sorted by hand (mishearings of a bubble counted as reading it). His lines stay in the private scratchpad; only counts and bubbles are here.

**What he did with the bubbles (421 replies)**
- Read a bubble as it was: about 70%.
- Read a bubble and added something real: about 13%.
- Read a bubble and added a note for us about the game ("your bubble has no English"): about 5%.
- Said something of his own: about 12%.
- By day it swings: 2026-11-13, 45 read / 30 added / 17 own; 2026-11-16, 46 read / 5 added / 5 own.

**What he added or said instead (the description of a bubble he'd want)**
- His name, 15 times, most often at the goodbye. No bubble offers it once the character hasn't asked.
- A question of his own, about 30: about the person (what time do you finish work; is your name from here; tell me about your life, next time), a why (why sell tickets if it's private), what a name means, where to get something.
- Something about himself, about 20: where he has lived or been, his family, what he's doing today, an opinion.
- "Both", or a third thing, 6 times, where the bubbles were either-or.
- Correcting what the character assumed about him, 4 times; telling the character it repeats itself or won't end, 14 times (mostly before 11-13c).

**The bubbles themselves: just answers, or answers and adds**

| Bubble shape | Nov 9–13: offered | taken, of those offered | Nov 15–16: offered | taken, of those offered |
|---|---|---|---|---|
| Just answers ("Sí, me gusta.") | 68% | 41% | 22% | 51% |
| Answers and adds a thought ("Sí, me gusta. Es muy bonita.") | 10% | 52% | 22% | 64% |
| Answers and asks back ("Son cafés. ¿Usted trabaja aquí desde hace mucho?") | 2% | 42% | 18% | 44% |
| A question only ("¿Qué es una flota?") | 18% | 33% | 36% | 31% |

Mean length 4.2 words, then 5.6. The change is scaffolding.md 2026-11-14c ("two answers that go somewhere") and the comment and questions-to-ask turns.

- **The bubbles are much richer than a week ago,** and he reads them more and adds less: on 11-16, nine replies in ten were a bubble as offered. Either they now say what he would have added, or reading is easier than adding; this can't tell which.
- **He takes "answers and adds" most, at both dates, and a question alone least.** A question-only bubble is now the most common kind offered (36%) and the least taken.
- **What no bubble does yet:** opens a subject about the person that the character hasn't raised; lets him say something about himself; offers "both".
- A correction: Claude told Josh that several of his best lines on 11-16 were his own words ("Do you do this every day?", "Why do you use a clay pot?", "I take my coffee black"). They were bubbles.
