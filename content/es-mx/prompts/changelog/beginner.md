# beginner.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../beginner.md`.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-11-07a: living in the country, not here
- **Changed** "they've come to live here" to "they're living in {country} for a while".
- **Why:** whether the person is a tourist or someone staying wasn't said at Intermediate (character.md took "They're new to the neighbourhood" out on 2026-10-11 as dubious once memory exists), and the Beginner line ("they've come to live here") is false in most cities, since the learner travels between them. Without it a character asks "¿Vive aquí o está de visita?" (C4's first pilot). The country is true everywhere.
- **Prompted by:** Josh, 2026-11-07: "does the learner live in every city they visit", "country is fine with me". Changed without a test on Josh's decision ("permission to just change beginner.md and character.md").

### 2026-11-06: the errand is a turn or two, not the conversation

Josh, 2026-11-06: "The game is basically broken for all the places that have commerce as their focus"; "the whole thing falls down into a transaction. How much you pay, do you want to pay with credit card or cash? Thank you, bye." The errand line (2026-10-25c) scripted exactly that: "let it lead: what they'd like, how much, how it's served, paying, goodbye", and the goodbye came "when the errand is done". Baseline (tests/experiments/variety.mts, docs/prompt-trials.md → Conversation variety gate): purchase 65–70% of a Beginner character's lines in Italy, 79% in Mexico; something particular to the town in 2–7 of ~22 visits. Now: the errand is a turn or two, then what you'd talk about with a newcomer; the goodbye when the talk winds down. Beginner gate (LEVELS=Beginner), baseline runs 1 · 2 → A: Italy purchase 70% · 65% → 51%, something particular to the town 2/24 · 5/24 → 7/24, told again 2.5 · 2.0 → 2.0; Mexico purchase 79% · 79% → 60%, town 4/21 · 7/21 → 11/21, told again 1.3 · 1.1 → 2.6 (worse: freed from the purchase, they fill the visit with their planted idea, piloncillo, Talavera, marigolds, on every visit; that's step C). Reply time 2.5 → 2.7 s Italy (only two runs sharing the laptop, against four), 2.7 → 2.7 s Mexico; words 19 → 20, 21–22 → 22.

### 2026-11-05c: say each thing once

Josh, 2026-11-05, hearing Luisa's and Doña Chela's openings: "totally incoherent, repetitive with no pauses"; "cafe, coffee, cafe"; "incoherent dialogue". A turn said the same thing three times: in English ("Here you pay at the cassa first"), in the language ("Prima la cassa"), then in the whispered gloss ("first, the cashier"); and glossed words that are the same in English ("caffè" → "coffee"). Now the English never says what the language then says (a name or a greeting said in the language isn't said in English too), and the gloss is empty when the English already said it or the words are the same in English. The pauses are code: lib/beginner.ts → lineFromParts ends every spoken piece with a sentence break, and doesn't say her question's English when answers are shown (their English says it). Measured with tests/experiments/archive/replay-set.mts (new).

### 2026-11-05b: answers as short as a local says them; the English names a local thing

Josh, 2026-11-05, on Doña Chela's two answers ("Quiero probar un chapulín, por favor." / "Quiero probar el quesillo, por favor." with "I want to try the quesillo, please."): "reply is too long replies. One translation doesn't translate the subject." The answer rule asked for "a whole sentence" and "the shortest whole sentence", so a beginner got a verb phrase to read out where a local says just the thing and a please; and an answer's English carried a local word over untranslated. Now: the fewest words a local would use, a full sentence only when that's how people answer; an answer's English says in a few words what a local thing is. Measured with tests/experiments/archive/answer-length.mts (opening turns at S1 and S2, eight shown places, 2 runs each).

### 2026-11-05: corrections and mishearings in dialogue.md

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" (a misheard "Joven, ¿me ayuda?") into "HO-ven", and met "Estoy en el barco de canzart" with "Almost! The word you want is cansado". Josh: fixes "are global improvements not local to lessons or conversations or one country"; "its ok not to get corrected all the time". Corrections and mishearings now have one rule for every conversation (dialogue.md, added to every system prompt), and the app tells the character whether an offered answer was said back (lib/dialogue/heard.ts); this file no longer has its own. Removed here: "Never… correct… using the right words naturally" and "forgive misheard words" (both now in dialogue.md); kept: never praise, never point out a mistake. The Mexico file's example was Italian (per favore); gone with the line.

### 2026-11-03: one idea per answer, the shortest whole sentence

Josh, 2026-11-03 (Mexico): Don Nacho offered "Estoy un poco cansado, pero contento" to say back; "Estoy cansado" is enough. Answers had grown into two ideas joined with "pero" or "y", too much for a beginner to read out loud. Now each answer holds one idea, the shortest whole sentence that answers, still built from the question's words where that's natural.

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
