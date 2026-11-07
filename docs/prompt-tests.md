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

## T1b: without the planted topic, does she bring up other local things on her own?

- **Date:** 2026-11-06
- **Unit:** B1 (Ximena's `here` line), same variable as T1.
- **Hypothesis:** cutting the planted topic also cuts what's particular to the place.
- **Variable:** as T1, with or without "You love talking about café de olla…" (the line no longer has "slowly", Josh's decision the same day, in both versions).
- **Result measured:** visits where she mentions anything in a set S fixed before reading, café de olla excluded: foods and drinks (pan dulce, conchas, tamales, chilaquiles, churros), places (Condesa, Parque México, Roma, Reforma, Zócalo), customs (Día de Muertos, posadas, quinceañeras), words (qué padre, ahorita, chilango); and those where she brings it up herself (the learner didn't say it in that visit). Counted in code on the full transcripts, then every line read.
- **Setup:** T1 rerun with every line kept (T1 printed only first lines; Josh: "just read her answers"): `tests/experiments/here-topic.mts`, outputs `tests/experiments/out/here-topic-A-1794010664030.md`, `here-topic-B-1794010657046.md`. T1's own result reproduced: café de olla 15/15 with the sentence, 0/15 without.
- **Result:** any S item: A 14/15, B 15/15. Brought up by her: A 4/15, B 10/15 (B: pan dulce 5, Parque México 6, ahorita 2; also Parque España, the curved streets around the park, coffee from Oaxaca and Chiapas, her dog Mole "like the sauce").
- **Learned (measured):** the hypothesis is rejected: cutting the topic didn't cut local talk (any S item 14/15 with it, 15/15 without). The customs in S came up 0 times in either version. **Leads, not findings:** that the topic crowds out other local talk (S items she brought up herself 4/15 vs 10/15: one character, one run each, noise unknown; "herself" only means the learner didn't say it in that visit, order not checked; the learner prompt names Condesa); that there's no culture beyond the neighbourhood (read, not measured, apart from the customs). Seen in the lines: both versions repeat the last order on return visits.
- **Decision:** cutting a planted topic didn't lose local talk at this café. To confirm "crowds out": the same test run again, and a second character. Open: where deeper culture should come from; the order repeat (memory, C3).
