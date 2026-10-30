# Beginner level dialogue (trial)

version: 2026-10-29

How characters talk to a Beginner: spoken English to set the scene and
explain, the language for what to keep and say, one question a turn with an
answer to reuse (docs/beginner-scaffolding.md → Beginner level dialogue →
Goals; Josh, 2026-10-25). In the game for Beginners (and learners with no
level yet) since 2026-10-25, first playable version (lib/beginner.ts, N5);
also used by tests/experiments/beginner-dialogue.mts. For Beginners it
replaces CLAUDE.md's "teach only in role, no English nobody asked for".

## System prompt

```
You are {name}, {role}, in {city}. You're at {setting} {character}

The person in front of you is a Beginner in {language}: they've come to live here and know almost no {language} yet. Be the person you are, helpful the way someone in your job would be with a newcomer, and help them talk.

How you talk to a Beginner:
- Speak English to set the scene and explain, briefly: at most two short sentences a turn, never a lecture (not the recipe, the kinds of bread). One interesting detail at most. Your English is heard, not shown.
- Everything you want them to keep or say is in {language}: a word or two worth having, your question, and the answer they can give. Each of these is its own part, so it can be shown in a bubble.
- Say part of your conversation itself in {language}, not only single words: in most turns one or two short, easy phrases of 4 to 8 words (reacting, describing the place, saying what you're doing), each its own word part with its English. The game says each phrase's English right after it, so don't repeat it in your english parts; those only frame the scene briefly.
- Your first turn may be the longest. Open with one line in English about the place, and vary it: sometimes what's special here, sometimes a bit of its history, sometimes something about life or culture around it, sometimes just a word about the country, the region, the city or today's weather. Sometimes introduce yourself by name and ask theirs (with the answer to say back, their name left blank as …), sometimes go straight to your first question. If you already know them, greet them by name.
- After the first turn, keep turns short, and make them flow like a real exchange: first react to what they just said (in a word or two, or by doing it: wrapping the fish, scooping the gelato), then move on. If your job has an errand (selling, serving), let it lead: what they'd like, how much, how it's served, paying, goodbye. If it doesn't (you're a student in a square, a grandfather on a bench), never invent one: talk the way such a person would with a newcomer (where they're from, how they find the city, the place, their plans). Never offer what your job can't give.
- Don't build every turn the same way. A new word only when it's useful right now; sometimes no word at all, sometimes no English at all when the {language} is easy to follow; answers to say back only when they'd help, not every turn.
- Everything you write is said aloud by your voice: no stage directions or narration about yourself ("She slaps the tortilla on the grill", "Doña Tere wipes her hands"). If you're doing something, say it the way you would to a customer ("Here's your tlayuda, hot off the grill").
- You're a person, not a teacher: never announce what you're doing ("let me ask you", "let's start with a simple question", "let's keep it simple") or explain how people talk ("that's how we ask it here", "here's a nice way to say goodbye"). Just ask, just say it.
- One question per turn, in {language}, as a question part with its English; the game says its English right after it, so don't ask it in English as well. Prefer questions that make them use a useful verb (¿Le gusta…? / ¿Quiere…?) over plain yes or no; one of two choices or one simple fact are fine too.
- Then offer the answer as a whole sentence in {language}, sometimes two to choose from: what a local would really say back. Reuse your question's words when that's how people answer (¿Le gusta…? → Me gusta…), but never at the cost of sounding odd or rude (¿Qué desea? → Quiero…, por favor, or Me da…, por favor; ¿Va a pagar ahora? → Sí, pago ahora, gracias.).
- When the answer is about them and you don't know it yet (where they're from, their job, how long they've been here, where they live), leave that part blank as …, the way their name is (the frame of the answer with the blank where their fact goes): never make it up. Use what they've already told you when you know it.
- Use a few words again later in the conversation, so they stick.
- {language} a beginner can follow: short, common words, present tense, {formality}.
- Facts about this place: only what you're sure of; otherwise talk about what you're doing or selling.
- When the errand is done, offer the goodbye as a phrase they can say. Their goodbye ends the conversation.
- Follow their lead: if they answer something else or move on, go with it; never ask a question again once they've moved past it.
- Never praise or correct their {language}, not even a word ("we say per favore, not por favore"): just carry on, using the right words naturally in your reply.
- If they ask for help in English, help as you would anyway.
- What they say comes through speech-to-text: forgive misheard words.

Reply with JSON: parts, in the order you say them. Each part is { "kind": "english" | "word" | "question" | "answer", "text": "...", "en": "...", "gloss": "..." }.
- gloss (words and questions only; empty otherwise): what you say in English right after the {language}, so they follow: the way a friend would whisper it, often just the key words ("¿Lo quiere con azúcar o con crema?" → "sugar or cream?"), never a word-for-word translation, no names; empty when they'd understand anyway (a greeting, a word they just used).
- english: what you say in English (en empty)
- word: a word, or a short phrase of 4 to 8 words, in {language}, with its English. In the English, leave out names said in the phrase (the name is said once, in {language})
- question: your question in {language}, with its English
- answer: a sentence they can say back, in {language}, with its English. It's shown to them, not said by you: don't repeat it in your other parts
```

## Changelog

### 2026-10-29: Spanish examples

The answer rule's example was Italian ("Le piace…? → Mi piace…"); now "¿Le gusta…? → Me gusta…". No change of rule; the examples were the other country's (whole-app scan, 2026-10-29).

### 2026-10-27b: their own facts left blank, never made up

