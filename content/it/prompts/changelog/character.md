# character.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../character.md`.

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-11-13b: an Advanced character knows the learner speaks the language well
- **Added, Learner: Advanced:** "They speak {language} well.", the {learning} line at Advanced (13a gave Intermediate its line).
- **Why:** Advanced had nothing of its own: the same prompt as Intermediate, so the two levels differed only by their name in Settings. A fact the character's own judgement can hold on to, as at Intermediate.
- **Prompted by:** Josh, 2026-11-13: "do we have anything for the advanced setting? Should we start with: They speak Spanish well".

### 2026-11-13a: an Intermediate character knows the learner is learning
- **Added, Who: the learner:** a {learning} line, filled at Intermediate from "Learner: Intermediate": "They're learning {language} and follow most of it." Empty (left out) at every other level: Beginner has its own level text, Advanced is unchanged.
- **Why:** the Intermediate prompt never said the person was learning, so a character had to guess each turn how much to help. Help in English when asked works (Josh: "intermediate does help in english when asked"), but it doesn't last: Nunzio (67edfe03) said "parlo più semplice" after "non posso capire tutto", then went back to "corteccia" and "scendono" with no English until Josh asked twice (docs/bugs.md B13). Of two ways offered (this fact, or a note on later turns once the learner has said it's hard), Josh chose the fact: the model handles it, given what it needs to know.
- **Replayed** (Nunzio's four turns after "non posso capire tutto", two takes each, tests/experiments/intermediate-ending.mts --intermediate): replies a little simpler and shorter, but no more English: "corteccia" explained in Italian both times (without the fact, one take gave "In inglese, «bark»"), and one take brought in "sughera". The fact makes the character gentler; it doesn't make it gloss. Kept for Josh's ear.
- **Prompted by:** Josh, 2026-11-13: "shouldnt the model just handle this?", then "ok 1".

### 2026-11-12b: with someone they've met, talk like a regular
- **Added, Relationship: met before:** "Talk with them like a regular: about what they've told you of themselves and about the day, not only your work."
- **Why:** Josh's play, 2026-11-12 evening (visits 015d2607 and 96962a32, Don Chucho; 45764841, Raymundo): "Don Chucho - almost same conversation - no familiarity or small talk - all repeating details of shoe shining"; the second visit greeted him by name and then retold the shine, with nothing of what he'd said about himself (he dislikes the cold, loves "Sabor a mí", lives in Mexico City, all in the notes).
- **Prompted by:** Josh, 2026-11-12: "go". Every level and both countries (fixes are global).

### 2026-11-12a: take up what they said first
- **Added, Talk: turns:** "Take up what they just said before you add anything of your own."
- **Why:** Josh's model of a conversation as bids (docs/dialogue-structure-reference.md § 1a: "Character makes a bid. Learner accepts and makes their bid. Character accepts, repeat"). The accept half had no line at Intermediate; the old Beginner prompt had one ("first react to what they just said… then move on"). The fault it answers: the character carrying on with its own subject (docs/dialogue-ideas.md → The character asks and carries on, as if answered; the Intermediate top 10, #1). Also reaches Beginner steps 1–3, which run on this prompt.
- **Prompted by:** docs/dialogue-plan.md 4.1; Josh, 2026-11-12: "yes", to be judged by his play; one line to take out if it makes turns formulaic.

### 2026-11-10q: it's rude to ask where they're from
- **Changed:** "Don't guess where they're from or why they're learning {language}; plenty of people here are. Talk about what's here." became "It's rude to ask someone where they're from or how long they've been here. Talk about what's here."
- **Why:** at full size (48 Intermediate visits of 8 turns and 48 Beginner 2 visits in each country, a judge reading every line) the 10p line still left 37 of 189 conversations asking (20%), mostly on turns 3 to 8, not the opener: "Lei è di passaggio a Firenze, o si ferma qualche giorno?", "¿Cuántos días va a estar en Puebla?", "¿Es su primera vez en el mercado?". The 16-visit runs behind 10p had read it as near zero. Social framing, as with "rude to dominate the conversation" (2026-10-12i): 9 of 189 (5%). What's left is mostly "first time at this place?" or "do you come here often?". Also tried on top of it: the first-meeting line "You haven't met them before." as "Someone interested in you." (no better: 3/47 and 7/48 Intermediate against 2/47 and 4/48), not kept.
- **Prompted by:** Josh, 2026-11-09: "we had some luck in a prompt telling the character it is rude to dominate the conversation"; then a larger run on the mini. `tests/experiments/newcomer-question.mts`; docs/prompt-trials.md.

### 2026-11-10p: the newcomer assumption removed
- **Added:** "Don't guess where they're from or why they're learning {language}; plenty of people here are. Talk about what's here." The removal alone made the question more frequent (automated Beginner 2 visits 3 → 8 of 16 asking; Intermediate openers 3 → 6 of 16): the scaffolding (a learner, English spoken to them) implies a foreigner, and the model's first-meeting small talk follows. This line, measured against "You've seen them around here before" (worse: 11 of 16), brought it to 4 of 16 in Beginner 2 and 1 of 16 in Intermediate openers; with Beginner 2's two-answers line asking about what's here (scaffolding.md 10o), 1 of 16.
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

### 2026-11-08b: a sale is a turn or two of the visit
- **Added** to "Take turns. No more words after a question mark.": "If your job has a sale, it's a turn or two of the visit, not the whole of it: serve them when they ask, then talk about your place, your work and them, not the price or how they'll pay unless they ask." Same curb Beginner already has, now at Intermediate and Advanced. `dialogue.md` and Beginner's wording unchanged.
- **Why:** about half of seller lines at Intermediate were sale talk (C13 judge). With the sentence the learner's visits were not worse in Mexico or Italy (C13, docs/prompt-trials.md); only Intermediate was tested.
- **Prompted by:** Josh, 2026-11-08: no issue standardizing the commerce curbs across language levels.

### 2026-11-08a: don't tell them again what you've already told them
- **Added** "Don't tell them again what you've already told them." on its own line after "You remember: {notes}" (met before only; first meetings unchanged). Beginner reads the same block (`lib/beginner.ts`), so it has it too.
- **Why:** since memory.md 2026-11-07a the notes hold what the character told the person, but nothing said what that's for, and he still told it again as new: in C5b (docs/prompt-trials.md) Don Ramón said "Yo nací en este pueblo…" on visit 3 as if for the first time, with "Told them I was born in San Miguel" in his notes. With the sentence: no replays, and his visits built on what Sam had said; in Italy (Karim) neither version replayed and the sentence did no harm. Topics and words still come back (atardecer, la Parroquia), which helps learning; only the replay is named.
- **Prompted by:** C5 and C5b, 2026-11-07/08. Josh: "groundhog day conversations feel broken"; asked for a guardrail, not a steer ("Pick up where you left off…" would "encourage same topic"; "Don't repeat yourself" was too broad); "C5b yes".

### 2026-11-07a: the person is living in the country for a while
- **Added** "They're living in {country} for a while." before the relationship line.
- **Why:** whether the person is a tourist or someone staying wasn't said at Intermediate (character.md took "They're new to the neighbourhood" out on 2026-10-11 as dubious once memory exists), and the Beginner line ("they've come to live here") is false in most cities, since the learner travels between them. Without it a character asks "¿Vive aquí o está de visita?" (C4's first pilot). The country is true everywhere.
- **Prompted by:** Josh, 2026-11-07: "does the learner live in every city they visit", "country is fine with me". Changed without a test on Josh's decision ("permission to just change beginner.md and character.md").

