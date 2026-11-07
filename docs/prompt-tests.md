# Prompt tests

One entry per test, written the day it runs, whatever the result (Josh,
2026-11-06: "you need to consistently log tests"). Each test has one variable,
one result, and a hypothesis written before it runs. Unit ids are from
`docs/beginner-prompt-inventory.md`. Outputs are in `tests/experiments/out/`
or the command's output, quoted here.

## T1: does a topic named in a `here` line get told on every visit?

- **Date:** 2026-11-06
- **Unit:** B1 (the setting: the person's `here` line)
- **Hypothesis:** naming a topic in the `here` line makes the character bring it up on almost every visit; if the counts come out the same, the topic comes from the place, not the line, and cutting topics won't fix repeats.
- **Variable:** Ximena's `here` line (Café Amapola, Mexico City), with or without its last sentence, "You love talking about café de olla, the traditional Mexican coffee with cinnamon and piloncillo, and about how you take your own coffee." Everything else the same.
- **Result measured:** visits where one of her lines mentions café de olla, counted in code ("olla" in her line).
- **Setup:** Beginner, stage 2, Mexico; 5 sets of 3 visits on different days, memory carried between visits as in the game; 4 learner turns a visit; the simulated learner never brings up drinks or the menu. Script: `tests/experiments/here-topic.mts` (`VARIANT=A|B`).
- **Result:** A (with the sentence) 15/15 visits (5/5 on visit 1, 2 and 3); B (without) 0/15.
- **Learned:** the line causes the repeat; the place alone doesn't (a Mexican café never brought up café de olla without it). Seen in the lines, not measured: without the topic she repeats the learner's last order instead ("¿Quiere un café con leche otra vez?" on most return visits), from memory; the weather ("Hoy hace mucho frío") opens many visits either way (unit C1).
- **Decision:** a topic named in a `here` line is a repeat. Next questions: (1) does the same hold for a different kind of planted line (a story, not a topic)? (2) the "otra vez" repeat is memory (C3).
- **Commit:** the one this entry is in.
