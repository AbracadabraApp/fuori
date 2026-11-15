# Questions, comments and bubbles (draft)

**Status: a draft from a brainstorm with Josh, 2026-11-14. Nothing here is built, decided or in a prompt.** It is about how a Beginner character's turn ends and what the learner is offered to say back: the closing sentence and the two bubbles, treated as one design. It records what saved visits show, Josh's idea that a turn can end on a comment as well as a question, and a way to sort the kinds of question. (Until the evening of 2026-11-14 this file was `question-types.md` and held only the question kinds.)

The files this would eventually change, `docs/dialogue-structure-reference.md` (the terms table and the bid menu) and the Beginner prompt, belong to the dialogue session and change only through a card in `docs/prompt-trials.md` and a reviewed test. This file changes neither.

## Where it came from

Josh read the closing question of every character turn in five Mexico Beginner visits and said "These questions in the game are very repetitive" (`docs/bugs.md`, B24). Then: "I'm not really questioning the frequency- I know it's bad and fewer lo ve will bring more do you like. I'm interested in more question types". After the question kinds were sorted (below), he asked to look at "the bubbles proposed", and then: "Why always Q? A. Why not just talk - comment or Q."

## What the visits show

Two sets of saved visits, read from the private archive (`node scripts/archive-conversations.mjs --since=<day>`; the snapshots stay out of git). Every learner reply in them was spoken and is read here as its speech-to-text transcription; the bubbles cannot be tapped, and nothing records whether a reply was read from a bubble. So a learner's slip and a mishearing can't always be told apart, and the counts of replies are approximate.

**The five visits** (Carmen 09978a29, Don Chucho 499b9774, Renata 35f9fa93, Vale ba340097, Isidro d335b204; Mexico, Beginner, version 11-12i, before the 2026-11-13 release).

The closing questions are counted in B24: 43 questions, 35 answerable sí or no.

The bubbles: 55 character turns offered a pair.

| Pair | Count | Example |
|---|---|---|
| Yes / No | 27 | "Sí, quiero verlos." / "Hoy no, gracias." |
| This one / That one | 8 | "La plaza, me gusta la plaza." / "El patio, es más tranquilo." |
| Two questions to ask | 8 | "¿Cuántos años tiene el Palacio?" / "¿Qué pinta el mural de Diego Rivera?" |
| Two goodbyes | 5 | "Hasta luego, Vale." / "Adiós, gracias." |
| Two opinions | 3 | "Me gusta mucho el color." / "Es muy grande y bonito." |
| Yes / something else | 4 | "Sí, me gusta mucho." / "¿Qué hay en el cerro?" |

- The yes bubble echoes the question: "¿Quiere ver…?" gives "Sí, quiero ver…", "¿Lo ve?" gives "Sí, lo veo."
- The no bubble has three forms: putting it off ("No, mejor mañana", 5, all Isidro), declining for today ("Hoy no, gracias", 3), and not seeing it ("No lo veo. ¿Dónde?", 9, one for each "¿Lo ve?").
- The same filler recurs: "es muy bonito/bonita" in 7 bubbles, "me gusta(n) mucho" in 6. Four verbs do nearly all the work: quiero, veo, me gusta, prefiero.
- Almost no bubble is about the learner. The exceptions use memory ("Sí, la crema, como siempre"; "Silvia está bien", which was wrong: B9).
- No bubble asks for help ("No entiendo", "¿Otra vez, por favor?").
- The better ones: a pick with a reason ("El patio, es más tranquilo."), an answer that asks back ("Todavía no. ¿Vale la pena?"), the two questions to ask (the most varied Spanish in the set: cuándo, cuánto tiempo, por qué, dónde, quiénes), and an opinion that describes ("Hay muchas flores y veladoras.").

