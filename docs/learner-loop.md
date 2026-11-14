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

- A town that talks: decided (Josh, 2026-11-14): "i think character knowledge should be siloed - unless we introduce gossip". Each character knows only what the learner told that character; gossip would be its own feature, if ever. So +personal can't carry life facts to every character; those stay in each character's +conversation file. Open: whether +personal keeps only how the learner speaks and learns (level, recurring mistakes, what helps), which pitches the language and isn't something the character "knows".
- The part Josh can't articulate. Claude's guess: a story of the learner and the town, the threads still open ("Isidro is waiting to show him the mine"), so characters pick them up as people do.
- What it costs: an observer call per turn (a cheaper model, in the gap), a curator every few visits, cached prefixes.

## The teacher and the date (Josh, 2026-11-14)

Josh: "If I was a spanish teacher, every turn with a student gives me a hint on how to teach the next turn. The next student gets refined presentation. At the end of the day I might have a better idea for a lesson plan the next dday. If I am on a date, I can evaluate how the cconverrsatiomn is going and steer it into directions I wwant. I can evaluate how it is goinng and ask for a second date. On the next date I can make different dedcisions frrom where to go, how to dress, what to discuss"

Claude's reading: each loop is a judgement of how it's going against a goal, then a decision. Today's character reacts to the last line but never judges how the visit is going. Three timescales: in the visit (judge and steer), between visits with the same learner (plan the next one), across learners (refine how things are presented). This brings back +turn as a judgement, not a memo, and the cross-learner loop as refined presentation, not rules. Nothing decided.

Josh, on the teacher with the same student next time: "teacher restates the turn for better clarity or reinforcementt". So a repeat visit also brings back what was said last time, put more clearly or practised again, besides picking up what was left open.

**A goal (Josh, 2026-11-14):** "in the bid terms - characters should make strrong bids for returns - that is a goal". Like asking for a second date: the character gives the learner a reason to come back to them (something to show, a story to finish, a time to meet), and on the return it keeps the bid.

Josh: "Isidiro did a good jon at this - also the costume designer in Palermo". What their bids had (Claude, from the transcripts):
- **Elena, costume maker, Teatro Massimo, Palermo.** First visit (fe9d59f5) ends on "Come next week and I'll have the gold thread ready, il filo d'oro, and we'll start the first flower together." The return (252960a4) opens on what Josh had said he'd do ("Ha poi visto la ballerina in tutù bianco?"). Then Josh asked her out: "puoi accompagnare mie tu il mercato domani?" She said yes and made it concrete ("davanti all'ingresso del Teatro Massimo alle nove e mezza"), built on his story (a *pani ca' meusa* twenty years ago: "Domani lo troveremo a Ballarò"), took his "tu e molto bella" in role ("Mi fa arrossire, e con tutta la polvere di stoffa che ho addosso!"), and ended the visit herself ("Ora devo tornare alla mia gonna di tulle").
- **Isidro, ex-miner, San Cayetano, Guanajuato.** First visit (6159f8cb) ends with Josh leaving before the altars; the return (d335b204) opens on "usted se fue sin ver los altares". Then they made a time together: Isidro offered ("¿Le gustaría ver una mina por dentro?… ¿Prefiere ir hoy o mañana?"), Josh chose tomorrow, Isidro set the rest ("Nos vemos aquí en las gradas… a las diez… bring a jacket, que adentro hace frío").
- Bids go both ways: the learner can make one, and the character says yes and makes it concrete.
- In common: a time and a place, something done together, from the character's own world (her thread, his mine), tied to what the learner said or left unfinished; and the return opens where the last visit left off.
- Against: Elena ended her visit herself. Isidro closed at turn 14 ("Fue un gusto platicar con usted hoy"), then kept opening new questions for 34 more turns, and Josh had to say "Don Insidro, we must stop" and "I must insist we stop".
- Claude's guess at why: Isidro's visit is Beginner, whose shape ends every turn on a question in the language, so a goodbye can't be the last thing he says; Elena's visit is all Italian, without that shape, and she said goodbye. Not tested.
- Neither date has been kept yet: no visit to Isidro or Elena after 2026-11-13 (archive to 2026-11-14 19:08 UTC).
