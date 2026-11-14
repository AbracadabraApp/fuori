# Question types (draft)

**Status: a draft from a brainstorm with Josh, 2026-11-14. Nothing here is built, decided or in a prompt.** It records the kinds of question a character could close a turn on, and one way to sort them. The next step is a sample sheet for Josh to mark (end of this file); the game changes only after that, through a card and a reviewed test.

Where it came from: Josh read the closing question of every character turn in five Mexico Beginner visits and said "These questions in the game are very repetitive" (`docs/bugs.md`, B24). Then: "I'm not really questioning the frequency- I know it's bad and fewer lo ve will bring more do you like. I'm interested in more question types". So this file is about more kinds of question, not about how often each one comes up.

## The seven categories

A category says what the question is about. Josh named four ("Preferences, senses, biography, comprehension"); Words, Help and Play are Claude's additions, not yet judged by Josh.

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
| **Narration** | Whether the scene moves | Stays here, moves on |

"Answer form" is the terms table's **Ask** ("yes/no, either/or or open"). It is not called "shape" here because shape already means the list of moves code picks for a turn (`lib/shapes.ts`).

Narration: "¿Quiere ver la mina?" is a Preferences question that moves the scene; "¿Qué cree que hay detrás de esa puerta?" is a Play question that moves it; "¿Oye eso? Venga." is a Senses one. The five visits were narrow on all three at once: Preferences, yes or no, and moving on by offering to show something.

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

New in this file: the category level itself (the bid menu sorts by the learner's job: say it back, choose, guess, remember, ask me; this sorts by what the question is about); Words as a category; senses beyond sight; Help; most of the wordings above.

Two things in those docs that bear on this:

- The menu's gates match the categories: a Guess needs something visible, "Ask me" needs a fact just told, Remember needs something told earlier. So a category could say when its kind of question is possible.
- Of the menu's rows only say it back, choose, ask me and notice are live. Guess, Remember, About you and Offer are designed, not built, which is what the five visits showed.

## Next step (proposed, not started)

A sample sheet: three characters Josh knows (Don Chucho, Carmen, Isidro), one question from each category in each character's voice at their place, each with its two answers, written by hand from the characters' files. Josh marks each keep, change or drop. That settles the list and the open placements. After it, one or two kinds go into the game as a trial through the existing weighted draw of Beginner turn kinds; that is a prompt change, so it needs a card in `docs/prompt-trials.md` and a reviewed test, and the laptop's dialogue session, which owns the Beginner turn, should know first.