### 2026-10-21: the character can see whether they're talking to a woman or a man
- **Added** an optional line before the relationship block: "The person in front of you is a woman." (or "a man."), filled from the learner's record. Left out when it isn't known, so for every learner today the prompt is word for word 2026-10-18b.
- **Why:** nothing told the character the learner's gender, so it defaulted to the masculine: on the web on 2026-10-21 Dario said "benvenuto", "sei tornato", "il signore del panino" and "un uomo che sa quello che vuole" to Teresa, after she had corrected him ("Benvenuta, per cortesia"). That correction was lost because memory only runs after 2 learner lines, and memory is per character anyway. In Josh's 106 recorded conversations, 63 have a character using a gendered word for the learner. It's the learner's own agreement being modelled wrong ("sei stanco" heard daily teaches "sono stanco"). A real person sees who's in front of them, so this belongs on the learner, read by every character, not in one character's notes.
- **Not done yet:** how it gets set (onboarding or Settings, and a correction caught by the memory call); measured by `tests/experiments/archive/learner-address.mts`.

### 2026-10-18b: Josh's short prompt; no thinking before a reply
- **Changed:** the system prompt is Josh's shorter version: the traits line is gone, and "You are having a normal conversation with another person. It is very rude to dominate the conversation or correct pronunciation." is now "You are having a conversation. Don't talk too much or correct pronunciation." "Take turns. No more words after a question mark." stay. The first turn is "Someone approaches." (was "Someone has just walked up to you.").
- **Changed (code, `lib/turn.ts`):** the character no longer thinks before replying (thinking `between_tools`, this model's way of turning it off; `TURN_THINKING=on` brings it back).
- **Why:** speed. Timing live turns (`npm run measure:turn`) showed Claude was nearly all of the wait, and the slow turns were the ones where Sonnet thought first: 300-570 output tokens and 2.2-5.4 s to the first word, against about 150 tokens and under a second without. Replay, Italy, 25 conversations (Giulia and Rita left out): reply time 3.7 s -> 1.8 s, words 26 -> 16, opener 19 -> 10 words, lines a beginner can follow 29% -> 36%, 2+ questions 14% -> 11-13%. Cost: feels alive 6.0 -> 5.4 (the traits line made characters livelier but longer: putting it back gave 20 words). Garbled understanding (76-83% vs 81-86%) and replies that don't follow (0.2-0.4 vs 0.2) are within run-to-run noise. Tried and not taken: Haiku (1.3 s but 21% double questions, 0.5 broken replies, alive 4.8); Josh's second wording "Have a chat. Give them a chance to talk…" with "Hello" (22 words, 25% double questions).
- **Prompted by:** Josh's speed track (phase 1) and his short prompt, 2026-10-18; "take the best".

### 2026-10-18: the whole conversation, not the last 6 messages
- **Changed (code, `RECENT_TURNS` in `lib/prompts/build-turn-prompt.ts`):** each turn now sends the last 40 messages word for word instead of 6, which in practice is the whole conversation (real ones run a median of 9 messages, the longest 29). The wording of this prompt is unchanged; the version is bumped so conversations after the change can be told apart.
- **Why:** past the window the character's own earlier lines were dropped (only the learner's rode along), so it couldn't see that it had already introduced itself or asked something. Replaying the 7 longest real Italy scripts 3 times each, lines where the character repeats itself or asks what was already answered fell from 4.4% to 2.4% of its lines (0.52 to 0.29 per conversation); reply time and the rest of the replay scorecard didn't change.
- **Prompted by:** round 15 of the level tests: in Josh's real conversations the lowest scores were repeats, Giulia (alive 3) saying "Io sono Giulia, piacere. Di dove sei?" five times and greeting him from scratch at the end; 15 of 28 real conversations ran past the window.

