# The dialogue model

How a character and the learner talk to each other, in every conversation.
Decisions only, each with who decided and when; anything not listed here is
undecided, whatever the code does today (Josh, 2026-11-05: "user experiences
are intentional"). Today's behaviour, from the code: [dialogue-now.md](dialogue-now.md);
the work: [dialogue-plan.md](dialogue-plan.md).

## Principles

- **One pattern for all dialogue** (Josh, 2026-11-05: "i agree with the one
  pattern"). The learner's level sets how the dialogue works, in every kind of
  conversation; a kind only chooses its topic and when it ends.
- **Fixes are global** (Josh, 2026-11-05: issues like Jennifer's with Magda or
  his with Lorenzo "are global improvements not local to lessons or
  conversations or one country").
- **Intentional, no discovery** (Josh, 2026-11-05: "if something is in the user
  experience its there for a reason and doesn't need discovery"; "if we decide
  to show english its a decision, or suggest 2 answers rather than 1 or create
  a partial phrase"). No hidden taps or gestures.

## What we've learned

**In short (Josh, 2026-11-06): less is more; global solutions; emulate working models (Mexico's `here` lines); avoid scripting; instructions lead to repetition.** The lessons below are the evidence.

Lessons from play and measurement, each with what showed it. Read before
changing a prompt or a `here` line (Josh, 2026-11-06: "we need to keep track of
some principles of dialogue we've learned"). Results are in
`docs/prompt-trials.md`; the gate is `tests/experiments/variety.mts`.

- **Whatever is in the setting gets said, almost every visit.** The weather
  line went into 24 of 24 openers; Luisa's cappuccino line, Nino's closed
  kitchen and Mexico's café de olla come back on every visit (2026-11-06,
  Josh: "these planted lines echo"). So a setting says what the place is,
  not talking points; if something should come up only sometimes, give it
  odds, as the weather has.
- **Planted talking points don't work.** A pride line was ignored or
  forced (Pasolini dropped into a correction); written as "today" it became
  invented news (Luisa's derby score); a planted acquaintance was mentioned in
  0 of 38 conversations (2026-11-04). Facts in the setting work; rules about
  what to talk about don't.
- **A scripted sequence makes every conversation the same.** "Let the errand
  lead: what they'd like, how much, how it's served, paying, goodbye" made
  every shop the same transaction (65–79% of a Beginner's lines); removing it
  cut that to 51–60% (2026-11-06).
- **With nothing to sell, characters invent something to sell.** Tickets at
  a theatre and a park, a coffee on a park bench, a taxi driver taking a torta
  order. A role gets an errand unless the shared rules say it has none
  (2026-11-06, Josh: "this drift is a app wide problem").
- **The place's own thing beats national customs.** Mexico's lines (café de
  olla, the seven moles, Talavera) gave more town content and no clichés;
  Italy's thin lines filled up with "cappuccino only in the morning" and "pay
  first" at every bar (2026-11-06). Tipico, not stereotypical; storytellers,
  not salespeople (Josh, 2026-11-03).
- **Repeats come from memory, not content.** Even Nino, whose visits work,
  tells the menu dish by dish every time; the character doesn't know what it
  already told this learner (2026-11-06). Better lines don't fix that.
- **The kind of place matters more than the prompt.** Landmarks, open spaces
  and roles with little to sell talk about the town in 67–97% of visits with
  almost no buying; shops in 8–33% (Beginner, 2026-11-06). The cheapest fix
  for too much buying is fewer shops on the map.
- **Fix once, on the shared layer.** A patch in three `here` lines hid a
  problem every role has; the fix belongs in `dialogue.md` for every
  conversation, both countries (Josh, 2026-11-05 and 2026-11-06).
- **Shortest rule first.** Try the fewest words that could work before
  adding cases (Josh, 2026-11-06: "maybe as simple as stay in your role";
  "even that is repetitive").
- **Small tests first.** Try an idea on the two or three places that show the problem, one level, one or two visits; widen to the full gate only when it shows promise (Josh, 2026-11-06: "smaller tests that show promise before going broader").
- **Make sure the test can show the problem.** A simulated learner who asks for a ticket makes the character talk about tickets; a judge asked about "errands" counted Beto's "¿Quiere tacos o pizza?" as one, though he stayed a taxi driver (Josh: "he didn't change roles"). Test one fixed moment where the character alone decides, read every line before trusting a count, and pick approaches that differ in kind (a rule, a fact, a deletion) to learn the most (Josh, 2026-11-06: "every experiment should maximize learning, not results").
- **Fix by taking away, or by adding facts, not by adding rules about how to talk** (Claude's synthesis of 2026-11-12; Josh: "Im fine with you doing 1-10"). Every rule added that day turned into a habit: "mire" in an example became "Mire" every turn, Notice became "¿Lo ve?" again and again, the goodbye setup became two goodbyes. The removals held: the newcomer lines, the cassa line, the per-turn beat note. Don Chucho's replay needed facts (what the learner said), not an instruction.
- **Go structural only where the same patch keeps coming back** (same source). How a visit ends was changed about six times in three days, and repeating was patched four times; those two get a design (the character saying when it's winding down; memory that keeps the learner's words). Everything else stays a small removal.
- **Judge by a round of play, not one visit** (same source). Claude varies from visit to visit; a fault seen across several visits is a pattern, one weak visit is noise. Play a round, send the notes together, then sort what recurs from what happened once.
- **Measure against noise.** Run today's code twice before a change, one
  change per row, the same cases and judges, with prompt versions, commit and
  reply time recorded; a change counts only if it moves a number beyond the
  gap between the two runs (2026-11-06).

## What there is

- **Four kinds of conversation:** town, the welcome, Magda's lessons, cultural
  stories. *How do I say it* is a tool inside any of them, not a kind.
- **Levels:** the Beginner's six steps (the new Beginner, since 2026-11-12), then Intermediate, then Advanced. The welcome comes before there's a level.

## Decided

Sorted by subject 2026-11-12 (the entries unedited; a line in italics says where a later decision replaces part of one). The decisions of 11-10 to 11-12 were added the same day from progress.md, the plan and the changelogs, each quote checked against the written record.

### How we work

- **Feel first** (Josh, 2026-11-11): "the goal has to be does it feel right more than does it teach best". Teaching measures are guardrails; his ear decides, by listening ("listening is faster than reading and necessary").
- **Experiments only where the answer is unknown** (Josh, 2026-11-12): experiments are for creating information in an unknown situation; it's too early to optimize measurement where the information is already present. Product changes ship on his word with a changelog, judged by his play; a card only when a decision hinges on a number ("cards should be used for experiments - not product development"; CLAUDE.md).
- **Content and display are separate** (Josh, 2026-11-07: "We should separate content and display"). Content is what the character says, written by the prompt at every level: her words in each language, how much English, how hard the language, what she talks about, her question, the answers she'd accept, the English meaning of each phrase. Display is what the learner sees and hears of it, decided in code by level: how many answers are shown (or one turned into a frame), whether the English echo is spoken, whether and when a translation shows, bubbles, buttons, timing. The prompt doesn't mention the screen. Today's Beginner stages mix the two (answers two/one/frame and the echo are display; how much and how hard the language is content); separating them points to one prompt with one dial for the language, and display rules per step. **Decided as the goal, not the build** (Josh, 2026-11-07: "while decided as goal it still needs to test into implementation"): the separated version replaces today's stages only after it wins a test against them (docs/prompt-testing.md → queue, CD1).

### A visit

- **Culture first** (Josh, 2026-11-12): "learning culture is more important than language in this game. Its easier and drives interest. No one is going to head to mexico weillding beginner level spanish.. But knowing geigraphy, culture, food, tradition is useful." CLAUDE.md's opening line puts language and culture side by side; whether it changes is Josh's call.
- **The intro is a rest** (Josh, 2026-11-12): "learning a language is exhausting, the intro refined is a passive exposure before returning to Dora the Explorer." So the intro is judged as good listening (a story, something concrete and new), not by how many turns the learner takes.
- **The intro opens a visit** (Josh, 2026-11-11; his mockup): the character sets the scene in the language with English subtitles, about what the place is known for, "cultural points first, 30 s fine, not 45 with biography", and ends on a question that comes out of what was told ("'are you visiting' after a cultural intro is a stinker"). At Intermediate and every Beginner step. At Beginner the question is short (intro.md 12b, the screen session, on his yes).
- **A conversation is bids** (Josh, 2026-11-12): "A conversation is all about bids… every turn is an opportunity to bid/accept"; "Character makes a bid. Learner accepts and makes their bid. Character accepts, repeat"; "if the bid stinks it doesn't get accepted"; at Beginner "the learner bid is continuing to play". Variety in the kind of bid, not "this or that?" every turn ("It's like Dora the Explorer", 2026-11-11). In the prompts: "Take up what they just said before you add anything of your own" (character.md 12a); new kinds of question one at a time, Notice first (scaffolding.md 12d). Detail: dialogue-structure-reference.md § 1a, § 2a.
- **The beats go to the character once** (Josh, 2026-11-11, "go", on the cloud session's critique): a note on every turn made every turn the same; the director speaks only on "answer first" when they asked something.
- **How a Beginner visit ends** (Josh, 2026-11-12: "c - good, a good enough, change 8 to 7"): when the talk has run its course, the character winds down and the answers become goodbyes (scaffolding.md 12e); the goodbye on the 7th turn as the fallback. A goodbye with a name or a thanks still ends it (dialogue.md 12a).

### The Beginner

- **"Questions to ask" stays, about what the character just said** (Josh, 2026-11-12: "I appreciate variety, but also coherent play"; "yes" to keeping it with that change): on some Beginner turns the character asks nothing and the learner gets two questions to ask, which come out of what the character just told them (scaffolding.md 12g). The exception to "every turn ends on a question" below.
- **The Beginner is the new Beginner** (Josh, 2026-11-12: "the sooner we cut over the clearer this will be"): every Beginner plays it, on six steps; the old one behind the hidden switch for a week.
- **Step 1 is the English frame** (Josh, 2026-11-10, on the frame-mix lines: "These are strong. For early learners - these are better than the echo or summary"): mostly English with the language slotted in, each phrase with its English beside it. Short (Josh, 2026-11-11: "Everything is basically too long"): one or two phrases a turn, two short sentences, then the question (scaffolding.md 12b).
- **Answers to say back** (Claude's proposal; Josh, 2026-11-05: "fine"): the
  question decides the form, two real choices or a frame about the learner;
  never a single answer to read out (it can put words in their mouth); the
  stages fade the help (S1 the most, S4 none); the character models the
  sentence in her own line. In Magda's teaching she says the phrase and the
  learner repeats it, not an answer bubble. Replaces S1 two answers, S2 one,
  S3 a frame (never chosen as such).
  *Since 2026-11-12: the fading is by the new Beginner's steps (two answers, questions to ask, Notice; none from step 6), not S1–S4.*
- **At step 1, every question comes with answers to say back** (Josh, 2026-11-11, on an open question with none at step 1: "difficult for this level"). Step 3 has an open question in its mix; untested by his play.
- **Questions** (Josh, 2026-11-05, "ok"): at S1–S3 every turn ends with one
  question, except the goodbye; a Beginner can't start talk unprompted, and a
  turn with nothing to answer is a dead end. From S4 up a question isn't
  required (open talk can be a statement; a character who steps away comes
  back, docs/dialogue-ideas.md).
  *Superseded in part (2026-11-12): the stages are gone; the Beginner's steps end each turn on a question except "questions to ask" (the learner asks) and the goodbye; see "A conversation is bids". That exception stands: see "Questions to ask" above.*
- **Moving up is offered and chosen** (Josh, 2026-11-11: "a simple offer after N conversations; doesn't have to be success based and is user chosen"; "lets use the level up pages as designed").
- **Everyone starts at Beginner** (Josh, 2026-11-05: "for now everyone starts
  at beginner"), at S1; Settings → level changes it (Beginner, Intermediate,
  Advanced). Built 2026-11-05: the welcome's button starts everyone at S1
  (lib/welcome.ts → finishWelcome). Faster assessment
  later: docs/ideas.md → Assessing level faster.
  *Since 2026-11-12: at step 1 of the new Beginner.*

### English and the screen

- **Where English goes** (Josh, 2026-11-05): "if english is needed it should be
  spoken by the character or listed underneath the italian within the answer
  bubble." Whether it's needed, and at which levels, is not decided. Nothing is
  shown on tap: the tap for English on Beginner bubbles (built 2026-10-25,
  never chosen) is gone from the next phone build.
  *Decided for the character's question since: "The question's English as a ladder".*
- **The question's English as a ladder** (Josh, 2026-11-12, "this is what i want"): steps 1–3, printed under the question and said; steps 4–5, said but not printed; step 6, neither. Steps 1–3 built; 4–6 wait for their direction. No "English only the first time or for something new" rules ("i never proposed that").
- **English in answer bubbles** (Claude's proposal; Josh, 2026-11-05: "fine"):
  every answer bubble shows its English under the Italian, always; it goes
  when answers go (S4). Style: light italic (Josh: "light italics or
  parentheses or both"; Claude: italic in the muted ink, no parentheses, at
  least 4.5:1 contrast). Built 2026-11-05 for the next phone build
  (BeginnerBubbles.swift): light italic in muted #666666 (5.7:1 on the white
  answer bubble); her bubbles show no English and nothing happens on a tap,
  except where the answer is a tap (mic off, VoiceOver, the welcome's buttons).
  *Since 2026-11-12: answers and their English go at step 6 of the new Beginner, not S4.*
  *"Her bubbles show no English" holds for the parts reply; on the one-line reply her question shows its English (the ladder; "What the screen shows").*
- **Who is talking, at a glance** (Josh, 2026-11-05: "I'm interested in if a user can tell who is talking"; "Beginner always being different is not a goal"): one bubble for her and one for the learner, the same on every screen and at every level. Hers on the left in warm parchment (#eee6d6, the Learn page's lessons field) with a thin #d6cab3 edge; the learner's on the right in solid olive (#dbe3c4, the old onboarding answers' green, made solid), its English in dark olive (#3f4a22). Solid, no transparency, so they read over any picture. No tails (Josh: "the left and right are clear and the tails look messy"). Josh: "colors are good". *Built: SpeechBubble.swift, the same bubble at every level.*

- **What the screen shows** (written 2026-11-12 from Josh's decisions that day; the code is `CharacterBubble.swift`, its cases in `CharacterBubbleTests`). Three kinds of rule, kept apart:
  - *Where English goes:* spoken by the character, written under the language in a bubble, or, in the intro only, as a subtitle in the charcoal band. Spoken English is never written in a bubble.
  - *When it shows:* a bubble's English shows once the character has finished speaking; the intro's subtitle shows the English of each sentence as it's said. The character's bubble types out in step with the voice (Josh kept it: reading along helps listening), and is drawn only once there are words in it.
  - *How much of the character's line is printed:*

  | Level and turn | The character's side | The learner's side |
  |---|---|---|
  | Any visit that opens on the intro (Beginner, Intermediate) | A sheet under the name band: portrait, the English subtitle in pieces of at most two lines, a glass close button; swipe down or the X ends it and the question is said | Nothing until the question |
  | The intro's question | The question; its English under it at Beginner (Intermediate shows no English) | Two answers with their English (Beginner); nothing (Intermediate) |
  | Beginner, a turn ending on a question | Only the question in the language, from when the voice reaches it; its English under it at steps 1–3 (the ladder) | Two answers with their English |
  | Beginner, questions to ask, or the goodbye | Nothing | The two questions, or two goodbyes, with their English |
  | Beginner steps 4–6 (the parts reply), the old Beginner, the welcome, Magda's Beginner lessons | One bubble of the phrases in the language as they're said, the question in bold; no English | The answers, with their English |
  | Intermediate | The whole line | Nothing, unless the reply panel's two answers (a new learner's first turns) |
  | Advanced | No line (the level's own setting, 2026-10-23) | Nothing |
  | A note (an error, "Didn't catch that.") | A small grey card above the controls | — |

  The question is the line's last sentence once any English is set aside: a sentence in the translation, or sharing at least half the words of both it and its closest translation sentence; only the last two sentences are looked at (`lib/beginner-2.ts → questionOf`). Why it's written down: four bugs of 2026-11-12 came from these rules living only in code (an empty oval while the character spoke, the English frame printed, the English echo taken as the question, a question emptied by English in brackets).

### Rules for every conversation

- **Four fixes, for every conversation and both countries** (agreed 2026-11-05):
  1. The character is told whether the learner said the offered answer back,
     worked out by the app in any language (close counts), so a mishearing is
     never treated as the learner's words.
  2. Corrections: a recast, only when the words were clearly heard, not every
     time, never pronunciation.
  3. Mishearings handled once, in the shared turn, not in each prompt.
  4. *How do I say it* only puts the learner's own words into the language:
     never answers the character's question for them (cause: say-it.md, "it
     answers or follows {name}'s last line"; Lorenzo, 2026-11-05).
- **Speech-to-text is left as it is** (Josh, 2026-11-12: "We don't support speech to text"; "i haven't experienced comprehension issues with whisper = background noice and mishearing but not misunderstanding").

## Tried and dropped

One line each; the full result is on the card or in the changelog.

- **A summary in her voice after each stretch of Spanish** (card B2-E5, 2026-11-10): followed less than the literal English; the frame replaced it; the code deleted 2026-11-12.
- **Showing the character one whole good visit** (card X1, 2026-11-12): no difference Josh could hear ("This hypothesis of a model dialog transforming anything seems unlikely").
- **A note on every turn naming the next beat** (shapes.md 11b–11c, 2026-11-11): every turn became the same turn; removed in 11d.
- **An open question with no answers at step 1** (2026-11-11): "difficult for this level".
- **The answer said inside the character's line** (2026-11-09): never in a cluster for want of a screen design; deleted 2026-11-12.
- **"English only the first time they hear it" at steps 2–3** (written by a Claude session, 2026-11-11): removed 2026-11-12 ("i never proposed that").
- **The close by the intro's beat count** (2026-11-11): fired on turn 4–5 whatever had been said; removed 2026-11-12.

## Beginner goals (Josh, 2026-10-25)

Moved here 2026-11-12 from beginner-scaffolding.md → Goals, word for word, when CLAUDE.md pointed at this file (plan decision 6). Later decisions that change some of them, each in its own entry: the intro opens the visit (2026-11-11, goal 1); the English frame at step 1, with the question in the language and its English after it (2026-11-10q, goals 4 and 5); nothing on tap, English under the answers (2026-11-05, goal 5).

What Beginner level dialogue is for. The trial prompt is written against these, and replays are measured on them.

**What the learner gets from each conversation**
1. **Know where they are, and who they're talking to** (varied, Josh, 2026-10-25: the opening note is sometimes what's special, sometimes history or culture, sometimes just the country, region, city or the weather; the character introduces themselves and asks the name only sometimes). The first turn says in English, in one line, what this place is and what's special about it, and the character introduces themselves by name (maybe asking the player's), before any question in the language.
2. **Take away a few words and phrases:** one or two that matter in each conversation, explained in English and used again later in it.
3. **Say whole sentences:** a question invites an answer that reuses its words, and the character offers that answer.
4. **Always be able to answer.** Every question comes in English first, then in the language *(order changed: the Spanish first, then its English; the ladder)*. Questions avoid plain yes/no and prefer ones that make you use a useful verb (*Le piace…?* → *Mi piace…*; *Vuole…?* → *Vorrei…*), or one of two, or one fact. The polite form with a stranger unless the character already uses the familiar one.

**How the character talks**
5. **English as support, heard not shown, and brief:** a sentence or two to set the scene, then the language. No lectures (not what goes into carbonara, the kinds of pizza, how the bread differs); one interesting detail at most. Each phrase in the language gets its own bubble (a single word can sit inline), its English a tap away *(no tap: English under the answers, and spoken)*.
5b. **English used to teach, not instead of teaching (Josh, 2026-10-27):** English that carries history, culture or an explanation is worth having: a conversation in Italian only would lose it, and the context can bring Italian phrases with it ("This square was the city's market for 700 years. *Qui c'era il mercato.*"). What lowers the value isn't which words are in English but English that does the Italian's job instead of setting it up. Josh: "I don't think word choice is what matters but a more pedagogical use of English." Pedagogical uses, for example:
   - **Context that leads into a phrase:** a bit of history or culture, then the Italian that goes with it.
   - **Explaining a phrase just said:** what it means, when people say it, why it's said that way.
   - **Setting up the learner's turn:** what they're about to be asked, so they can answer in Italian.
   - **Help when they're lost or ask.**

   Patterns and the best examples from the syllabus: [teaching-with-english.md](teaching-with-english.md).

   English that lowers it: saying in English what the beginner could have taken in Italian with a gloss (the order, the price, "here you are"); narration and chat that leads to no Italian; repeating in English what was just said in Italian.
6. **Language a beginner can follow:** short, common words, present tense; the aim is 90% of words at the learner's level.
7. **One thing at a time:** at most one question per turn. **The first turn may be the longest** (the place, the introduction, the first question); after it, turns stay short (Josh, 2026-10-25).
8. **Still a person in a place:** helpful in role, not a teacher with a lesson plan.
9. **True facts about real places, or none.** Places carry only a name today, so this may need a short checked line per place. **Parts of these conversations could be premade if needed (Josh, 2026-10-25):** e.g. a few checked opening notes per place (its history, what's special, the neighbourhood), which the character picks from.

## Being worked out: character, scaffolding, mechanics (2026-11-13)

Josh, feeling it out ("still feelings things out"); not decided. The record of the discussion, so the next session starts from it.

**Three layers** (Josh: "Some of what you listed I'd call scaffoldding: How much English, Helping in English, Answers to say back. Some is mechanics: each turn. Some is character: character.md + dialogue.md + the place + memory, \"The person in front of you is a man\", yes: \"They have no Spanish yet: they follow English…\""):

| Layer | What it is | Pieces today | By level? |
|---|---|---|---|
| Character | who's talking, where, what it knows | character.md, dialogue.md's character rules (mishearings, stay within your job, cause before effect, your place's customs), the place, memory, who the learner is | only the fact of how much the learner knows |
| Scaffolding | the help to take part | how much English, the fixed shape, answers to say back, the question's English, how long help lasts | yes: a level is a set of scaffolding (Settings: Beginner, Intermediate, Advanced) |
| Mechanics | how a visit runs | each turn's setup, answer first, the goodbye and the close | no: the same at every level |

Findings from sorting it: the files mix the layers (scaffolding.md holds step 1's English and the setups; character.md's reply format, "in {language}", is scaffolding); ending a visit was Beginner-only until dialogue.md 13a made it shared (leaving ends it at every level; the character closes on the 8th turn at Beginner, the 15th at Intermediate; Josh: "lets keep 8 for begginer; 15 for intermediate"); dialogue.md is the one file every level shares.

**What a character can do vs how much** (Josh: "should mix be scaffolding or dialogue? … we are going to want thinggs like idioms at all levels, maybe eventually accents or dialect. We are going to want help in English at all levels"): what a character can do is dialogue, at every level (a piece with its English in the fixed shape; help in English when asked, which works without being in any prompt: Josh, "intermediate does help in english when asked"; idioms with the picture-then-meaning gloss; a Palermo character sounding like Palermo); how much is scaffolding, by level (how many pieces and which get their English; how long help lasts; the idiom rate, Josh: "1 / visit could be a lot"; how much dialect, as "dialect that grows with level", adopted 2026-10-09). Not all of the mix in dialogue: CLAUDE.md's "English nobody asked for is the thing to avoid" at Intermediate needs the amount to go nearly to zero.

**Setting and dial** (Josh: "so is this a dial (like dialogue) or a setting (like scaffolding)"): the level sets where a visit starts and the bounds (a setting); within a visit the character turns the amount of English to the learner (a dial: Josh's "How much English does this learner need to follow me"), up when asked (works today: Ofelia 24% → 85% English), up after a struggle (Nunzio didn't hold it, B13), down for a learner who's following (the most uncertain; left out at first). Josh: "if this is possible it sounds great. It does seem optimistic." Claude's read: the setting, the dial up when asked and the dial staying up are within reach; noticing a struggle unasked and turning down on its own are not promised.

**B13, first try:** of a fact or a note, Josh chose the fact ("shouldnt the model just handle this?", "ok 1"): character.md 13a tells an Intermediate character the learner is learning. Replayed on Nunzio: gentler, not glossed. If help still fades in play, the note (once they've said it's hard) or the fixed shape at Intermediate are next.

## Not decided yet

- **The intro at Intermediate** (Josh, 2026-11-12: "it probably isn't as relevant for intermediate, unless even thicker on culture and lighter on personality"): no intro at all, or one that's almost all culture. His Intermediate play decides.
- **Whether English is needed** anywhere else on screen: at S4 (today an
  English line under hers) or under her lines at any level.
- **The screen:** subtitles or bubbles, and what the subtitle line shows. Josh
  is working this out; the one global subtitle setting is hidden in Settings
  for now (2026-11-05).
  *Settled: bubbles, with the intro's subtitles as the one exception ("What the screen shows").*

## The code

How the code holds the dialogue (the shared layer, what each kind supplies) is in [dialogue-now.md](dialogue-now.md) → The shared dialogue layer: a Claude proposal of 2026-11-05, partly built, not a decision.