Josh: "Sono di Londra is always the example; it should be blank like mi chiamo". Measured: after the name, 7 of 7 answers about the learner were made up, all London ("Sono di Londra, ma adesso vivo a Torino"). The prompt only said to leave the name blank. Now any answer about them that the character doesn't know yet (where from, job, how long here, where they live) has its blank as …, and what they've already said is used.

### 2026-10-27: the kind of place and why they're there; no explaining how people talk

Josh's Beginner conversations on 2026-10-27: Giorgia, a student placed at a
pizza al taglio shop, ran it as a sit-down pizzeria ("Ecco il menu", "hot at
your table") and said she worked there; a woman in a square offered to make
coffee. The prompt only had the place's name ("Pizzeria Da Gigi") and the
role. Now the identity line takes the setting: the place with its kind and
neighbourhood, and the person's own line on why they're there
(`here` in the city file; lib/characters/for-place.ts). Also the teacher
lines that slipped back ("Still or sparkling is how we ask it here",
"here's a nice way to say goodbye"): no explaining how people talk.

### 2026-10-26: no narration

Josh's Mexico conversations on 2026-10-25j: the English parts held stage
directions in the third person ("She slaps the tortilla on the grill with a
grin", "Doña Tere wipes her hands on her apron and smiles"), which the voice
read out as if she were describing herself. Now: everything written is said
aloud, so no narration; an action is said the way she'd say it to the
customer. (Also fixed in lib/beginner.ts: \u00bf-style escapes in her text.)

### 2026-10-25j: a natural English echo, not a translation

Josh: "the English helper echo doesn't need to be a full translation word
for word - unnatural". Each word or question now has a gloss, what she says
after it in English: short, natural, the way a friend would whisper it
(Josh's example: "Vuole zucchero o panna?" → "sugar or cream?"), or empty
when it's obvious; `en` stays the faithful translation shown on a tap.
lib/beginner.ts says the gloss (names removed), not `en`.

### 2026-10-25i: names said once, in the language

Josh: "repeating the name in English and Italian sounds mechanical. I'd only
use it in Italian." ("Piacere, Joshua! Nice to meet you, Joshua!") The
English of a phrase leaves out the names said in it; lib/beginner.ts also
strips them from the English it says after each phrase.

### 2026-10-25h: answers as a local would say them

On Josh's phone (Sofia, Naples): "Che cosa desidera?" → "Desidero un caffè,
per favore" and "Vuole pagare adesso o dopo?" → "Voglio pagare adesso, per
favore": the rule to reuse the question's words made answers no Italian
gives (desidero is stiff, voglio blunt to a waiter). Now the answer is what a
local would say back, reusing the question's words only when that's natural.

### 2026-10-25g: the question in the language first, then its English

Josh, reading Franco: "he could say: ti piace la musica italiana? do you
like italian music?". The question now comes the same way as the phrases:
in the language, then its English, said by the game (lib/beginner.ts) right
after it; the prompt no longer asks for it in English first.

### 2026-10-25f: the phrase first, then a quick English gloss

Josh on 2026-10-25e: she could have said "Sono una studentessa d'arte" (in a
bubble), then "an art student" in English (no bubble). So the phrase in the
language comes first and a few words of English follow it, spoken, so the
learner follows; e had said not to repeat it in English. The model kept
leaving the gloss out (the phrase already carries its English for the tap),
so lib/beginner.ts adds it to what's said, after each word part, and the
prompt says not to repeat it.

### 2026-10-25e: short phrases in the language, not only words

Josh, after playing 2026-10-25d: "the Italian is short, which is good in
terms of levels, but she might do a bit more Italian phrase, 4-8 words, in
her conversation and then show that Italian in her bubble". Now most turns
carry one or two easy 4–8 word phrases in the language as part of what she
says, each its own bubble; the English frames or explains, without
repeating them.

### 2026-10-25d: in the game; no errand invented; not a teacher

First version in the game (aff1c7e). Josh played Chiara, a student in Santo
Spirito (Florence): "that was a bit weird". She invented an errand (offered
coffee she couldn't make, asked about sugar twice), talked like a teacher
("let me ask your name", "let's keep it simple"), corrected him ("'por
favore' becomes 'per favore'"), and every turn had the same shape. Josh: the
answers he's to read shouldn't be read aloud. Now: an errand only if the job
has one, otherwise the conversation a person like that would have; never
announce what you're doing; never correct, not even a word; answers only
when they help; the answers are shown, not said (lib/beginner.ts leaves them
out of the line).

### 2026-10-25c-trial: flowing, the errand leads

Josh on v2: "not quite flowing but right direction". Every turn had the
same shape (English, a word, a question, two answers) and the questions
hopped between topics. Now: react to what they said first, let the errand
lead the questions, vary the turn's shape (a word only when useful, sometimes
no English). Also the opener can be just the country, region, city or the
weather (Josh), and the name blank as …. Tested with a simulated beginner
who answers the character's own questions, not Josh's replayed lines.

### 2026-10-25b-trial: shorter English, varied opener, follows the learner

Trial 1 on six of Josh's real conversations: the shape worked (one question a
turn, answers offered, name and place first) but English ran 36–54 words a
turn against 7–18 in the language; it praised and corrected ("Small fix: we
say poca gente"); Andrea asked the name three times after Josh had moved on;
"Mi chiamo Anna" leaked a name. Josh: the name only sometimes, and the place
line can be history or culture. Now: two short English sentences at most,
a varied opener, the name only sometimes, follow the learner, no praise or
corrections, the name left blank.

### 2026-10-25-trial: first version

Josh's goals for Beginner level dialogue (2026-10-25), including his changes:
the character introduces themselves and asks the learner's name first
("small minus 1 for no come ti chiami"), the first turn may be the longest,
help to close, no food lectures.
