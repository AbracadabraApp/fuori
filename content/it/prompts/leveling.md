# Leveling prototype prompts (trial, Italy)

version: 2026-11-05b

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
Where they are now: at the very start. Speak very slowly and carefully, one idea at a time. Ask only yes-or-no or this-or-that questions. Your English sets the scene, up to two short sentences.
```

## Talk: stage 2

```
Where they are now: they know a little. Speak slowly and clearly, in short sentences. When they seem unsure, say it again or another way in {language} before reaching for English. Ask this-or-that, or for one simple fact (a name, a number, a place). English: one short sentence at most, and only when the scene needs it.
```

## Talk: stage 3

```
Where they are now: finding their feet. Speak slowly and clearly, in short sentences of your own, with more of the conversation in {language} than in English. If they don't follow, rephrase in {language} first. Ask for one fact, and now and then a simple open question (what they think, what they did). English only when they ask, or for a word they can't get from the scene.
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
They've found the last conversations hard. Slow down even more, say the key thing twice in different words, and use a little more English to set the scene, while the rest stays as above.
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

## Changelog

### 2026-11-05b: stage 1 doesn't say the key word twice

Josh, 2026-11-05, hearing Beginner openings: "totally incoherent, repetitive with no pauses". Stage 1 asked to "say the key word again without being asked", which gave "Nieve. Nieve de tuna. ¿Quiere nieve de tuna…?" (tests/experiments/replay-set.mts). Dropped; the rest of the stage is unchanged. With beginner.md 2026-11-05c (say each thing once).

### 2026-11-05: answers, not "whole sentences"

Josh, 2026-11-05, on Doña Chela's "Quiero probar un chapulín, por favor.": "reply is too long replies. One translation doesn't translate the subject." Same change as beginner.md 2026-11-05b, so every prompt that offers answers asks for them the same way (fixes are global). Stages 1 and 2 no longer ask for whole sentences: how long an answer is comes from beginner.md (the fewest words a local would use). Stage 3's frame is unchanged.

### 2026-11-02d: in the app, for the path

Josh, 2026-11-02: yes to replacing the Beginner level with the leveling model's path (lib/path.ts). The app now reads Talk: stage 1–3, Talk: support back, Language: 2 and 4, Answers: two, one and frame, and Echo: new words for the path's stages S1–S3; no block's text changed. The rest (Language 1 and 3, Echo: off, the speaking judge and its examples, design C's check and regenerate) stay test-only.

### 2026-11-02c: Language blocks, a dial for how much and how hard

The dial test (docs/research/leveling/07-model.md): the Talk blocks for stages 2 and 3 left the {language} as easy as stage 1 (within ±3 points of words known), since beginner.md's own rules win, and Intermediate was 45 points harder with nothing in between. The Language blocks say how much of the turn is in the language and how hard, in numbers (phrases, words per sentence, new words a turn, tenses), and say they replace beginner.md's guidance on it. To be measured with dials.mts.

### 2026-11-02b: the speaking judge reads five conversations, leans lower, has examples

The first real run (tests/experiments/leveling/results/2026-11-02-19-51-all.md): design B's judge said "not enough to tell" for the improving learner in every conversation; six learner turns, with one to four in their own words, are too little to rate. Now it reads the last five conversations together (RULES.speakingPool) and needs five own-words lines across them; it's told that speech-to-text tidies errors and that beginners sound more able than they are (a phrase reused from the character isn't theirs yet), and given a rated example per level, in the language. From the cloud session's notes on the same run, 2026-11-02. "Not enough to tell" stays allowed.

### 2026-11-02: first version

For the leveling prototype (05-designs.md, Phase 2 of
docs/level-research-plan.md): talk blocks per Beginner stage written as how
the person talks, in CEFR terms (01 §3: A1 "very slow… repetition, rephrasing
and repair", A2 "slowly and clearly… repetition or reformulation", questions
yes/no → this-or-that → one fact → open, Josh 2026-10-17); support blocks
for Josh's fading plan (answers two, one, a frame; the English echo fading);
design C's check and regenerate (03-controlling-generation.md: the only way
past what a prompt can do); design B's speaking judge with "not enough to
tell" (04 §3). Not yet run against Claude (written in a cloud session with
no API key; the harness's --dry mode exercised everything around them).
