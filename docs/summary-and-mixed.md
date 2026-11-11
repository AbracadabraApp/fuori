# Beginner English: summary and mixed

2026-11-10 · Josh and the cloud session, from a phone conversation · Notes, a design sketch and the smallest test (card B2-E5 in [prompt-trials.md](prompt-trials.md), script `tests/experiments/summary-mixed.mts`). Nothing in the game changed. Follows [beginner-2.md](beginner-2.md) → "a folksy echo" and cards B2-E to B2-E4.

## What happened (2026-11-10)

Card B2-E5 ran and Josh listened blind. **Summary:** with the bare line, half the summaries narrated her ("She brushes off dust first"); Josh followed the literal on 8 of 8 and the summary on 6, preferred the summary on 3. The in-voice ones won. With "in her own words, as she would say it" added (code counts third-person summaries), narration fell from 5 of 16 turns to 1 of 16, at 0.76 of the literal's words. **Built into Beginner 2, cluster 1** the same day (see [beginner-2.md](beginner-2.md) → Built). **Mixed:** a thought on 6 of 8, a person's switch on 8 of 8, but Josh followed 1 of 8 (English 23–36% of her words): "not good enough to release"; parked, to come back to.

## Frame mix: the mixed idea redone from the research (2026-11-10, a list, not in the game)

