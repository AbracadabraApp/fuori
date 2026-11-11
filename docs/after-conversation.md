# After a conversation: the page between leaving and the city

2026-11-10 · Josh and the cloud session · a brainstorm and the first decisions, not a spec.

Josh: "a new page type… a sort of interstitial page that is triggered by the end of a conversation. The page can have different content on different conditions. 1. a level up page; 2. a trial lesson review page; 3 more to come." Mockups: the canvas "After-conversation page" (claude.ai artifact J8E48kaJyscahyhGebkH8t): level up in Mexico and Italy, the Learn page in Mexico.

## The frame, the same for every kind

- Who you were just with at the top (portrait, name, place), one idea in the middle, two choices at the bottom.
- At most one page per conversation end. If two kinds are due, the stronger wins (level up before the Learn page). Nothing when there's nothing worth showing.
- Leaving it takes you to the city's place list (Josh).
- No close button: the two choices are the only ways out, so each has one meaning (Josh, from the other session's review).
- Fun and bright, in the country's own look (Josh: "You are in Mexico - its fun and bright with rich cultures!! make it fun"): Mexico has papel picado across the top and a colibrí under the buttons; Italy a striped café awning and a branch of lemons. Buttons right under the content, decoration under the buttons (Josh).
- The yes button in the learned language ("¡Sí, más español!", "Sì, più italiano!"); "Not yet" underlined so it reads as a link (Josh). Words in the language from /v1/content, never in Swift.

## Kind 1: level up (decided as drawn)

- **When:** after 3–5 conversations that count at the current Beginner step (3 or more learner replies). Not asked again until a few more.
- **What it offers:** the next step of the two dials in the step ladder (her speech: which language holds the frame; your replies: which setups), named by what changes, never by a number (Josh: "lets not show level numbers - we could say feeling ready, next step, you are doing great, ready for more challenge"). Headline "Ready for more?"; a warm line above ("You're doing great with Ximena"); the card for the new step labelled "Next step".
- **Hear the difference:** her real line now and at the next step, each with its own play button (replay one, not both). One plain line on what changes in your answers.
- **No going back, no setting.**
- **Needs:** the learner's step stored (today it comes from a hidden header), the count, the screen, the step briefs in scaffolding.md (the step ladder note from the laptop session).

## Kind 2: the Learn page (drawn, not decided)

From the brainstorm on the book in the conversation: the review you'd otherwise have to open.
- **Say it this way:** up to two fixes, the better phrase tap-to-hear in their voice, what you said and why in one line.
- **Their words:** up to three, with English.
- **Good to know, from the place:** the place's culture or history when the talk touched it (the Sinaia's refugees on the Veracruz malecón), otherwise the language.
- **A lesson for this:** the one unfinished lesson the conversation shows you need ("Polite or friendly you"), opening it; "Try the lesson" / "Done".
- **What exists:** the review written at leave (lib/remember.ts), the Learn page writer and learn-ahead (lib/learn.ts, lib/learn-ahead.ts), lessons done (lib/lesson.ts → lessonsDone). **New:** the writer given the place and your unfinished lessons; the screen.

## More kinds, brainstormed (none decided)

- **What they'll remember about you:** one line the character keeps from today ("Remembers: you're learning to make café de olla"), so the memory the game already has becomes visible.
- **Your best line:** the one thing you said best today, played back in your own voice. Praise you can hear, not a score.
- **A first:** "First time you ordered for someone else", "First joke she laughed at". Milestones from what you did, not counts.
- **A postcard:** the place's picture with one line of theirs, in their voice, to keep in a collection or send to someone.
- **Their parting line:** the last thing they said, slowed, with the English, for the walk out.
- **A thread to pull next time:** the character leaves something open ("Next time I'll tell you about my grandfather's boat"); the next visit picks it up.
- **A place opened:** someone mentions a place or a person, and it appears in the city ("Ximena told you about the market in Coyoacán").
- **A new city:** after enough conversations, the ticket seller's line becomes a page: "Veracruz is five hours away".
- **A film:** the place ties to a film in the reel (Ulúa → a film of the port; the café → Roma), with a play button.
- **A lesson continued:** after a trial lesson with Magda, the review page of the lesson, then back to the city.
- **The book feeds the next visit:** one fix from today worked naturally into tomorrow's conversation (the only one here that changes how characters talk: character.md's relationship line).

## Open

- Does the Learn page replace the Learn sheet behind the book mid-conversation, or sit beside it?
- Which kinds can share a page (a first and a thread to pull), and which always stand alone (level up)?
- How often is too often: every conversation, or only when something is strong?
