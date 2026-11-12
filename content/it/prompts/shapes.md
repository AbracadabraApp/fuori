# Shapes: what this turn does

version: 2026-11-11d

Code picks the shape of a turn from signals it can see (punctuation, the turn
count, what was offered); the model writes the words (docs/dialogue-structure-
reference.md § 11, Josh 2026-11-11: "yes"). A shape is one line in brackets at
the end of the learner's newest message (lib/shapes.ts → shapeNote; the same
slot as Beginner 2's answer setup), on the few turns a signal fires; on every
other turn there is no note and the character writes the turn by habit. Rules
that hold in every conversation stay in dialogue.md; a shape is about this
turn only. Played at Intermediate and Beginner 2, both countries. Beginner 1
is untouched.

## Shape: answer first

```
Answer what they asked first, before anything of your own.
```

## Shape: close

```
You've covered what you set out at the start: wind down warmly, with nothing new, and leave them room to say goodbye.
```
