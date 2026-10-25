# Scaffolding

Rewritten 2026-10-22 (Josh: "rewrite docs") into one current picture. Three plans were stacked here (17, 19 and 21 October), each replacing part of the one before, and the doc called scaffolding steps "levels"; the earlier plans are now under [History](#history) at the bottom. Research: [research/beginner-mode-scaffolding.md](research/beginner-mode-scaffolding.md), [research/flashcards-vocabulary-review.md](research/flashcards-vocabulary-review.md). The Diario: [diario.md](diario.md).

## The words (Josh, 2026-10-21; [glossary.md](glossary.md))

- **Level** is only the learner's level: Beginner, Intermediate, Advanced. It mainly sets how complex the dialogue is.
- **Scaffolding** is the support that gets a new learner used to the game: onboarding, the reply buttons, and the stages that follow, up to the stand-alone microphone. Its steps are **stages**, never levels.
- Beginners start with scaffolding, but the two are separate: finishing scaffolding doesn't make anyone Intermediate.
- **Scaffolding isn't a setting.** The game decides when you see it, by counting (`lib/scaffold.ts`), not by a judge or a switch. The rules and the full set of stages aren't settled yet.

**The reply panel (Josh, 2026-10-22; built the same day):** the reply buttons became a panel of suggested answers as text, "read one out loud" above the usual mic, no tap stage, no Pause. Spec and screens: [reply-panel.md](reply-panel.md).

## Beginner level dialogue: spoken English framing, Italian in bubbles (Josh, 2026-10-24; a new idea, not decided)

### Goals (Josh, 2026-10-25)

What Beginner level dialogue is for. The trial prompt is written against these, and replays are measured on them.

**What the learner gets from each conversation**
1. **Know where they are, and who they're talking to.** The first turn says in English, in one line, what this place is and what's special about it, and the character introduces themselves by name (maybe asking the player's), before any question in the language.
2. **Take away a few words and phrases:** one or two worth keeping per conversation, explained in English and used again later in it.
3. **Say whole sentences:** a question invites an answer that reuses its words, and the character offers that answer.
4. **Always be able to answer.** Every question comes in English first, then in the language. Questions avoid plain yes/no and prefer ones that make you use a useful verb (*Le piace…?* → *Mi piace…*; *Vuole…?* → *Vorrei…*), or one of two, or one fact. The polite form with a stranger unless the character already uses the familiar one.

**How the character talks**
5. **English as support, heard not shown, and brief:** a sentence or two to set the scene, then the language. No lectures (not what goes into carbonara, the kinds of pizza, how the bread differs); one interesting detail at most. Each phrase in the language gets its own bubble (a single word can sit inline), its English a tap away.
6. **Language a beginner can follow:** short, common words, present tense; the aim is 90% of words at the learner's level.
7. **One thing at a time:** at most one question per turn. **The first turn may be the longest** (the place, the introduction, the first question); after it, turns stay short (Josh, 2026-10-25).
8. **Still a person in a place:** helpful in role, not a teacher with a lesson plan.
9. **True facts about real places, or none.** Places carry only a name today, so this may need a short checked line per place.

**How it changes over time**
10. **The English fades:** a lot in the first conversations, then less, then only when asked; decided by counting, not a judge.
11. **Help still works:** asking in English still gets help (the character, or say it in English).
11b. **Help to close (Josh, 2026-10-25):** when the errand is done, the character offers the goodbye as a phrase to reuse (*Grazie, arrivederci!*), so a beginner can end the conversation properly; their goodbye ends it (the goodbye rule, N5).

**How we'd know it works**
12. **Measured on replays:** words at level, questions per turn, an answer offered for each question, the place described first and the character introduced; then Josh reads them side by side with today's.

Named by Josh, 2026-10-25 (it was "Beginner guides"): it's how the Beginner level talks, so it's level, not scaffolding (docs/glossary.md: level sets how complex the dialogue is).

Josh: a lot of beginners walk into a place with no sense of where they are or what's special about it. For Beginners, characters could teach explicitly, mixing English and the language: a little English framing makes the place interesting, then they switch to the language to ask a question, first saying in English what the question is.

- **Spoken English, Italian in bubbles (Josh):** the English is only heard, never shown. The words and lines in the language appear as bubbles as they're said. The English translation isn't shown, or a tap on a bubble reveals it.
- **The welcome always describes the place (Josh, 2026-10-24):** the character's first turn always includes, in English, what this place is and what's special about it (the market, the café, the neighbourhood), before the first word or question in the language. Places carry only a name, kind, neighbourhood, `real` and an image prompt, no description, so today the character would draw on what it knows and the image prompt. For real places that risks made-up facts; a short hand-checked line per place, or a "what's special" field written with the pantry, may be needed.
- **A turn could run:** framing in English (a sentence or two: where you are, what's special), one or two words to keep said in the language, then the question in English, the question in the language, and how to answer. Sergio, Venice: *"Welcome! Everything on my counter came in from the lagoon this morning. The Venetian thing is **le seppie**, cuttlefish, cooked black in their own ink. Now let me ask you: have you ever eaten them? **Ha mai mangiato le seppie?** You can say **Sì, ho mangiato le seppie** or **No, non ho mai mangiato le seppie**."* Bubbles: *le seppie*, *Ha mai mangiato le seppie?*, and the two answers.
- **Teach like a good teacher (Josh, 2026-10-24):** the answers it offers are whole sentences that reuse the question's words, so the learner practises the verb and the structure: *Sì, ho mangiato le seppie* / *No, non ho mai mangiato le seppie*, not *sì* / *no, mai*. The same for every question: *Le piace il pesce?* → *Sì, mi piace il pesce*.
- **Sketches:** canvas "Learn area", row E (E1 while he speaks, E2 your turn with a bubble tapped).
- **Against today's rules:** CLAUDE.md says characters teach only in role and avoid English nobody asked for, with explicit lessons in Magda or Learn. This would change that for Beginners only; CLAUDE.md stays as it is until Josh decides.
- **Open:** whether the answers are bubbles or only said by the character; how the English fades (counted, like the stages: mostly English in the first conversations, then less, then only when asked); the reply shape (spoken text plus the bubbles, instead of `{ line, en }`); the voice (ElevenLabs can speak English with the character's accent; the phone's fallback voice speaks one language); how it sits with the reply panel and say it in English.
- **To try first (Claude's suggestion):** a Beginner block in `levels.md` for each country, replayed on real Beginner conversations against today (how much is English, is the question clear, could a beginner answer, does the character still feel alive), a row in prompt-trials.md, then Josh reads a handful side by side.

## Say it in English: the one scaffold in the game (Josh, 2026-10-23; direction, to test)

**Decided with Josh, 2026-10-23 (conference), built the same day:**
- **For everyone,** every level: English help isn't only for Beginners.
- **One tap per turn, for everyone:** tap the green circle to talk, English or the language; **silence sends it** (2.5 s, Josh; a tap sends early); terracotta while it's sent. If it was English, the line in the language comes back and **the mic reopens by itself** (green, listening; up to 20 s for the first word, since reading a new line takes a moment); the reading ends on silence and goes to her as any turn; she answers; the circle is green again and waits for the next tap. The only time the mic opens without a tap is for that reading. Under VoiceOver a tap still starts and ends each turn.
- **Hear it is a tap, not automatic** (Claude's recommendation, 2026-10-23): reading it first is the better practice and keeps the turn quick; the speaker beside the line plays it in the phone's own voice (it's the learner's line, not hers), with the mic closed while it plays, then reopens. If beginners read too badly for the characters to follow, switch to automatic for Beginners.
- **How English is told apart:** `/v1/transcribe` mode `turn` lets Whisper name the language: English → say it; the learned language → the turn; anything else (accents get misnamed) is transcribed again as the learned language. No phrase lists. A mixed sentence that Whisper calls English gets a clean line back, which is the right outcome.
- **The line:** `POST /v1/say-it` (`lib/say-it.ts`, prompt `say-it.md`): the gist at the learner's level, one short sentence for beginners, fitting her last line; "I didn't understand" comes back as the help phrase. Trial: level 100% in both countries, never mixed language, 1.4–1.7 s (docs/prompt-trials.md).
- **On screen:** grey bubble "*Come si dice:* (what they said)" (the label from content, `ui.howToSay`), then "Say this: **line**" with the speaker, on the learner's side, above the circle (`SayItBubbles.swift`). The reply panel stays for now and hides while say it is showing.
- **Not built yet:** the Beginner hint in her opener (G1), Claude's take for spoken Italian, the character closing the conversation.
- **One step at a time (Josh, 2026-10-23):** first, English gets help: what you say in English comes back as a line to read. Correcting your Italian is tabled: Italian goes straight to the character as said (since 4030210, also when Whisper mislabels it English), with no bubble. The bubble for spoken Italian, recasting and live corrections wait until the English step works.
- **It replaces every click-to-answer scaffold (Josh, 2026-10-23):** the reply buttons, the answer panel and its stages, and answers as buttons (under VoiceOver or with the mic off) all go once say it is settled; Fuori is voice only (D6). Onboarding keeps its buttons.
- **Characters' help doesn't change (Josh, 2026-10-23):** a character still helps in English when asked, as CLAUDE.md says; say it sits beside that.
- **How that works (Josh, with the laptop session, 2026-10-23):** commit to the direction and make it work, no "help in English" button as a hedge (Josh: "better to decide these are good and work to make better"). The mic sorts it out, one tap per turn:
  - English, or mostly English → the two bubbles (grey: what was heard, from Whisper as is; white: "Say this:" the line from `/v1/say-it`, with a play button in the phone's voice); the mic reopens for the reading; the reading goes to her, never checked again (4030210).
  - Italian, mistakes and all → straight to her; she recasts in role, as today (say-it's `sendAsSaid`, "when in doubt, the character"). Learn lists the mistakes afterwards.
  - Tabled: Italian with mistakes coming back as a corrected line. Talked through: a setting ("Correct my Italian"), or smart with no setting ("would she understand you?": correct only what she wouldn't follow). Not now.
  - On hold: showing the grey bubble as soon as Whisper returns (~0.5 s) instead of with the line (~2 s). Whisper often calls a learner's Italian English, so it would flash "*Come si dice:* (their Italian)" and then vanish when say-it sends it to her as said. Revisit once telling English apart is more reliable.
- **Open (Josh, 2026-10-23):**
  - *Routing mixed-language input:* which English is "turn this into a line" ("I'd like two coffees"), which is a question to her ("how do you say receipt?", where she helps as today), and which is their own attempt with an English word in it ("vorrei the receipt").
  - *Whether to tell the character the line was read:* she hears it as an ordinary line, or knows it was the game's line read aloud (no recasting it; maybe a word of praise).

Josh: "inside the game we can simplify all the scaffolding to just be say it, get this language back, read it." Onboarding is separate and keeps its buttons ("treat onboarding different in every way").
- **The direction:** in conversations, scaffolding is only "say it in English" (below): say what you mean in English, get one line back in the language at your level, read it out loud. The two answer bubbles, the stages and the read-aloud panel built 2026-10-22 ([reply-panel.md](reply-panel.md)) would go. The panel stays until the new loop has been played.
- **The mechanic (Josh):** speak English into the mic → a line in the language comes back to read aloud. **Where it shows is open:** a bubble in the conversation, or a sheet (Josh: "or we could redesign to use sheet"). Claude's view: the sheet, i.e. the reply panel built 2026-10-22 with one line instead of two. The instruction sits by the mic, a "hear it" control fits there, and a sheet reads as "to say" while bubbles read as "said".
  **Josh prefers the bubble (G2), 2026-10-23,** with what you said in English in its own grey bubble, and the Italian bubble to read below it with no English repeated in it (Josh: "It showed English in own bubble. Good. It doesn't repeat in the bubble to read."). With the one-tap turn the mic has already reopened for the reading (the hands-free ring). Words (Josh, 2026-10-23): the grey bubble reads "*Come si dice:* I'd like…", the Italian bubble "Say this: *Vorrei…*", the two labels styled the same (inline, muted, same size) so the pair reads as English → Italian; nothing sits above the mic. The hint moves into her bubble (Josh, 2026-10-23): for Beginners, her opener in every conversation ends with a line under her English, a small mic and "Answer in Italian or English" (G1); her later lines don't. The words are interface text, with the language name from content. His concern: how often the English is transcribed wrong. Plan: measure it (below) before building.
  **Spoken Italian gets a bubble: try it (Josh, 2026-10-23).** "Cleaned up Italian is good. Garbled no. Key would be show Claude's take, not Whisper's." The bubble shows what Claude understands the learner meant, in clean Italian at their level, not Whisper's raw text and not word for word (Josh: "Not sure about keep words. Someone could babble or complicate."): rambling or over-complicated speech comes back as the gist, said simply. When Claude can't tell what was meant, no bubble. Test before building: run logged learner turns (Josh's family, from the database) through a short prompt that writes the take, and Josh reads Whisper's text and Claude's take side by side. If it holds, build it as a small call running beside the turn, so her voice isn't delayed. Row in `docs/prompt-trials.md` when it's run.
  Mock-ups: canvas "Reply buttons", row G ([G1](../design/say-it-in-english/G1.png) your turn, [G2](../design/say-it-in-english/G2.png) bubble, [G3](../design/say-it-in-english/G3.png) sheet).
- **One tap per turn (Josh, an idea):** "mic for English, mic for reading might feel awkward." Tap the mic once to start; the turn then runs by itself (your English ends on silence, the line comes back, the mic reopens for the reading, the reading ends on silence and is sent) and stops when she replies; tap again for the next turn. A hands-free that lives inside one turn, and maybe the default for everyone. Care: the reading's mic must wait for speech to start (a learner may take a while to read the line) and stay closed while "hear it" plays; interruptions still leave you on your turn with the mic closed.
- **The character closes the conversation (Josh, an idea):** "always give character final turn to decide done." She always has the last turn, and she decides when the exchange is naturally over (the coffee's paid for, the ticket's bought) and says goodbye in role. That gives the game the end it lacks today (a conversation ends only when the learner leaves, `markConversationEnded`), so the end-of-conversation offers, Learn and the memory pass get a real moment. Needs: a `done` signal next to `{ line, en }` from the character call (CLAUDE.md keeps the reply to `{ line, en }`, so Josh's call), a prompt trial so she doesn't close too early or never, and the learner can leave first.
  - **When she closes, it's over (Josh, 2026-10-23):** "I'd let the learner leave early but not continue. The mic goes away and some success / finish link works later like a back button." After her goodbye the mic is replaced by a finish link (wording and look open) that leaves like Back, through the one leave function. The learner can leave early any time; they can't continue past her goodbye.
  - **The obvious trigger: the learner says goodbye (Josh, 2026-10-23: "Or after the player says goodbye, most obvious").** She answers with her goodbye and the conversation ends. The character call recognises the goodbye, in any language and phrasing (no word lists, CLAUDE.md), and sets `done` with her last line. That also teaches the leaving phrases, and it removes most of the risk of her closing too early.
- **Risks to test** (Claude's assessment, 2026-10-23):
  - **Mixed speech.** Beginners say "Sì, I want un caffè". Whisper names one language per recording, so a mixed sentence may go straight to her. The test is whether a judge on the transcript (is this the learner's language, fully?) is fast and reliable enough.
  - **Reading a line you've never heard.** Beginners mispronounce Italian they've only seen. Playing the line in the character's voice first, or a tap to hear it, may be needed.
  - **No recall.** Reading back is repeating, not producing. Fading has to come from the learner taking the wheels off: try in Italian first, the line only if stuck, then hidden after a glance.
  - **Comprehension** is probably fine: to say something sensible you have to understand her, and "I didn't understand" said in English comes back as *Può ripetere?*, the help phrase itself.
  - **English transcription errors.** Fuori uses `whisper-large-v3-turbo` on Groq. Published English error rates for clean read speech are low, but real-world audio is worse, and Whisper is known to invent text on silence. Short phone clips from learners haven't been measured. The transcript shows in the grey bubble, so the learner sees a wrong one and can say it again. The line writer can also fix small slips from context ("corn net" → *cornetto*). To measure: record 30–50 typical English requests on Josh's iPhone, run them through `/v1/transcribe`, count the ones that come back wrong enough to change the Italian.
  - **The line at their level,** not a literal translation (prompt work). Josh, 2026-10-23: a beginner who says something C1 in English gets the gist in beginner Italian, not a C1 sentence; babble gets the point, briefly.

## Proposal: training wheels the learner takes off (Josh, 2026-10-22; direction agreed, details not decided)

**What prompted it:** watching new learners, they need the scaffolding for the whole session, maybe much longer than planned. The fixed schedule (three turns in each of the first three conversations) drops them too early. So the learner takes the wheels off when they're ready, instead of the game pushing.

| Step | What the learner sees | How they move on |
|---|---|---|
| **0 · Explain once** | A panel that explains how it works ("You'll see two answers. Read them and choose yours, then tap the mic and say it out loud") and a **Next** button (Josh: panels explain how it works) | Tapping Next |
| **1 · Two bubbles, with English** | Her line in a bubble on the left, two answers as speech bubbles on the right (canvas D6: Josh, bubbles show "speech"), Italian with the English under it | Offered: "Want to try without the English hints?" Yes, or keep them |
| **2 · Two bubbles, Italian only** | The same, without the English | Offered: "You can read a line or answer on your own" |
| **3 · Bubbles as a suggestion** | The bubbles stay; the mic takes anything said | Offered: "Ready to go all in?" |
| **4 · The mic alone** | Today's game | A learner can step back down (Settings) |
| **Any time · Say it in English** | Say it in English → it comes back as an Italian bubble with the English → say it in Italian | Always available, at every step |

Decided in conversation (Josh):
- **Offer at the end of a conversation**, not mid-turn. There's no great measure of the end yet; the reliable signal is leaving (every exit goes through one leave function), so the offer can come as they leave or as the next conversation opens.
- **No fixed count.** "Many beginners aren't ready to move on"; the right number of turns isn't known. Default is to stay; an offer that's declined comes back later rather than once only.

Open:
- **Listening still has to count.** With two good answers a learner can read the bubbles and skip her line. Keep a step where only one answer fits (the old choose stage), so they must understand her to pick.
- **What earns an offer:** turns at a step, or evidence (answers read aloud smoothly several times running). The logs from the first family testers should show where people start to cope.
- **Say it in English** can become a crutch (say it in English, read the Italian back). Still better than picking from two, since the learner decides what to say.
- **Explain screens get skipped:** the first real turn should still make the mic obvious.
- Replaces the fixed schedule in `lib/scaffold.ts` and the read-aloud panel built 2026-10-22 ([reply-panel.md](reply-panel.md)) once decided.

### Say it in English: maybe the main beginner loop (Josh, 2026-10-22; an idea to test)

Josh: "the say it in English to generate the Italian bubble, that you have to read, could change the game play quite a bit."
- **How it works:** the learner says what they want in English; it comes back as one Italian bubble (with the English) at their level; they read it aloud and that's what she hears. If they speak Italian, the turn goes straight to her as now. Whisper reports each recording's language, so no phrase lists.
- **Why it could change the game:** the learner leads the conversation instead of picking from two lines; the words are ones they wanted, so they stick, and they feed Learn and the flashcards; the characters stay fully Italian, since the translating moves out of the character into the interface. It may replace the two bubbles after the first turns: two bubbles are the training wheels, "say it your way" the game.
- **Care:** the Italian must be what a learner at their level can say, not a literal translation (a prompt job; the level judge can check it). English-first can become a habit; the end-of-conversation offers move them on.
- **Speed (laptop measurements, 2026-10-22):** tap to the character's first word, Italy median 3.3 → 2.5 → 1.9 s, Mexico 1.7 s, with the first sentence streamed. The Italian bubble is one short line, so English → bubble should be about 1.5 s (transcribe ~0.5 s, the line ~1 s, streamed); the rest of the turn is as fast as any turn. The added time is mostly the learner reading the line, which is the practice.
- **Next:** a rough version to play (when Whisper hears English, one short call returns the line at the learner's level; show it as the bubble to read), then Josh and a family beginner play a few conversations before deciding.

## The sequence a new learner meets

| # | Step | What happens | Status |
|---|---|---|---|
| 1 | **Onboarding** | Choose a country; the greeter asks two things, answered by button or voice; she places you at a level | Built ([onboarding-design.md](onboarding-design.md)) |
| 2 | **Read one out loud** (stage `read`) | Two good answers shown as text; tap the mic and read one out loud; what was heard is sent | **Built** 2026-10-22 |
| 3 | **Read the one that fits** (stage `choose`) | Only one answer fits; read that one out loud | **Built** 2026-10-22 |
| — | ~~Tap a reply~~ | Built 2026-10-21, dropped 2026-10-22 (Josh: too simple, doesn't prepare you for what comes next) | Gone |
| 5 | **The microphone alone** | Speak freely; today's game | Built |

In each of the first 3 conversations: read, then choose (one turn each), then the mic alone; from the 4th, the mic alone.

## 1. Onboarding sets the level

Onboarding is where the level comes from: the greeter's send-off judges your answers and stores Beginner, Intermediate or Advanced (`lib/onboarding.ts`; the app shows it while `/v1/me` says not onboarded). A second source exists: the level check after each conversation (`lib/learner-level.ts`), but it's **off** unless `LEVEL_CHECK` is set, and it isn't set on either service.

**No level yet counts as new (Josh, 2026-10-22).** If onboarding is skipped or reset (Settings → touch and hold Version → Restart onboarding) and never finished, the learner has no level. That learner gets the reply buttons, like a Beginner. Found when Josh's Mexico learner had no level (onboarding reset, `{"path":"reset"}`) and so never saw the buttons.

## 2–3. The reply panel: read, then choose (built 2026-10-22)

**Who:** a learner whose level is Beginner or not set yet. Never Intermediate or Advanced; never with Magda, whose lessons don't count either.

**When (Josh, 2026-10-22):** in each of a new learner's first 3 conversations, their first two turns show the panel, one stage each, then they speak on their own for the rest of that conversation. From the 4th conversation on, the mic alone.

| Learner turn in conversations 1–3 | 1st | 2nd | 3rd on |
|---|---|---|---|
| Stage | read: two good answers | choose: only one fits | mic alone |

`STAGES` and `SCAFFOLD_CONVERSATIONS` in `lib/scaffold.ts`; one turn per stage is Claude's starting point. Conversations count from the first, or from `learners.scaffold_from` (a restart), ones where they said something, Magda's not counted. History of the schedule: 4, 3, 2, 1 taps over 12 conversations (2026-10-21); tap, read, choose (earlier on 2026-10-22); read, choose (now).

**How it works** (screens and layout: [reply-panel.md](reply-panel.md)):
- The server decides with every line: `/v1/turn` returns `replies: true` and `stage` (`read`, `choose`). The app holds no switch.
- The answers come from a separate call, `POST /v1/replies` (`lib/replies.ts`, prompt `replies.md`), written while the character's voice plays, so the turn stays `{ line, en }`. On `choose`, replies.md's Choose prompt writes one that fits and one that's correct language but answers a different question; `fits` says which (trial: 92% Italy / 85% Mexico pass every check, `docs/prompt-trials.md`).
- They show after she finishes, as text in one panel with their English, above the usual mic. **The mic works as everywhere** (Josh: "the mic works the same way"): tap, read (green), tap to send (terracotta), and what Whisper heard goes to the character, who answers whatever was said, in role. No matching against the answers.
- **First time ever** (kept in the app, `scaffold.answersIntroduced`): one extra line, "To get you started, here are two answers.", and the instruction "Tap the mic, then read one out loud"; later "Tap, then read one out loud".
- **Under VoiceOver or with the mic off,** the answers are buttons that send the line.
- While scaffolding, the answers and the character's line show English, whatever Settings says. No Pause and no Learn link in the panel.
- A failed replies call: the panel doesn't show, the note says to answer in your own words, and it's logged.
- Tests: `npm run test:scaffold`, `npm run test:replies-prompt`, `npm run test:replies-route`, `smoke:live`.

## Not settled (Josh's to decide)

- **Whether anything moves a learner back** (a learner who struggles after conversation 3).
- **The full set of stages.** Candidates from earlier plans, none chosen: less English step by step (English on her line only, then none); fill the frame ("Vorrei ____", speak the rest your own way); a "Less help" button the learner can press.
- **The numbers:** one turn per stage, three conversations.
- **English under the character's line.** On 19 October Josh decided no translation line at any level, the English to come in the dialogue and on the buttons, once characters reliably give English when asked what something means. What's built shows English on her line while scaffolding. Which holds?
- **Whether the level check turns on** (`LEVEL_CHECK`), so a learner's level can move after onboarding rather than resting on two answers.

## Rules that still hold (from the 17 October plan)

- **Every reply is a whole line** built on a frame, never a lone word.
- **Every turn the character asks something,** since the replies need something to answer.
- **No Replay (Josh, 2026-10-17).** The words are on screen while scaffolding; once speaking, the learner can ask the character to repeat ("Ripeti?", "Più lentamente"), which stays in role.
- **No Pause** (Josh, 2026-10-22: none anywhere, [bottom-bar.md](bottom-bar.md)). In tap-to-talk the mic already waits for a tap.
- **Few controls.** The answers sit above the mic circle; nothing appears or disappears except the result of your answer.
- **Largest text size (AX5):** the portrait stays put; the area above the controls scrolls within a capped height. The replies may cover most of the portrait at that size.
- **Wording:** any instruction ("Read your line out loud") is interface text, worded per country; target-language words come from `/v1/content`, never from Swift.
- **Writing the replies** stays a separate call unless a test shows folding them into the turn is better for latency and quality ([test-ideas.md](test-ideas.md)).

## Idea: a Done link (an idea only, Josh 2026-10-20)

Josh, 2026-10-19: "the beginner buttons really need a done button/link". It would fade in when the conversation is over, the same link and rule as for every learner (roadmap → Ending a conversation, round 20), and leave through the one leave function; its word from `/v1/content`. For a beginner to get there, the replies must be able to close a conversation: once the errand is done, one of the two replies is a goodbye or thanks (`replies.md`; test before building, since in round 19 no Mexico learner reached an end).

## The Diario's cards

The Diario ([diario.md](diario.md)) reviews phrases from your own conversations on cards. The 17 October plan gave each phrase its own step on the five-step ladder below (card practice moves it up; saying it yourself in a real conversation retires it). That ladder is now history, so the card screens need restating against the current stages; the Diario's missions prototype comes first ([diario.md](diario.md) → Prototype first).

### What each phrase needs

Written by the end-of-conversation step (`lib/remember.ts`), stored with the phrase:

| Field | Example |
|---|---|
| Frame, with its English | Vorrei… · I'd like… |
| Character, place | Giulia · Bar in Trastevere |
| Character's line, with its English | Buongiorno! Cosa prendi? · Good morning! What are you having? |
| Two whole-line replies on the frame, with English | Vorrei un cornetto integrale. · Vorrei un macchiato. |
| Character's answer to each | Un cornetto integrale, subito! · Un macchiato, arriva! |
| Audio | Character's line and answers in the character's voice; the replies in your voice |
| Stage | Where the phrase is in its practice |

## On hold: a scripted, smaller world for beginners (Josh, 2026-10-17; on hold until there's a spec, 2026-10-18)

Fixed scripts per character, the same for every learner, in one neighbourhood (Trastevere: 11 characters; Mexico City: 13 across four neighbourhoods) while the learner only taps; leaving the neighbourhood is the reward for speaking. Tests (rounds 11–13, [level-judge-test.md](level-judge-test.md)): cheap to write and the easiest dialogue yet (70–84% of lines a beginner can follow), but where both replies must lead to the same next line one path ignores the learner's answer, and forcing a this-or-that choice at every join made it a quiz. Costs: the open world, memory of the learner's own taps, their name without live audio. CLAUDE.md's "no scripted scenes" predates this and doesn't rule it out.

## Open questions

- Phrases that aren't frames (a noun like "cornetto integrale" on its own): either the end-of-conversation step always picks frame-shaped chunks, or such phrases ride inside a frame.
- Settings: Subtitles and English are overridden while scaffolding; Hands-free applies once speaking.

## History

**17 October: five steps ("levels 1–5"), replaced.** Each step changed only the screen, not how characters talk:

| | 1. Choose, all English | 2. Choose, English on the character | 3. Choose, Italian only | 4. Read out loud | 5. Fill the frame |
|---|---|---|---|---|---|
| Subtitles | Italian + English | Italian + English | Italian | Italian | Italian |
| Your side | Two replies, Italian + English | Two replies, Italian | Two replies, Italian | Your whole reply | "Vorrei ________" |
| Action | Tap | Tap | Tap | Speak | Speak, your way |

A second voice was to say your reply after each tap. Moving up: at 15 turns on a step, ask at the end of the conversation whether you're ready for less help; from 15 to 30 a "Less help" button; at 30 move up automatically, with Settings to step back; never down on its own. None of steps 2–5 or the moves were built.

**19 October: three "levels", partly kept.** 1. Character teaching (she teaches the line you need, in role, with taps at the start of each conversation that run out), 2. practising conversation, no taps, 3. today's game. Kept: the taps per conversation that run out (stage A's schedule). Dropped: character teaching as a separate step ([proposal-level1-teaching.md](proposal-level1-teaching.md), not chosen 2026-10-20); calling these levels (2026-10-21). Still open: no translation line (above).

**18–19 October: the first build,** behind a hidden test switch with a step picker (1–3) on the phone. Replaced on 2026-10-21 by the server deciding, with no switch.