Josh asked for a better mixed approach ("my best guess is that the grammar matters - independent clauses"). The research agrees: **Poplack (1980)**, the equivalence constraint: switches sit where both grammars line up (clause and phrase edges), and her three types, tag switching, inter-sentential, intra-sentential (the hard one, which B2-E5's mixed arm asked for); **Myers-Scotton (1993)**, the matrix language frame: one language holds the grammar and carries comprehension, the other supplies content; **Butzkamm**, the sandwich (L2, L1, L2). Why B2-E5's mix wasn't followed: the frame was Spanish, so the meaning was in the Spanish.

**The idea: flip the frame by level.** Cluster 1: English frame, the Spanish slotted in as whole phrases (greetings, "pase, pase", "aquí tiene", prices, the question), each with its English beside it. Middle clusters: half and half, a Spanish clause then an English clause at the boundary, tags in Spanish. Later: Spanish frame, English asides (B2-E5's mixed arm, at the top of the ladder). "How much English" becomes which language holds the frame and where the switches sit, not a percentage.

**The list** (`tests/experiments/frame-mix.mts`, Mexico, 4 characters × 2 turns, the Intermediate prompt plus a brief; Spanish-run spans marked by a small judge call): F1 (English frame) came out at 30% Spanish, 36 runs, 7 single words; F2 (half and half) at 65% Spanish, 16 runs, none a single word, every switch on "so" (the example's fault). The sandwich (say it, English, say it again) fired on 4 of 8 F1 turns; Josh: "seems weird"; removed. **Final question always gets its English (Josh)**, as the code already does in the game.

**Josh: good** (F1, without the sandwich):
- Don Chucho: "Buenas tardes, joven. Welcome to my stand, pase, pase. I'm Don Chucho, and this is la silla, the chair, where you climb up for a boleada, a good shine. ¿Quiere que le boleé los zapatos? Want me to shine your shoes?"
- Don Chucho (after "Sí, por favor. ¿Cuánto cuesta?"): "Muy bien, suba, suba. It's treinta pesos, thirty pesos, and I do it slow, with la grasa, the polish, and the cepillo, the brush. Put your feet on the metal rests, así, like that. ¿Qué color son sus zapatos? What color are your shoes?"

The brief that made them: "The person in front of you has no {language} yet. You are a bilingual local, so with them you talk mostly in English, the way you would to a visitor, and you put the {language} in where it fits: the names of things, set phrases, and the short {language} sentence that matters, with its English beside it. Like: 'Mire, that's el comal, the griddle, that's where I put them. ¿Quiere una? Want one?' You are still yourself, here, doing what you do. One question at the end, in {language}, with its English." Noticed (Claude): the lines run 35–45 words, long for a first cluster. Not in the game (Josh: "not incorporate into game play yet").

**Josh, 2026-11-10, on the F1 list: "These are strong. For early learners - these are better than the echo or summary."** So the first cluster's shape is the English frame with the Spanish slotted in; the summary (built the same day) is a later-cluster shape, or goes. Not built yet.

## The problem

Today each Spanish sentence is followed by its English, sentence by sentence. The prompt writes the Spanish; code writes the English (`glossAll`, `questionEcho`). Josh: better than a few words, but too structured; "not great but it's coherent". The goal is more bilingual mixing or summarizing.

## What the trials already showed

- **B2-E (short glosses):** the mirror fell from about 93% to 8%, but Josh preferred the full echo 7 to 3. The difference was comprehension.
- **B2-E2 (Josh's four woven examples):** woven English on 0 of 12 turns. Her English went into the gloss field as key words.
- **B2-E3 (the sign-language device):** "bad" (as B2-E4's card records it).
- **B2-E4 (a separate echo writer that rewrites the whole spoken line):** stopped at its pilot: the Spanish was kept 10 of 10 and the style was the closest yet, but it wasn't briefer (1.21 English words per Spanish word against 1.22), 3 of 10 turns added a claim she hadn't made, and the call took a median 4.9 s (p90 28 s with 6 at once). Because the English was woven through the line, her voice couldn't start until the writer returned.
- **Reading of these (Claude):** the parts format gives every phrase its own English slot, so any instruction to mix lands back in the slots. B2-E's English was about 55% of the Spanish over the whole turn, but most of it was the question echo; her statements got roughly 25–30%, mostly noun labels.

## Josh's hunches (2026-11-10, "these are just hunches")

- Two short-to-medium sentences need a summary to be understood, or one sentence mixed.
- English needs to be about 50–70% of the Spanish.
- Coherence can only drop so far: under about 30% it's just Spanish to a learner.
- If the final phrase is a question, translate the whole thing.
- A bonus of getting it right: character talk can be longer or more complicated.
- The summary call should be able to start while she talks.
- The mixed sentence could be part of the lead prompt if massaged: clauses that are parenthetical, idiomatic and so on.
- The summary gets the vocabulary.
- Some number of Spanish words, across up to two sentences, can be summarized by a phrase or sentence of English. Too many words in one sentence and it needs its summary before the next sentence.
- "A total guess": more than 20 words needs a summary; no more than 2 sentences.
- Counting only the hard words is true but too fancy: count every Spanish word.
- The first version doesn't need levels.
- Talk then question is not a bad format. But her response should move forward from what the learner said, not go back to her previous story: no narration that ignores the response.
- On the summary adding nothing: "Is add nothing good". And "One word could sum 5": a summary can be far shorter than a translation and still carry it.
- "Correcting words can lead to inclusion": a correcting phrase added to a prompt tends to become the behaviour. So the summary prompt is his one line, "Summarize in one sentence with the fewest words", and nothing else until the clips show a fault.
- Reading is probably 20% the fidelity of hearing; hearing probably 80% of playing. So a test is heard, not read.

## Mixed: a thought, not a label (Josh)

- Good: "Mi abuelo, he was a stubborn man, boleaba aquí." and "El Andador es el corazón de la ciudad, the heart of the city…". The English says something: an assertion of her own, or the point of the sentence.
- Bad: "Esto es el comal, the griddle." The griddle has no independent clause. It's vocabulary.
- Reading (Claude): the short glosses that lost in B2-E were nearly all labels ("clay pot", "cinnamon coffee", "two blocks"). You knew the objects but not what she said about them.

## The design in mind (Claude's sketch from the above; nothing built)

**Her turn**
- The Intermediate prompt, whose reply is already one string (`{ line, en }`). No parts, so no English slot per phrase.
- Second step, not the first: one line describing her as someone with some English, which surfaces as a thought of her own (an aside, the point of a sentence, an idiom). No noun labels, no rate.
- She starts from what the learner just said. Intermediate says only "Take turns"; Beginner 1's "first react to what they just said, then move on" and "follow their lead" were left behind in Beginner 2. Renata's runs (2026-11-10) showed none of the learner's questions followed up.

**The summary**
- Code walks her line sentence by sentence, counting Spanish words. A stretch ends when it passes 20 words or reaches 2 sentences, whichever comes first (Josh's guess; Claude's reading of it). So a sentence over 20 words gets its own summary before the next one.
- One side call, started as soon as her text exists, like the replies written ahead. It gets who she is and her line in stretches. For each stretch: one English remark, shorter than the Spanish, as short as carries it (a word can stand for five of hers), keeping one or two of her words with their meaning (the vocabulary), skipping anything she already said in English. It may say what a thing she named is, in her voice; it gives her no new facts, events or offers, because the summary isn't in her transcript and she wouldn't know she said them.
- **How this differs from B2-E4:** the Spanish is never rewritten, and the English comes after a stretch, not woven through it. So her voice starts at once and the summary has the length of her first stretch to arrive (about 8 s for 20 words), where B2-E4's writer had to finish before she could speak. B2-E4's other two failures are handled differently: brevity is asked for outright, and "nothing added" (the test designer's rule there, not Josh's) is narrowed to no new facts, since Josh's own examples add ("It's a sauce, very dark, chocolate and chiles; you must try").
- A closing question gets its full English, as today.
- Late or failed: code speaks the literal English, and the turn logs it.
- Open (Claude): whether a single short sentence, well under 20 words, gets a summary or is left alone.

**Counted, not asked for**
- English against Spanish on her statements, apart from the question. Reported, to compare with Josh's 50–70%; not a rule, since one word can sum five. Whether a floor should trigger the literal English is open until the clips are heard.

**Left for later**
- The word limit as the level dial per cluster.
- What the screen shows (a mockup first).
- Vocabulary picks feeding Learn and the Diario.

**Worries (Claude)**
- Seams: each switch of language is its own audio, and a mid-turn summary has little time to arrive.
- Longer talk invites stories that continue across turns.

## The smallest test (card B2-E5)

Two questions, one small run, heard by Josh. Josh has no Spanish, so his ear in Mexico is a real beginner's.

**Question 1, mixed:** asked in a one-string reply, does she write an English thought inside her Spanish, and does it sound right in her voice? (B2-E2: 0 of 12 in the parts format.)

**Question 2, summary:** with the same Spanish, does a summary let Josh follow as well as today's sentence-by-sentence English, and does he prefer it?

**Setup**
- Mexico. 4 places, 2 turns each (the opener and her reply to one short learner line), so 8 turns an arm.
- **The summary prompt in the test is bare:** "Summarize each numbered stretch in one sentence of English with the fewest words." Her voice, the vocabulary and any limits on what it may add are in the sketch above but not in the prompt.
- **Arm S (summary):** the Intermediate prompt exactly as it is. Code ends a stretch past 20 Spanish words or at 2 sentences. The new summary prompt writes one remark per stretch. The question's English comes from her `en`.
- **Arm M (mixed):** the Intermediate prompt plus one level block describing her English as a thought of her own, with Josh's two good examples. No summary.
- **Audio:** every clip is spoken by the game's own voice provider in her voice.
- No game code, no app, no parts format: one script.

**What Josh hears (about 8 minutes, up to 24 short clips, no text shown)**
- **Summary:** each Arm S turn as two clips, sides shuffled, the key held back: her Spanish with the literal English after every sentence (today's shape), and the same Spanish with the summaries. The Spanish is identical, so the only difference is the English. Per pair: could you follow each? Which would you rather hear?
- **Mixed:** the Arm M turns, one clip each. Per clip: is there a thought of hers in English, or only a label? Does the switch of language inside a sentence sound like a person?

**Counted in code**
- Summary: English against Spanish on her statements; stretches a turn, and how many closed on the 20 words, the 2 sentences or the end of her talk; summaries longer than their stretch; her words kept in the summary; the summary call's time against how long her first stretch takes to say (an estimate, 2.3 words a second).
- Mixed: words a line against Arm S; the copy guard (an example line repeated).
- Read by Claude, flagged as a read: new facts, events or offers in the summaries; whether her second turn picks up the learner's reply.

**What would answer it**
- Mixed works if Josh hears a thought, not a label, on about half the clips or more, and the switch sounds like a person. Under a quarter: the one-string format isn't enough either.
- Summary works if Josh follows it on at least as many pairs as the literal English and prefers it on most.

**What it won't answer**
- Playing: the wait before a live summary, replying under time, a whole visit's rhythm. That's a phone build, after this.
- Levels, the screen, Italy.
