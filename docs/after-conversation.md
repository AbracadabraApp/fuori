# After a conversation: the page between leaving and the city

2026-11-10 · Josh and the cloud session · everything from the brainstorm and the first decisions, not a spec. Nothing here is built.

Josh: "I want to create a new page type. Its a sort of interstitial page that is triggered by the end of a conversation. The page can have different content on different conditions. 1. a level up page; 2. a trial lesson review page; 3 more to come." Then: "the 2nd type is a new learn page we discussed". Mockups: the canvas "After-conversation page" (claude.ai artifact J8E48kaJyscahyhGebkH8t): level up in Mexico (Ximena, Café Amapola) and Italy (Luisa, Bar Mattina), the Learn page in Mexico (Don Chema, the Veracruz malecón). Portraits there are placeholder circles; the lines are made up to show the shape.

## The frame, the same for every kind

- Who you were just with at the top (portrait, name, place), one idea in the middle, two choices right under it, decoration at the bottom.
- At most one page per conversation end. If two kinds are due, the stronger wins (level up before the Learn page). Nothing when there's nothing worth showing.
- Leaving the level-up page takes you to the city's place list (Josh: "Leaving the level up card takes you to the cities place list"). Where the Learn page's "Done" goes is open (the place list too, and "Try the lesson" opens the lesson, was proposed, not answered).
- No close button: the two choices are the only ways out, so each has one meaning.
- Fun and bright, in the country's own look (Josh: "You are in Mexico - its fun and bright with rich cultures!! make it fun"; "Something cute and decorative from Mexico"; "I meant either decoration above or below the buttons"; "I'd put buttons under the language - colibri under the buttons"). Mexico: papel picado across the top (magenta, marigold, turquoise, green, terracotta, purple) and a colibrí sipping from a pink flower under the buttons; the next step's card in marigold. Italy: a green-and-cream striped café awning and a branch of lemons; green accents.
- The yes button in the learned language: "¡Sí, más español!", "Sì, più italiano!" (Josh: "Lets make the green button in language"). "Not yet" stays English, underlined so it reads as a link (Josh: "I might put an underline under Not Yet or something that is clear its clickable").
- Words in the language come from /v1/content, never from Swift; every screen checked in both countries.

## Kind 1: level up (decided as drawn)

