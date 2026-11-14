# The learning loop: play that improves the next turn, the next visit, the learner's file and the dialogue

A brainstorm with Josh, 2026-11-13. Nothing decided, nothing built. Josh's words are quoted; the rest is Claude's.

## Where it started

Josh: "I have a hunch we arren't being ambitious enought here." On Magda's study file (after every visit, the review is boiled down into at most 20 labelled lines: Level, Recurring, Improving, Practised, Next, Try in town): "pretty useless - nothing really uses it or needs it - and fed to a conversation I'd bet the values are too boiled down to help dialogue." What he's after: "this turn or dialogie cycle could improve the next turn (no evidence this happens), improve the next conversation (also no evidence), improve rules and dialoge, flag errors - repeats, character drift and in some way I really can't articulate - improve the models knowledge of the learner - maybe a character file for the learner that is in the prompt - maybe a cached prompt thatt gets updated every x conversations."

Then: "+turn, + conversation, +personal, ideally +dialogue - my idea about the RAG sounds bad when I hear it back - maybe its more like Karpinsky's file system -- my idea about helping Claude is the biggest - but I don't really know how to do that - he does pretty well on his own and I wouldn't want to screw it up with hints or rules."

## What exists today (2026-11-13, from the code)

- Each turn the character gets the whole conversation, the answers it offered, a note on whether the learner said one back (dialogue.md "Heard"), the turn's setup, "answer first" on a question, its memory of the learner and the beats. No analysis of the turns.
- After a visit: `lib/remember.ts` writes the character's memory (up to 10 notes; what it told) and a review (useful phrases, mistakes, missed phrases, English used); `lib/study-file.ts` folds the review into Magda's study file, which only her lessons read.
- The learner's sheet in every prompt is one line: "The person in front of you is a man", and since 2026-11-13 a level fact at Intermediate and Advanced.

## Two ideas from Andrej Karpathy (Claude's recollection, not checked against a source)

- **Memory as files, not a search engine:** plain notes the model reads and rewrites (one per person, one per topic), like a notebook; this session's own memory works that way (a folder of small files with an index).
- **"System prompt learning":** besides training, a model can learn the way people keep notes to themselves ("when X happens, try Y"): it writes its own lessons, in its own words, into what it reads next time.

The second answers Josh's worry about hints and rules: the notes are Claude's own, from what happened, kept only if play shows they help.

## Four loops

| Loop | The file | Written by | Read |
|---|---|---|---|
| **+turn** | a scratch note for this visit ("he didn't get *corteccia*"; "I've asked about the altars already"; "he's trying to leave"; "you're a shoe-shiner, not a guide") | an observer, in the seconds between turns while the voice plays (no waiting) | the next turn |
| **+conversation** | the character's file on the learner: what they shared, what's unfinished, promises ("mañana a las diez, en las gradas") | the character, after the visit (today's memory notes, richer) | that character's next visit |
| **+personal** | the learner's file: who they are from what they've said (Seattle, the grandfather who was a gardener, the ginkgo, Sophia and Chema), how they speak (recurring mistakes in their words, Italian slipping into Spanish), what helps, what they enjoy | a curator, every few visits, from the transcripts (not boiled down) | every character, every turn; one stable prefix, so prompt caching makes it cheap; Magda reads it too, replacing the study file |
| **+dialogue** | a craft notebook: Claude's own lessons about talking with learners in this game | Claude, from the observers' flags across all play (repeats, drift, Spanish with no English, empty answers, ignored leavings, bug reports) | every character, every turn |

## Keeping +dialogue honest (Josh's caution)

Few, short notes, pruned like an index; each new lesson checked by replay (a visit with it against without, tests/experiments); Josh's ear has the last word; a lesson that doesn't help is deleted. The aim is the opposite of rules piling up.

## Questions for later

- A town that talks: CLAUDE.md has characters know only what the learner told them; a shared learner file means Vale knows about Sophia because Don Chucho was told (Josh's family idea leans that way).
- The part Josh can't articulate. Claude's guess: a story of the learner and the town, the threads still open ("Isidro is waiting to show him the mine"), so characters pick them up as people do.
- What it costs: an observer call per turn (a cheaper model, in the gap), a curator every few visits, cached prefixes.
