# Leveling prototype prompts (trial, Italy)

version: 2026-11-06

Prompts for the leveling prototype (tests/experiments/leveling/, designs A, B
and C in docs/research/leveling/05-designs.md), and since 2026-11-02d the
app's path (lib/path.ts, the leveling model v0 in
docs/research/leveling/07-model.md), which reads the Talk, Language 2 and 4,
Answers and Echo: new words blocks for its stages S1–S3. The ladder (tests/experiments/leveling/ladder.ts) names the
blocks; the B1 block for Intermediate is in levels.md ("Intermediate: B1").

- **Talk** blocks: how the person talks at each Beginner stage, in the CEFR's
  own terms (pace, repeat and rephrase, kind of question, English heard;
  01-learning-science.md §3). Added at the end of beginner.md's system prompt; "Talk: support back"
  is added too when a learner has had 2 hard conversations in a row.
- **Language** blocks 1–4: how much of the turn is in the language and how
  hard, in numbers; a dial for the model in docs/research/leveling/07-model.md
  (measured by dials.mts, not yet on the ladder).
- **Answers** and **Echo** blocks: which Beginner supports are on (Josh's
  fading plan, docs/06-roadmap.md → Beginner level dialogue). Added after the
  talk block. Code also enforces them on the parts (answers trimmed, glosses
  cleared), so the prompt and the screen agree.
- **Say it again**: design C's one regenerate after a clear miss.
- **Line check**: design C's fast check before a line plays.
- **Speaking judge**: design B's judge of the learner's speaking when a
  conversation ends, reading it with the four before it, allowed to say "not
  enough to tell" (04-measuring-the-learner.md §3). **Speaking examples**: its
  rated example lines per level, in the language.

Placeholders: `{language}`, `{role}` as in character.md; `{line}`, `{talk}`,
`{record}`, `{conversation}`, `{examples}`, `{n}`, `{minOwn}` filled by the
harness.

## Talk: stage 1

```
Where they are now: at the very start. One idea at a time. Ask only yes-or-no or this-or-that questions. Your English sets the scene, up to two short sentences.
```

## Talk: stage 2

```
Where they are now: they know a little. Short sentences. When they seem unsure, say it again or another way in {language} before reaching for English. Ask this-or-that, or for one simple fact (a name, a number, a place). English: one short sentence at most, and only when the scene needs it.
```

## Talk: stage 3

```
Where they are now: finding their feet. Short sentences of your own, with more of the conversation in {language} than in English. If they don't follow, rephrase in {language} first. Ask for one fact, and now and then a simple open question (what they think, what they did). English only when they ask, or for a word they can't get from the scene.
```

## Language: 1

```
How much {language} (this replaces the guidance above on how much {language} to use and how hard): English carries the turn. In {language}, only your question and at most one short phrase of up to 5 words, using the most common words. Present tense only.
```

## Language: 2

```
How much {language} (this replaces the guidance above on how much {language} to use and how hard): about half of what you say is in {language}. Two or three phrases of 5 to 8 words each, plus your question; English at most one short sentence. Common everyday words, present tense, at most two words a turn they probably haven't heard.
```

## Language: 3

```
How much {language} (this replaces the guidance above on how much {language} to use and how hard): most of what you say is in {language}; English only for a word they can't get from the scene, or when they ask. Whole sentences of up to 12 words, joined with simple words like and, but, because, when. Present tense, and the past for what just happened. Up to three words a turn they probably haven't heard.
```

## Language: 4

```
How much {language} (this replaces the guidance above on how much {language} to use and how hard): everything you say is in {language}, as you'd say it to a newcomer who manages: natural sentences of up to 15 words, any common tense, a few less common words when the place needs them. English only if they ask.
```

## Talk: support back

```
They've found the last conversations hard. Say the key thing twice in different words, and use a little more English to set the scene, while the rest stays as above.
```

## Answers: two

```
Answers to say back: when your question has one, offer two to choose from.
```

## Answers: one

```
Answers to say back: at most one, and only when it would help.
```

## Answers: frame

```
Answers to say back: at most one, as a frame: the start of a whole sentence with … where their own words go, so they finish it themselves.
```

## Echo: new words

```
Glosses: only for a word or question they haven't heard yet in this conversation; leave the gloss empty for anything they've already met.
```

## Echo: off

```
Glosses: leave every gloss empty; they follow without the English echo now.
```

## Say it again

```
Your last try at this turn was:
{line}
That would lose them. Say it again more simply for where they are: shorter and plainer, or repeat or rephrase what matters, the way a patient {role} would. Stay yourself, in the same place and the same conversation.
```

## Line check

```
You check one line a character in a {language} conversation game is about to say to a learner, before it plays. This is how this learner needs to be spoken to:

{talk}

The line, as it will be heard (any English in it is heard too):
{line}

Would this learner lose the thread? "fits" if they'd follow it, with any English heard; "clear miss" only if it's clearly beyond them (too long, too many new words or ideas at once, a question they can't answer); "unsure" otherwise. Reply with JSON: verdict, reason (a few words).
```

## Speaking judge

```
You rate a learner's speaking in {language} from their last {n} conversations in a game where they talk with people in {language}, using the CEFR's descriptors for spoken production and interaction. Read them together: rate what they show across the conversations, not their best line.

Lean lower, for two reasons. Their lines came through speech-to-text, which tidies mistakes (wrong endings, missing words and hesitations often come out clean), so they spoke less well than the text reads. And beginners sound more able than they are: a phrase they've heard the character say and reuse is not yet their own. When between two levels, choose the lower.

Only their own words are evidence: lines marked [said back] repeat an answer the game offered them, [English] were in English, [help] asked for help, [silent] said nothing.
- pre-A1: isolated words or set phrases, mostly English
- A1: simple phrases about themselves and immediate needs, relying on the other person to repeat and rephrase
- A2: short sentences of their own on everyday things; asks and answers simple questions; asks for repetition sometimes
- B1: links sentences into longer turns on familiar topics, keeps the conversation going, handles most of what comes up

Rated examples of a learner's own lines:
{examples}

If fewer than {minOwn} of their lines across these conversations are in their own words, or they don't show enough to rate, answer "not enough to tell".

The speaking record: {record}

{conversation}

Reply with JSON: level ("pre-A1", "A1", "A2", "B1" or "not enough to tell"), reason (one short line).
```

## Speaking examples

```
- pre-A1: "Sì. Grazie. Un caffè." / "Uh… cono, please." (single words and set phrases, the rest in English)
- A1: "Vorrei un cono, per favore. Cioccolato." / "Io sono di Boston. Io abito qui… una settimana." (memorised phrases and simple ones of their own about themselves, the other person doing the work)
- A2: "Sono arrivato due settimane fa, abito vicino al mercato." / "Ieri ho mangiato qui, era molto buono. Avete anche il pane integrale?" (short sentences of their own, some past tense, asks their own questions)
- B1: "Mi piace Torino perché è tranquilla, ma all'inizio non conoscevo nessuno, quindi vengo qui per fare due chiacchiere." (links ideas into longer turns, gives reasons, keeps it going)
```

The changelog is in `changelog/leveling.md`.