**The step ladder** (from the laptop session's note Josh pasted, "describe what we need for the interstitial offers to step up - what scaffolding changes"): scaffolding in Beginner 2 is two dials, and a step up moves both one notch.
1. **Her speech:** which language holds the frame. From the bottom: English frame with the Spanish slotted in (the Chucho lines) → half and half, switching at clause ends → Spanish frame with English asides → Spanish, with English only when asked (Intermediate). Cleaner than today's Level 1 / 1b / 2 / 3 texts, which measured no change.
2. **Their reply:** the reply ladder: bubbles with English → bubbles in Spanish only → questions to ask → an invited English answer → built from her words → free. Cluster by cluster the lowest setup drops out and the next comes in.

| Step | Her speech | Their reply |
|---|---|---|
| 1 | English frame, Spanish phrases with their English beside them; the question in Spanish, then English | two bubbles with English |
| 2 | English frame, the Spanish phrases without the English after each (heard before); question echoed | two bubbles with English · questions to ask |
| 3 | half and half at clause ends, tags in Spanish; question echoed | two bubbles with English · questions to ask · free |
| 4 | half and half; the question's English only when the answers aren't shown | questions to ask · free |
| 5 | Spanish frame, one English thought a turn (B2-E5's mixed arm) | two bubbles, Spanish only · free |
| 6 | Spanish; English only if they ask, as Intermediate does | free |

**What has to exist (none of it does yet):** the learner's step, stored (today the cluster comes from a hidden header the app sends; it moves to the learner's record, set by the offer); the count of conversations that count at the current step (3 or more learner replies; opener-only visits don't), reset on stepping up; the screen, shown when the count reaches 3–5, not asked again until a few more; the six frame briefs in scaffolding.md replacing Level 1–3, with the reply setups per cluster already in lib/beginner-2.ts; the record already carries +C<cluster> in the turn's version, so grades and the reply table split by step with nothing new. No going back, no setting. **Build order suggested there:** the step-1 frame, played; then steps 2–3 so there's somewhere to step up to; then the stored step, the count and the screen ("the offers are the smallest part; the steps are the work").

**The screen, as decided:**
- No level numbers (Josh: "lets not show level numbers - we could say feeling ready, next step, you are doing great, ready for more challenge, etc"). Headline "Ready for more?" (Josh's edit); a warm line above ("You're doing great with Ximena"); the new step's card labelled "Next step".
- Hear the difference: her real line now and at the next step, each with its own play button.
- One plain line on what changes in your answers ("still two to choose from, and now you can say your own").
- The other session's review of the first draft, all taken: the big "Paso 3" circle said the least and was dropped for a small line above the question, in one language; a play button on each card instead of one "Hear both"; the close button removed, since with "Not yet" on screen it was a second answer with a different meaning. Kept as drawn: name and place at the top, the tinted card for the new step, the answers line in plain words, green for the learner's yes.

## Kind 2: the Learn page (drawn, not decided)

The review you'd otherwise have to open from the book, on the one moment people look back: leaving. Brief, top to bottom:
1. Who you were with.
2. **Say it this way:** up to two fixes, the better phrase tap-to-hear in their voice, what you said and why in one line ("¿Usted trabajó aquí?": usted with an older man you've just met).
3. **Their words:** up to three, with English (el estibador, el norte, el remolcador).
4. **Good to know, about this place:** the place's culture or history when the talk touched it (the Sinaia's Spanish refugees landing on the Veracruz malecón in 1939), otherwise the language.
5. **A lesson for this:** the one unfinished lesson the conversation shows you need ("Polite or friendly you · not started"), opening it.
6. "Try the lesson" (or only "Done" when there's no lesson) and "Done".

**What exists:** the review written at leave (lib/remember.ts: mistakes with the better phrase, useful items, missed words); the Learn page writer and writing it ahead (lib/learn.ts, lib/learn-ahead.ts, content/<country>/prompts/learn.md); lessons done (lib/lesson.ts → lessonsDone: a lesson counts once its review is reached). **New:** the screen, the rule for when it shows, and the writer given the place and your unfinished lessons.

**Tension to keep in view:** docs/learn.md says "Learn is not the game. It's spell check… no ceremony", and "If there is a Learn link, not every conversation needs one: it appears only when there's something worth reviewing". So the page appears only when there's something, is gone in one tap, and never blocks leaving.

## The morning's Learn ideas (on the book in the conversation)

Josh asked for "ideas on better integration of the book that appears in conversation"; he said 3 to 5 interested him, and added the lesson mapping himself. Nothing decided or built.
1. **A dot on the book** when there's something new: a count (2) when a character recasts a mistake or uses a word worth keeping, so tapping it has a reason and it's never in the way.
2. **Try it now:** each correction in the sheet gets a button that closes the sheet and opens the mic; you say the better phrase to the character, who reacts in character ("¡Eso!"). A review turned into practice.
3. **A summary when you leave:** fixes · words · good to know, a tap for the full sheet. Became the Learn page above.
4. **The book feeds the next visit:** one fix or word from today worked naturally into tomorrow's conversation, never as "last time you got it wrong": spaced practice inside the game, from the notes characters already keep (changes character.md's relationship line, filled by lib/prompts/build-turn-prompt.ts).
5. **A tip about the place:** good-to-know drawn from the place's history and culture when the talk touched it (Ulúa in 1914, the Caste War, de las Casas), by giving the Learn writer the place and the character's here line.
6. **Mapping the conversation to lessons (Josh: "What about highlighting incomplete learn lessons related to the conversation"):** the Learn writer also gets your unfinished lessons at your level and picks at most one the conversation shows you need (tú where usted belonged → "Polite or friendly you"), or none. A judgement of the conversation, not a word match. Shown in the Learn sheet under the corrections ("Practise this: …"), on the leave page as its one call to action, and as a dot on that lesson in the Learn area.
- Noticed: Mexico's lesson examples label the learner `role: "newcomer"`, against CLAUDE.md's learner rule; worth renaming (e.g. "learner").

## How to take these forward: Josh on testing

The cloud session turned ideas 4–6 into three test plans (L1 the lesson pick, L2 the place tip, L3 the fix brought back, each A without / B with, fixed moments, a pass mark set first). Josh: "My understanding was cards were for changes to prompts. Not all changes"; then "We have found another place Claude prefers testing to building", and "Testing is good at discovering information. It shouldn't be used to kill ideas before they are even sketched out." So: sketch first, build the version worth trying, test where a real question shows up. Of the six, only 4 touches the prompt behind every conversation (character.md), where one added line has taken over a character before (T1–T3); 5 and 6 change only the Learn writer's prompt (learn.md).

## More kinds, brainstormed (none decided)

- **What they'll remember about you:** one line the character keeps from today ("Remembers: you're learning to make café de olla"), so the game's existing memory becomes visible.
- **Your best line:** the one thing you said best today, played back in your own voice. Praise you can hear, not a score.
- **A first:** "First time you ordered for someone else", "First joke she laughed at". Milestones from what you did, not counts.
- **A postcard:** the place's picture with one line of theirs, in their voice, to keep in a collection or send to someone.
- **Their parting line:** the last thing they said, slowed, with the English, for the walk out.
- **A thread to pull next time:** the character leaves something open ("Next time I'll tell you about my grandfather's boat"); the next visit picks it up.
- **A place opened:** someone mentions a place or a person, and it appears in the city ("Ximena told you about the market in Coyoacán").
- **A new city:** after enough conversations, the ticket seller's line becomes a page ("Veracruz is five hours away").
- **A film:** the place ties to a film in the reel (Ulúa → a film of the port; the café → Roma), with a play button.
- **A lesson continued:** after a trial lesson with Magda, the lesson's review page, then back to the city (Josh's original "trial lesson review").
- **A video at your level:** a graded learner video or a children's show in the language, from the learning-videos idea (docs/ideas.md → Learning videos and children's shows).
- Claude's pick of these: your best line, and a thread to pull next time (praise you can hear, and a reason to come back to the same person).

## Open

- ~~Does the Learn page replace the Learn sheet behind the book mid-conversation, or sit beside it?~~ **Josh, 2026-11-10 (laptop session): one Learn page, not two.** The new page is built beside the sheet and judged in play; the sheet stays until the new page is better, then it goes (as Beginner 1 stays until Beginner 2 wins). Showing it after every conversation is a decision Josh holds lightly ("could be wrong"); the reversible choice is every time, one glance, with two things watched in play: how fast it's dismissed, and whether a fix or lesson from it turns up in the next conversation.
- Where the Learn page's "Done" goes.
- Does the Learn page get the same festive treatment as level up?
- Which kinds can share a page (a first and a thread to pull), and which always stand alone (level up)?
- How often is too often: every conversation, or only when something is strong?