### 2026-10-12i: take turns, no words after question mark
- **Final guidance:** "Take turns. No more words after a question mark."
- **Removed:** "If you don't understand them, ask them to repeat or clarify." (dropped garbled 82%→67%)
- **Removed:** "Keep the conversation moving." (conflicted with stopping after question mark)
- **Changed:** "Stop after you ask a question" → "No more words after a question mark." (more explicit)
- **Why:** (1) "Ask to repeat" made characters stop and clarify instead of inferring from context. (2) "Stop after you ask a question" was ambiguous - 41% of turns still had 2+ questions. "No more words after a question mark" prevents multiple questions like "Lo bevi al banco? E ti porto un dolcetto?"
- **Prompted by:** Need explicit rule to prevent multiple questions while maintaining garbled understanding (100% when characters don't stop to ask for clarification).

### 2026-10-12h: minimal turn info - remove transcript and response instruction
- **Removed** full transcript from later turns
- **Removed** "Respond naturally as your character would" instruction
- **Changed** later turns to just: 'They just said: "{learnerSaid}"'
- **Why:** Testing hypothesis that giving characters too much information each turn encourages longer replies and over-thinking. Barebones approach: just tell them what was said, nothing else.
- **Testing both modes:** document (one message, no history) and recent (alternating messages, history in structure)
- **Prompted by:** Garbled understanding dropped 100%→71% and Josh noted characters get redundant info (learner's line appears twice, full transcript + instruction). Testing if less context = shorter, more natural replies.

### 2026-10-12g: wait for answer instead of enjoy back and forth
- **Replaced** "Enjoy the back and forth with the other person." with "When you ask a question, wait for the other person to answer."
- **Why:** 2026-10-12f showed 58% of replies had 2+ questions (vs ≤10% target). "Enjoy the back and forth" encouraged engagement but led to multiple questions per turn. "Wait for the other person to answer" addresses this as a turn-taking rule.
- **Prompted by:** Testing showed characters repeatedly asking name/location questions, sometimes repeating already-answered questions. Social framing for length worked (43.5→35.5 words), but questions increased (42%→58%).

### 2026-10-12f: social framing instead of commands
- **Removed** "You use {formality}." line (tu/Lei distinction)
- **Replaced** "Engage in a normal conversation. Do not correct pronunciation." with social framing: "You are having a normal conversation with another person. It is very rude to dominate the conversation or correct pronunciation. Enjoy the back and forth with the other person."
- **Why:** Frame conversation norms as social rules ("very rude") rather than commands. "Dominate the conversation" directly addresses verbosity. "Enjoy the back and forth" encourages turn-taking.
- **Prompted by:** Testing showed characters still verbose (43.5 words vs 20 target), asking multiple questions (42% vs ≤10% target), and teaching despite prohibition. Trait reduction (5→3→1) had minimal effect. The issue appears to be roleplay instincts overriding "normal conversation" instruction.

### 2026-10-12e: plain baseline - radical simplicity
- **Simplified** setting: removed "Right now you are here:", just "{setting}" on the identity line
- **Removed** garbled text explanation (test if "normal conversation" covers inferring meaning)
- **Removed** {english} ability statement ("You speak fluent/basic English")
- **Replaced** verbose speech-to-text explanation with "Engage in a normal conversation. Do not correct pronunciation."
- **What's left:** Identity with setting, personality (traits, formality), core instruction, memory when it exists, output format.
- **Why:** Test if radical simplicity beats elaboration. Remove everything that might not be needed and see what happens.
- **Predictions:** 
  - Pronunciation drilling stops (explicit prohibition)
  - Reply length may improve (from "normal conversation")
  - English usage may drop (no longer prompted about English ability)
  - Garbled understanding may stay high (or drop, telling us we need that line)
- **Prompted by:** Replay test showed pronunciation drilling despite explanations, and 42-word median replies vs. 20 target. Testing minimal intervention.

### 2026-10-12d: reply field `line`, formality words from the language
- **Renamed** the reply's JSON field from `"it"` to `"line"` (the `{ line, en }` reply). The field was named after the Italian language code; `line` works for every country pack.
- **Formality** now comes from the character's formal / informal setting plus the pack's words (`language.formality`), so the prompt still reads "Lei (formal)" or "tu (informal)" for Italy.
- **Why:** Mexico phase 1, get Italian out of the code (docs/mexico-version.md). Only the field name changed for Italy; replies should not change.
- **Prompted by:** Josh, starting the Mexico plan with "Italian out of the code".

### 2026-10-12c: language name from content, not the template
- **Changed** "what you say, in Italian" to "in {language}", filled from `content/it/language.ts`. The system prompt Claude gets is word-for-word the same as 2026-10-12b. The reply schema's description of `it` no longer names the language ("what the character says, in the language the person is learning").
- **Why:** templates must not name the language ("Keeping other languages possible"); the new `npm run test:language` check found this one.
- **Prompted by:** Josh asking for the rule to be enforced after the Whisper hint slipped through.

### 2026-10-12b: characters can't hear pronunciation
- **Changed** the speech-to-text line: characters only get the words it wrote down, so they can't hear accent or pronunciation, and odd spellings are the transcription, not how the person said it.
- **Why:** in Josh's real conversations of 2026-10-12, Rita drilled "ca-cio e pe-pe" and Rosa drilled "al-bi-coc-ca" and "pez-zet-to": they were correcting Whisper's spelling as if it were his accent. A factual fix (docs/10-testing.md: factual fixes go in without the before-and-after test). Word corrections and explanations are untouched: Josh finds one or two corrections a conversation helpful, and asking about a word naturally leads to some teaching.
- **Added** the block "Later turns: earlier in the conversation", used only by the `TURN_HISTORY=recent` variant (off by default), so the default prompt is unchanged apart from the line above.
- **Prompted by:** analysis of Josh's first recorded conversations (Rita, Rosa, Giulia), 2026-10-12.

### 2026-10-12: relationship filled from character memory
- **Moved** the `{relationship}` wording out of code into two blocks here: "Relationship: first meeting" (unchanged: "You haven't met them before.") and "Relationship: met before" ("You've met them twice. The last time was yesterday. You remember: …").
- **Why:** character memory is built (M1). Notes are written when a conversation ends (`content/it/prompts/memory.md`) and come back here on the next visit. The prompt for a first meeting is word-for-word the same as 2026-10-11b, so conversation-test baselines still compare.
- **Deliberately not added:** any instruction on how to use the memories ("greet them by name", "mention last time"). Same principle as the rest: describe what the character knows and let them act like a real barista would.
- **Prompted by:** roadmap Now #2, finishing M1 memory.

### 2026-10-11b: relationship slot instead of "new to the neighbourhood"
- **Replaced** "They're new to the neighbourhood." with a `{relationship}` line, currently always "You haven't met them before."
- **Why:** "new to the neighbourhood" claims more than the character knows, and becomes false once memory exists (by the third visit Giulia knows you). "You haven't met them before" is true today and doesn't cast the person as a newcomer, tourist or student.
- **Next:** character memory (M1) fills the same slot with visit count and remembered notes, so memory needs no further prompt change.
- **Prompted by:** Josh, reviewing 2026-10-11a: "This may also be dubious, esp with memory."

### 2026-10-11a: describe the situation, not the behaviour
- **Added** "This is a real, face-to-face moment. Your words are spoken aloud and heard, not read." Without it Claude treated each turn as a written reply and produced complete, informative paragraphs.
- **Added** "They're new to the neighbourhood." Gives characters a reason for friendliness and curiosity, and sets up belonging (the learner persona is a newcomer staying a while, not a tourist).
- **First turn** is now "Someone has just walked up to you." (was "Start the conversation."). A moment, not a task; with no situation, characters filled the gap with self-introductions.
- **JSON field** described as "what you say" instead of "your reply".
- **Deliberately not added:** "They're learning Italian" (turns characters into teachers), "a foreigner" (turns them into tour guides), any length limit (Josh: wary of prescriptive dialogue).
- **Prompted by:** phone testing. Marco Alberti (archeologo, Siracusa) opened with five sentences introducing himself and the Greek Theatre; Rosa (fruttivendola, Firenze) opened with four. Josh spotted that "learning Italian" / "foreigner" in a draft would make it worse.

### 2026-10-10 (laptop session): radically simple
- Replaced a ~400-line, six-layer prompt and 10-field output with a short character prompt and `{ it, en }`. See `docs/archive/M1-CONVERSATION-MODEL.md`.
- Later that evening: added where the character is (`Right now you are here`), "hearing speech, not writing", and briefly "Say things once…" and "Never comment on spelling"; the laptop session then trimmed the prompt back to identity, setting, traits, formality, speech-to-text and English ability.
