# Lesson judges

2026-11-02 · Josh's design, Claude's briefs · Used on lessons made ahead (`content/<country>/lessons.json`) before they ship. No human proofreading and no outside tools (Josh): five separate judges, each narrow, each with its known blind spots in its criteria. One bounded pass: write; judge once; fix only failed lines; recheck those once; a lesson still failing is dropped. Many failures mean the writing instructions (`content/<country>/prompts/lesson-steps.md`) need changing.

Each judge reads every lesson of the units it's given, plus the syllabus unit (`content/<country>/syllabus.json`) for its level and teaching points, and returns only failures, each with the lesson id, the field, the text, why it fails and a corrected version. A judge never comments outside its own criteria.

## 1 · Grammar
Is every line in the language correct? Agreement (gender, number, verb with subject), articles and their contractions (*dell'*, *al*), pronoun placement, tense and mood (when the subjunctive is required and when it isn't), *tu* or *Lei* used consistently within a line.
**Blind spots to guard against:** accepting a form because it looks like a textbook (stiff, old-fashioned or written-only forms are a fail here only if they're wrong; the naturalness judge handles stiffness); missing an apostrophe or accent (*caffe*, *perche*, *un'acqua*); missing agreement across a long line.
- Pass: *Vorrei un bicchiere d'acqua, per favore.*
- Fail: *Vorrei una caffè.* → *Vorrei un caffè.* (*caffè* is masculine)
- Fail: *Quanto costa le mele?* → *Quanto costano le mele?* (plural subject)

## 2 · Naturalness
Would a person in the role and place given (a barista in Rome, a vendor at a Oaxaca market) say it this way, out loud, today? For practice questions: would a teacher say it to a student?
**Blind spots to guard against:** textbook register (correct but nobody talks like that); word-for-word copies of English (*Ho 30 anni vecchio*, *Sto avendo un caffè*); a line natural in writing but not in speech; for Mexico, Spain's Spanish (*vosotros*, *coger*, *ordenador*, *vale*); for Italy, regional forms passed off as standard. Doubt counts as a fail: give the line you'd expect to hear.
- Pass: *Prego! Cosa Le do?* (a barista)
- Fail: *Desidererei avere un caffè, se possibile.* → *Vorrei un caffè, per favore.*
- Fail (Mexico): *¿Queréis algo más?* → *¿Algo más?*

## 3 · Level
Do the words and structures fit the unit's level (A1, A2 or B1 in the syllabus) for a listener, not a reader? Count a word given with its English in the same lesson as known.
**Blind spots to guard against:** rating lines too easy for listening (the level tests found the judge does this: judge as if heard once, at speed); missing a structure above the level hidden in an easy line (a subjunctive in an A1 line); long lines (over 12 words at A1–A2).
- Pass (A1): *Vorrei una spremuta d'arancia.*
- Fail (A1): *Se avessi tempo, prenderei anche un cornetto.* (hypothetical, B1)

## 4 · Teaching
Does the lesson teach its one point (its title and how_to) and only that? Do the examples show the point, does the notice explain what they share, does each practice answer use it?
**Blind spots to guard against:** an example that's fine but doesn't show the point; a second grammar point slipped in; warning against a form the learner hasn't used (teach what to say, not what not to say: no *voglio* beside *vorrei*); a practice question that contains its own answer; a context line that says what not to do.
- Pass: a *vorrei* lesson whose examples and answers all use *vorrei*.
- Fail: a *vorrei* lesson whose notice says "never say *voglio*".

## 5 · Translation
Does each English line say what the line in the language says, as natural English, with the same register? Glosses of single words: the meaning here, not the dictionary's first sense.
**Blind spots to guard against:** word-for-word English (*What do you desire?* for *Cosa desidera?*); English that adds or drops meaning (a *per favore* with no "please"); British or American oddities; a gloss that explains instead of translating.
- Pass: *Cosa Le do?* → "What can I get you?"
- Fail: *Cosa Le do?* → "What do I give you?"