What the learner said (Josh, 56 replies): one of the offered answers and nothing else, 23; an offered answer plus something of his own, 21; only his own words, 12. What he added in those 33: things about himself, unasked, 8 (his name, his family, his plans); questions of his own, 7 (about the murals, what "Alameda" means, a restaurant, the character's life); notes on the game, 9; trying to leave, 4 (B3); both bubbles combined, 1. "¿Lo ve?" was answered seven times, with sí every time. When two questions to ask were offered he took one 6 times of 7. So he supplied the kinds of talk the characters never asked for: Biography twice in 43 questions against eight times volunteered, no Words question asked and one put by him.

**Ten days** (all 105 Beginner visits since 2026-11-04, both countries; pairs sorted roughly, by each bubble's first words; "¿Lo ve?" turns left out, at Josh's suggestion).

| Version played | Visits | Pairs | Yes / No | Yes / something else | Two different things | Questions to ask |
|---|---|---|---|---|---|---|
| Nov 3–10, the old Beginner | 59 | 232 | 32% | 8% | 51% | 0 |
| Nov 9–10 | 18 | 114 | 24% | 12% | 26% | 17% |
| Nov 11–12 | 14 | 66 | 21% | 15% | 30% | 23% |
| 11-12i (the five visits' version) | 12 | 83 | 33% | 23% | 19% | 16% |
| 11-13d, live | 2 | 6 | 0 | 5 of 6 | 0 | 1 of 6 |

The rest are goodbyes and a few yes-and-yes pairs.

- The five visits were the low point: yes/no was a fifth to a quarter of pairs on Nov 9–12, a third on 12i, and close to half there with "¿Lo ve?" counted.
- A place that sells something gives two real bubbles without trying ("Con chile, por favor." / "Sin chile, por favor."; "Pago con la carta." / "Pago in contanti."). The narrow pairs come from sights, where the character has nothing to hand over and offers to show things.
- The live version's six pairs (two Italian visits) pair every yes with a question or a different move, never with no ("Sì, grazie." / "Cosa sono gli anelletti?"). Too few to conclude from.
- In every version: "me gusta mucho" and "es muy bonito"; almost nothing about the learner; no Guess, Words, Help or Comprehension pair in the sampled lines (the 500 pairs are not tagged by category).

**Bubbles with a gap** ("Me llamo …"; 50 in the ten days). A gap was filled without trouble when the missing word was a name or a place, and mostly when it was a number. When it needed a word in the language ("Llevo … aquí", "Resto … giorni", "Voy a estar … días") the reply stopped at the gap or went elsewhere, though a pause cut off by the silence timer would look the same. Beside a whole bubble, the gap was passed over. About a quarter got no reply (some are visits that ended there). So a gap needs no instructions only when its word is one the learner already has: a name, a place, a number.

## What can be said about the bubbles

1. **Most are echo, not a line of dialogue** (Josh's own test for Beginner). The learner turns the character's sentence round and hands it back.
2. **The bubbles are the learner's whole Spanish.** What they offer is what a Beginner says aloud; in the five visits that was four verbs and two fillers, far less than the character's own lines.
3. **Often only one bubble is real.** "No, no lo veo" is never true; "No, gracias" to an offer to show something stops the scene.
4. **They react; they don't contribute.** Agree, decline, pick. Not a reason, something about oneself, a question, a change of direction; those are what the learner added himself.
5. **The place is missing from them.** The culture is in what the character says; the learner says "es muy bonito". The questions-to-ask turns are the exception.

A test for a pair, proposed and not adopted: both bubbles are things a person might really say there, and they lead to different places.

## Comment or question (Josh, 2026-11-14)

"Why always Q? A. Why not just talk - comment or Q." The character's turn ends on a comment or on a question; the learner's bubbles are things to say, usually one comment and one question.

- The closing question tells a Beginner what to say next, but the bubbles already do that.
- The turns that closed on no question were the best in the five visits (above).
- A comment and a question can't be opposites, so the yes/no pair goes away without a rule against it.
- A character who says something about themselves and stops draws out the same from the learner; that is Biography without an interview.
- The learner practises asking.
- The categories below then describe what a turn is about, whether it comes as a comment or a question. A guess or a favour still needs a question, so questions stay, on fewer turns.

Earlier forms of the same idea: Josh, 2026-11-04, "when the conversation is open ended like Lorenzo - no questions is fine" (`docs/dialogue-ideas.md`); "a statement can be a bid" in the bids model (`docs/dialogue-structure-reference.md` § 1a); "Left open" in the bid menu. Those allow a turn without a question; this makes it the usual turn.

## The last sentence, and the two bubbles (Josh, 2026-11-14)

On reading the five visits rewritten this way, Josh: "The thing that stands out uid the character question gets an echo. The comment is hard to reply without the English (maybe final sentence is echoed or at least shown in English".

So, as a proposal built on that:

- **Every turn ends on one short sentence the learner replies to**, a comment or a question, and that sentence always has its English.
- **One bubble uses its words.** The echo, on purpose: the easy one to say.
- **One bubble is new.** A question, or a thought of the learner's own: the stretch.

> Ahí enfrente, en el cerro. La Valenciana. **Yo trabajé en las minas cuarenta años.** *I worked in the mines for forty years.*
> "Cuarenta años es mucho." (its words) / "¿Le gustaba el trabajo?" (new)

An echo bubble is then fine as long as the other isn't one too. A question that offers its own two options ("¿dos años o veinte?") gives two echo bubbles, which is Josh's point about questions.

Not settled: how the English of the last sentence arrives, spoken after the Spanish as the mix does mid-line, or only shown under it once the character has finished. Josh on the explanation of this section: "It's not very clear to me"; the page below is the clearer form.

**The five visits rewritten by hand** (eight turns each; the character's facts from their files or the original visit; none of the learner's lines): https://claude.ai/artifact/YPDXzxENqYkSjc87aqtiSR (private). 25 of its 40 turns are comments, 10 are questions from the categories never used, 5 are goodbyes. Noticed while writing it: the place comes through more easily, because the learner asks and the character's next line is the answer; the comment bubbles are the hard half and pull towards filler; and it is Claude's hand, so it shows how the pattern reads, not what the model would produce.

## The seven categories

A category says what the question is about. Josh named four ("Preferences, senses, biography, comprehension"); Words, Help and Play are Claude's additions. Josh, 2026-11-14: Help and Play "include"; Words "i like the idea but its not working" (at Beginner the question's English gives the answer away), so it waits for step 6 or Intermediate.

| Category | What it asks about | Kinds in it |
|---|---|---|
| **Preferences** | What you like or want | Do you like, do you want, A or B, what do you think of, how do you want it |
| **Senses** | What's in front of you both | See, hear, taste, touch, smell |
| **Biography** | Your life | Have you ever, do you have, do you know (a place), your family, how you are, your plans, belief |
| **Comprehension** | What the character just said or showed | True or not, who, where, when, why, how many, do you remember |
| **Words** | The language itself | What is it called, how do you say it in English, idioms |
| **Help** | Something the character needs | Advice, a favour, settle an argument |
| **Play** | A game between you | Guess, bet, dare, imagine, what happens next |

The idea underneath is who holds the answer:

- **The learner does:** Preferences and Biography. There is no wrong answer.
- **The character does:** Comprehension and Words. There is a right answer, and the character confirms it.
- **Both do:** Senses. It's there to point at.
- **Nobody does yet:** Help and Play. The answer gets made in the moment and changes what happens.

In the five visits, the 43 closing questions fell: Preferences 32, Senses 9 (all sight), Biography 2, and none in any other category. Those visits were on version 11-12i, before the 2026-11-13 release.

Josh on two of the pieces: "Idioms could fit in words. Next might be a type of shape or narration".

### Placements not settled

- **Guess** is in Play. Josh's comal example of 2026-11-13 (`docs/mix.md`: one answer is right) treats a guess as Comprehension.
- **Belief** ("¿Usted cree en los fantasmas?") is in Biography; it could be Play.
- **Teach me** ("how do you say it in English") is in Words; it could be Help.

## Two other things that describe a question

The category is separate from these, and any category can take any value of them.

| | What it says | Values |
|---|---|---|
| **Answer form** | The form of the answer | Yes or no, A or B, open, a guess with a right answer |
| **Narration** | Whether the scene moves | Stays here, moves on now, next time |
| **Thread** | How it follows the learner's last answer | New topic, one step deeper, joined to the character's world |

"Answer form" is the terms table's **Ask** ("yes/no, either/or or open"). It is not called "shape" here because shape already means the list of moves code picks for a turn (`lib/shapes.ts`).

Narration: "¿Quiere ver la mina?" is a Preferences question that moves the scene; "¿Qué cree que hay detrás de esa puerta?" is a Play question that moves it; "¿Oye eso? Venga." is a Senses one. The five visits were narrow on all three at once: Preferences, yes or no, and moving on by offering to show something.

"Next time" and Thread were added 2026-11-14 from the session on `docs/learner-loop.md` and `docs/play-readings.md` (Josh: "do it"):

- **Next time** is a bid for a return (Josh: "characters should make strrong bids for returns - that is a goal"): "¿Quiere que mañana le enseñe la bocamina de cerca?" (Isidro, d335b204). Help and Play make natural ones: "Come back and tell me who was right."
- **Thread** is what separated Josh's two best visits (Beatrice 09dd40cd, Nunzio 52ae014d) from the rest, more than the category: "Le piace leggere?" is plain Preferences, but every question after it went one step deeper into Josh's last answer (reading, history, Machiavelli, the Discourses), and then joined it to her world ("Siena was a republic… Vuole visitare il Palazzo Pubblico?"). More categories answer B24 (repetitive); Thread answers flat.

| Thread | Example |
|---|---|
| New topic | "¿Le gusta la plaza?", after he's been talking about his grandfather |
| One step deeper | Josh: Machiavelli → "Le piace di più Il Principe o i Discorsi?" |
| Joined to the character's world | Josh: my grandfather worked in a garden → "Allora suo nonno fa il mio stesso mestiere" (Nunzio) |

In both visits Josh brought the threads, in Italian he can steer with (Josh: "I can influence convversation, but they still show working dialogue"). A Beginner can't, so the new bubble (above, "The last sentence, and the two bubbles") is where the learner's thread has to come from: a thing about themselves that opens one, and the next turn goes one step deeper into whichever was said.

> Nel suo paese ci sono giardini così?
> "Sì, mio nonno era giardiniere." / "Nella mia città ci sono parchi grandi."

When the rewritten visits are read, or the next ones written, each closing line can be marked for Thread as well as category: a line only works in its place in the visit, which is where the two best visits worked.

## The kinds, with examples

Each has two answers a Beginner could say back. The examples are written to show the kind, not taken from any character's file.

### Preferences
| Kind | Example | Two answers |
|---|---|---|
| How do you want it? | ¿Cómo lo quiere, con chile o sin chile? | Con chile. / Sin chile, por favor. |

Do you want, do you like, A or B and what do you think of are the kinds already in play (B24 has examples).

### Senses
| Kind | Example | Two answers |
|---|---|---|
| Taste | Pruebe. ¿Dulce o picante? | Dulce. / Picante. |
| Sound | ¿Oye la banda? | Sí, la oigo. / No, no oigo nada. |
| Touch | Toque. ¿Suave o áspero? | Suave. / Áspero. |
| Smell | ¿A qué huele? | A café. / A pan. |
| How is / how was? | ¿Cómo estuvo el café? | Muy rico. / Un poco fuerte. |
| Can you? | ¿Puede leer este letrero? | Sí, dice "abierto". / No puedo. |

Sight ("¿Lo ve?") is the only sense in play today (B2).

### Biography
| Kind | Example | Two answers |
|---|---|---|
| Do you have? | ¿Tiene hijos? | Sí, tengo dos. / No, no tengo. |
| Do you know (a place)? | ¿Conoce Oaxaca? | Sí, la conozco. / Todavía no. |
| When? | ¿Cuándo viene usted al centro? | Por la mañana. / Por la tarde. |
| How you are | ¿Tiene hambre? | Sí, mucha. / No, gracias. |
| Your plans | ¿Adónde va después? | Al mercado. / A mi hotel. |
| Someone you've mentioned | ¿Qué le llevo a su hija, el rojo o el verde? | El rojo. / El verde. |
| Belief | Dicen que aquí espantan. ¿Usted cree? | Sí, creo. / No, no creo. |

"Someone you've mentioned" uses only what the learner has told the character (CLAUDE.md: characters know only what the learner has told them).

A Biography question works best at Beginner when its answer is a name, a place or a number, since those are the only gaps learners filled (above): "¿De dónde es usted?" / "Soy de …" rather than "¿En qué trabaja?" / "Trabajo en …".

### Comprehension
| Kind | Example | Two answers |
|---|---|---|
| Do you remember? | ¿Se acuerda cómo se llama esta salsa? | Salsa macha. / No me acuerdo. |
| Who? | ¿Quién pintó este mural? | Diego Rivera. / Frida Kahlo. |
| Where? | ¿Dónde está la mina, arriba o abajo? | Arriba, en el cerro. / Abajo. |

These count as Comprehension when the character has already said the answer; asked before it's said, the same wording is a Guess.

### Words
| Kind | Example | Two answers |
|---|---|---|
| What is it called? | ¿Cómo se llama esto en inglés? | Se llama "shoeshine". / No sé. |
| Teach me | ¿Cómo se dice "campana" en inglés? | Se dice "bell". / No sé. |
| An idiom's meaning | Aquí decimos "echarle ganas". ¿Qué cree que significa? | two guesses offered |
| An idiom, your version | ¿Cómo se dice eso en inglés? | the learner's own saying |

Idioms come from the idiom stores (`content/<country>/idioms.json`). Asked this way an idiom arrives as a question, not a lecture. This is the one category where the learner can be the expert.

### Help
| Kind | Example | Two answers |
|---|---|---|
| Advice | ¿Qué hago, lo pinto azul o rojo? | Azul. / Rojo. |
| A favour | ¿Me pasa el cepillo? | Sí, aquí tiene. / ¿Cuál cepillo? |
| Settle an argument | Mi compadre dice que el mole es de Puebla. Yo digo Oaxaca. ¿Quién tiene razón? | Usted. / Su compadre. |

The character asks because they need the answer, so it is neither a test nor small talk, and the learner's answer changes what happens next.

### Play
| Kind | Example | Two answers |
|---|---|---|
| Guess: how many | ¿Cuántos años cree que tiene esta fuente? | Cien años. / Trescientos años. |
| Guess: what is it for | ¿Para qué sirve este gancho? | Para la carne. / Para el sombrero. |
| Guess: why | ¿Por qué cree que la cantera es rosa? | Por el hierro. / Por el sol. |
| A bet | ¿Cuánto cree que pesa? ¿Diez kilos o veinte? | Diez kilos. / Veinte kilos. |
| A dare | ¿Se anima a probarlo? | Sí, me animo. / Mejor no. |
| Imagine | Si fuera suyo, ¿qué nombre le pondría? | open |
| What happens next | ¿Qué hago ahora, la cera o el cepillo? | La cera. / El cepillo. |

A guess or a bet has a right answer, and the character's next line gives it, which teaches a fact about the place.

## What already exists under other names

From `docs/dialogue-structure-reference.md` (terms, bid menu), `docs/bids.md`, `docs/dialogue-ideas.md` and `docs/mix.md`.

| Here | Already there | How they relate |
|---|---|---|
| Comprehension | Josh, 2026-11-13: "the bubble could be more testing comprehension than preference", the comal example | The same idea; the Preferences / Comprehension split is Josh's own. |
| Guess | "Guess" in the bid menu ("What do you think this hook is for?") | The same. |
| Do you remember | "Remember" in the menu; the recall idea in mix | The same. |
| Biography | "About you" in the menu; "Learner facts" in the terms | The same subject. |
| Senses | "Notice" in the menu; "Anchor" in the terms | The same, but only sight exists there. |
| Preferences | "Choose" and "Offer" in the menu; "interviewing by multiple choice" in dialogue-ideas | The same. |
| Words | Josh's "say it in English" favour; the idioms section of mix | Both exist separately; nothing groups them. |
| Answer form | The "Ask" term | Identical. |
| Narration | "Build", "Thread", "Story", "Offer" in the terms | The same territory. |
| A turn that ends on a comment | "Left open" in the menu; "a statement can be a bid" (§ 1a); Josh, 2026-11-04, "no questions is fine" | The same, there as an option; here as the usual turn. |
| A bubble with a gap | "About you" and "Finish it" in the menu | The same; the ten days say which gaps get filled. |

New in this file: the category level itself (the bid menu sorts by the learner's job: say it back, choose, guess, remember, ask me; this sorts by what the question is about); Words as a category; senses beyond sight; Help; most of the wordings above.

Two things in those docs that bear on this:

- The menu's gates match the categories: a Guess needs something visible, "Ask me" needs a fact just told, Remember needs something told earlier. So a category could say when its kind of question is possible.
- Of the menu's rows only say it back, choose, ask me and notice are live. Guess, Remember, About you and Offer are designed, not built, which is what the five visits showed.

## Next step (proposed, not started)

1. Josh reads the rewritten visits and says what holds.
2. More visits on the live version are read the same way before anything is changed: the five visits predate the 2026-11-13 release, which already changed "¿Lo ve?" and where a visit ends, and its first six pairs look different.
3. One change goes into the game as a trial. The lightest is in the draw of Beginner turn kinds (code: how often a turn closes on no question), which adds no instructions. Anything in the prompt (the last sentence with its English, one bubble on its words and one new, a new kind of question) needs a card in `docs/prompt-trials.md` and a reviewed test, and the dialogue session, which owns the Beginner turn, should know first.
