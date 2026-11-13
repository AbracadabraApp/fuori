# lesson-steps.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../lesson-steps.md`.

- 2026-10-29: Mexico's copy of Italy's lesson-steps.md (2026-10-29c), with Mexico's own roles, kinds of place and examples (tú, "Soy de …"). Josh, 2026-10-29: in Mexico the Lessons card opened a Learn page, because Mexico had no lessons.

### 2026-11-12b: Italy's five lesson-writing rules, which Mexico's prompt lacked
- **Added, System prompt:** "One point per lesson…", "Practice questions are at the unit's level too…", "Practice is new…", "At least two examples are said by someone other than the learner.", "English: American English…", copied word for word from content/it/prompts/lesson-steps.md, where they were added when Italy's lessons were rewritten.
- **Why:** a comparison of the two countries' prompts (2026-11-12) found the dialogue prompts identical and the lesson writer the one real gap; "keep the two in step". Changes nothing played: it applies the next time Mexico's lessons are generated, on Josh's word.
- **Prompted by:** Josh, 2026-11-12: "now".

### 2026-11-12a: the learner's own example lines labelled "learner", not "newcomer"
- **Changed:** the role for the lines the learner will say themselves, "newcomer" ("what someone new in town says") → "learner"; Italy's Intermediate block, "someone other than the newcomer" → "the learner". Lessons already written keep "newcomer" in their data; lib/lesson.ts reads both as the learner's lines and shows them to Magda as "you".
- **Why and prompted by:** CLAUDE.md's learner rule (no newcomer, no visitor, nothing assumed about where they're from); docs/dialogue-plan.md, "Newcomer in the writers"; Josh, 2026-11-12: approved. Not regenerated: that's Josh's call.

### 2026-11-10p: the newcomer assumption removed
- **Removed:** the assumption that the learner is a newcomer who has come to live in the country ("They're living in {country} for a while", "a person who has recently come to live in {city}", "the way a newcomer politely would", and the like). The learner is someone learning about the country, its language and culture; nothing is assumed about where they're from, where they live or for how long, and characters know only what the learner has told them.
- **Why:** Josh, 2026-11-10: characters kept asking whether the learner is new, from here or how long they're staying ("cada personaje pregunta lo mismo"; Doña Carmen: "¿Es porque veo africano?"); "these are all patches that compounded the problem… The game should work for someone regardless of where they are from or how long. Imagine an Italian of African background is playing and our game always asks if they are a newcomer or how long they are visiting." The persona came from the game's beginning (someone staying in Rome with a landlady); patches since kept reinforcing it. The same change in every prompt that carried it, both countries, and the city files' "helps newcomers". Measured with automated replies before release (docs/automated-replies.md).

