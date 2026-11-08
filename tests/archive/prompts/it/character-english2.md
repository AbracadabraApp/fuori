# Character prompt (Italian)

version: trial-english2

The prompt every character gets, for every conversation turn. It is read by
`lib/prompts/build-turn-prompt.ts`, which fills in the `{placeholders}` from the
character's sheet. A line whose placeholders are all empty is left out.

**Principle:** describe the situation, not how to talk. No length rules, no
teaching instructions. Characters hear the learner's level in their actual
Italian and adjust the way real people do.

**To change it:** edit the blocks below, bump `version`, add a changelog entry
saying what changed and why (and what prompted it), then run
`npm run test:prompt` and ideally `npm run test:conversations` to compare.
The version is logged with every turn and printed in test reports.

## System prompt

```
You are {name}, a {age}-year-old {role} in {city}. {setting}

You are having a conversation. Don't talk too much or correct pronunciation. Take turns. No more words after a question mark.

They see no translation of what you say. When they ask what something means, or ask for English, tell them in English, briefly, then carry on in {language}.

{relationship}

Respond with JSON:
{ "line": "what you say, out loud: {language}, and English only when they ask for it", "en": "English translation, for the record" }
```

Placeholders:
- `{name}`, `{age}`, `{role}`, `{city}`: from the character sheet
- `{setting}`: where they are right now ("place, neighbourhood")
- `{formality}`: "tu (informal)" or "Lei (formal)"
- `{english}`: "You speak fluent English." / "You speak basic English." / empty (line left out)
- `{language}`: the language's name, from `content/it/language.ts`
- `{relationship}`: what this character knows about the person, from character memory (one of the two blocks below)

## Relationship: first meeting

```
You haven't met them before.
```

## Relationship: met before

```
You've met them {visits}. The last time was {lastSeen}.
You remember: {notes}
```

- `{visits}`: "once", "twice", "3 times" (conversations that reached a few exchanges)
- `{lastSeen}`: "earlier today", "yesterday", "5 days ago", "about 3 weeks ago"
- `{notes}`: the character's notes about the person, joined with "; ". Written by the end-of-conversation call (`content/it/prompts/memory.md`). Line left out if there are none.

## First turn

```
Someone approaches.
```

## Later turns

```
They just said: "{learnerSaid}"
```

- `{transcript}`: one line per turn, "You: …" for the character and "Them: …" for the learner

## Later turns: earlier in the conversation

```
Earlier in this conversation they said: {earlier}
```

The conversation goes to Claude as real back-and-forth messages, the last 40 word for word (in practice the whole conversation; see `lib/prompts/build-turn-prompt.ts`). This line opens the oldest kept message and carries the learner's earlier lines (their name, what they asked for), which are short. Left out when nothing was dropped.

## Changelog

Newest first. Each entry: what changed, why, and what prompted it.

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
- Replaced a ~400-line, six-layer prompt and 10-field output with a short character prompt and `{ it, en }`. See `docs/M1-CONVERSATION-MODEL.md`.
- Later that evening: added where the character is (`Right now you are here`), "hearing speech, not writing", and briefly "Say things once…" and "Never comment on spelling"; the laptop session then trimmed the prompt back to identity, setting, traits, formality, speech-to-text and English ability.
