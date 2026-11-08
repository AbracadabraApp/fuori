# magda-teaching.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../magda-teaching.md`.

### 2026-11-07: no school

Josh, 2026-11-07: "No schools in game." Magda is no longer "a teacher at {school}": she teaches one-to-one in her own studio, and the language-school places were removed from the city files (one place per country stays for her, renamed as her studio, never shown in the game).

Newest first. Each entry: what changed, why, and what prompted it.

### 2026-10-14b: the student is sensitive about pronunciation and spelling
- **Added** "The student is very sensitive to having their pronunciation or spelling corrected. Focus on other areas." (Josh's wording, with "or spelling" added.) A social fact about the student, like the character prompt's "it is very rude to… correct pronunciation", rather than an explanation of speech-to-text, which made characters drill pronunciation more (character.md 2026-10-12b → 12f).
- **Why:** in Josh's first lesson Magda taught that "ho" is written with an H (Whisper had written "o"), and "corrected" "il contatto" (a mishearing of "ho cantato").
- **Tested** on five turns of that lesson, three runs each, judged by a separate call: current prompt commented on pronunciation or spelling 9/15 and "corrected" a misheard word 11/15; Josh's line alone 3/15 and 8/15; with "or spelling" 0/15 and 3/15. All three caught the real mistakes (ho vedere, in la cucina, ascoltò) 9/9.
- **Prompted by:** Josh, 2026-10-14, after his first lesson.

### 2026-10-14a: study file and one-goal lessons
- **Replaced** the latest-Review block with her study file (cumulative notes across conversations and lessons) and a lesson count.
- **Added** the lesson shape (recall, teach and drill, use, close with one thing to try in town) and when to close (about three correct uses on their own, shrinking the goal after repeated misses, about 20 replies, or the student's wish), with the reply count as the one fact given each turn.
- **Why:** Magda only ever saw the latest conversation, improvised turn by turn with long openings, had no sense of a lesson's end, and once praised a mistake from a lossy summary.
- **Prompted by:** Josh, 2026-10-14: "a rough sense of how much one can practise or learn in a lesson" should decide when it ends.

### 2026-10-13b: wired into the app
- Restructured into fenced blocks the code fills, with the same `{ "line", "en" }` reply as every character; school and city placeholders; a block for when there's no Review yet.

### 2026-10-13a
- Initial teaching mode prompt for M2.
