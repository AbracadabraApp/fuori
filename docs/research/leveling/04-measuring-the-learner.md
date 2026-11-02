# Measuring the learner's level from what they say

2026-11-02 · Research for [level-research-plan.md](../../level-research-plan.md), topic 4 · Scope: Beginner (A1–A2) → Intermediate (B1). Read with [00-what-we-know.md](00-what-we-know.md).

**The question.** Fuori hears every learner turn. From that, how do we tell cheaply and reliably that a Beginner is ready for Intermediate? What we have per turn: Whisper's text (`whisper-large-v3-turbo` on Groq, `verbose_json`, so segment timings and confidence come back too), recording length, silence, the language Whisper detected, whether the learner asked for help or English, and, on the Beginner path, the answers the character offered to say back.

**Short answer.** No single number does it. The best evidence in the literature is a holistic judge reading a whole conversation, plus timing measures taken from the audio. Grammar accuracy measured from a Whisper transcript is the weakest signal, because Whisper tidies learner speech. A stable estimate needs about five conversations. Moving up should take a higher bar than moving down.

---

## 1. The signals, ranked

Ranked by how well each one tracks A1→B1 in speech, given Fuori's setup. "Any language" means it works without word lists or anything language-specific in code.

### 1. A judge reading the whole conversation (holistic CEFR rating)

- **Evidence.** Cambridge's ALTA group fed CEFR can-do descriptors to an open LLM (Qwen 2.5 72B), zero-shot, on Whisper transcripts of learner speech. The overall score correlated 0.76 with examiner scores on the test set (Pearson 0.761). That beat a BERT grader trained on the same kind of data (0.727) [Bannò et al. 2025]. A speech model trained on matched data did better (0.821), but Fuori can't train one. GPT-4 scoring learner essays by CEFR aspect matched holistic grades at rank correlation 0.80 without being told the grade [Bannò et al. 2024]. For comparison, one trained human rater agrees with the rater consensus at a mean ρ of 0.62 (median 0.73) [Uehara 2026]. So one judge call is roughly as good as one human rater. It is not better than several.
- **Fuori's own result.** Haiku with "CEFR" named hit 66% exact, 100% within one level, on exam listening lines (`00-what-we-know.md` §2). That was for the characters' speech, not learner speech. It also rated too easy, more so higher up.
- **Cost.** One call per conversation, at the end (like `quality.md`). No added wait.
- **ASR robustness.** Medium. The ALTA results were on Whisper transcripts, so they include ASR errors. Whisper's tidying (see §1.6) still pushes ratings up.
- **Any language.** Yes. CEFR is a scale the model knows in any language.
- **Watch out.** The judge must see only the learner's own words as evidence. Lines repeated from the scaffold have to be marked as such (see signal 3). Give it an "not enough evidence" answer: most Beginner conversations will be too thin to rate.

### 2. Speed and pausing, from the audio timing

- **Evidence.** In British Council Aptis speaking tests (32 speakers, 120 performances, A2–C1), speed measures rose from A2 to B1 and again to B2. A2 speakers made much longer silent pauses than B1 speakers. They used few filled pauses ("ehm") and rarely repaired their speech; B1 speakers reformulated actively. Mid-clause pausing separated A2–B1 from B2–C1, but not A2 from B1 [Tavakoli et al. 2020; British Council summary]. In a 2026 study of spontaneous L2 dialogue (A2–B2), a timing-only composite correlated 0.76 with a fluency consensus of ~80 raters. Mean length of run (words between pauses) scored ρ +0.75, pause ratio −0.72, speech rate +0.68, ASR word confidence +0.60. Pure articulation rate (speed while actually talking) told nothing (+0.08). Writing the pauses into an LLM prompt did not help; the signal came from the measured timing [Uehara 2026].
- **Cost.** Small. Groq's `verbose_json` already returns segment start and end times. Word-level timestamps would be better (Groq supports `timestamp_granularities`; check). Speech rate = words ÷ time from first to last word. This must exclude the time before the learner starts and the ~2.5 s silence that ends the turn.
- **ASR robustness.** High. Timing barely depends on which word Whisper chose. One catch: Whisper drops "ehm" and similar fillers by default [Dietz Smith et al. 2025; Zhou et al. 2025], so filled pauses can't be counted from the text.
- **Any language.** Mostly. The measures work anywhere, but the normal rate differs by language. Compare a learner to their own past, or calibrate per language. Never use a single fixed words-per-second cutoff.
- **Uncertain.** Most of this evidence is from English and from monologue or roleplay. Fuori's turns are short. A Beginner who says "Sì, grazie" has no runs worth measuring.

### 3. How the learner takes part (interaction signals)

These are the signals Fuori already half-has: English share (Whisper's detected language, `lib/speech/spoken-language.ts`), help requests, "say it in English", going quiet, and whether a turn repeats an offered answer or is in their own words.

- **Evidence.** Indirect but consistent. Code-switching between learner and tutor follows proficiency: at low levels the tutor drives it, at higher levels the learner chooses it [Sinclair & Fernández 2023]. A2 speakers rarely repair; B1 speakers do [Tavakoli et al. 2020]. Repeating a sentence accurately is itself a validated proficiency measure: elicited-imitation tasks separate proficiency levels with a large effect (Hedges' g = 1.34, 21 studies) [Yan et al. 2016]. Longer target sentences discriminate better.
- **Echo vs own words.** Checking whether a turn matches one of the offered answers is not a phrase list. It compares the learner's text with what the app itself just offered, in any language (string similarity after Whisper). This matters a lot: on the Beginner path most turns may be say-backs, and they must not count as free speech.
- **Response latency.** Weak for Fuori. Learners took about twice as long to start after an AI partner as after a human (0.61 s vs 0.32 s) [Scheinberg et al. 2026]. Fuori's mic also opens on a schedule. I found no study that ties latency in AI dialogue to level. Log it; don't use it to decide.
- **Cost.** Small. Counts per conversation, no model call.
- **ASR robustness.** High for English share and help requests. Medium for echo detection, since Whisper may "repair" a near-miss into the offered sentence.
- **Any language.** Yes.

### 4. Turn length in the learner's own words

- **Evidence.** Mean length of run tracks fluency strongly (ρ 0.75, above). Length and clause count grow with level in speaking-test studies, but I found no clean A1/A2/B1 cutoffs for spoken Italian or Spanish. **Uncertain.** Linguistic knowledge (vocabulary and grammar) explained 76% of the variance in rated speaking adequacy in 181 Dutch L2 speakers [De Jong et al. 2012], so length is a stand-in for something real.
- **Cost.** Small. **Robustness:** Good. Whisper rarely adds or drops whole words, except in hallucinations. **Any language:** Yes, with care for languages that pack more into one word.

### 5. Lexical diversity and word level

- **Evidence.** In L2 oral responses, only "optimized" MATTR and MTLD held up as reliable and valid. Root TTR and D were thrown off by text length [Kyle et al. 2024]. MTLD needs dozens of words to be stable. **Uncertain** for the exact minimum. Fuori already tried word-level lists: Kelly frequency was "unsound", and the syllabus list matched the judge at only 0.28–0.36 (`00-what-we-know.md` §3).
- **Cost.** Small once text is pooled. **Robustness:** Medium. **Any language:** MATTR yes; word lists no (they're language data, and they failed).
- **Use.** Pool across several conversations, or skip it. A single Beginner conversation is too short.

### 6. Grammar accuracy from the transcript (error-free clauses, error rate)

- **Weakest for Fuori.** Three reasons:
  1. **Whisper is worst on the weakest speakers.** Whisper-small had about 17% word error on A2 speech and under 8% on C1 [Sun et al. 2025]. Large-v3 averaged 9.5% on the same corpus [Zhou et al. 2025]. A2 was only 2.7% of that corpus's words, so even these numbers say little about A1.
  2. **Whisper tidies.** ASR is trained to ignore disfluencies, and it tends to write what was meant [Dietz Smith et al. 2025]. In that study, prompted Whisper still most often scored real substitution errors as correct. No study I found measured how often Whisper fixes learner grammar in Italian or Spanish. **Uncertain**, but the direction is clear: transcripts look more correct than the speech was.
  3. **Errors don't rise steadily with level.** Some error types are rare at A1, grow after B1 as learners try harder structures, then fall [Bannò et al. 2024]. Fewer errors can mean less ambition.
- **Use.** Let the holistic judge weigh accuracy along with everything else. Don't build a separate accuracy number.

### 7. Self-report

- **Evidence.** Self-assessment correlates only moderately with tested proficiency: r ≈ 0.45 overall and 0.44 for speaking across 67 studies [Li & Zhang 2021, as reported in a 2023 Spanish OPIc study]. An older meta-analysis found 0.63 (speaking 0.55) [Ross 1998, same source]. Lower-proficiency learners tend to overestimate, higher ones to underestimate [Iwamoto 2023, 196 learners].
- **Use.** A first guess, as Josh already decided. Fuori's own round 14 agrees: one conversation corrected every misplacement.

### Also free in `verbose_json`

Each segment comes with `avg_logprob` and `no_speech_prob`. ASR word confidence tracked fluency at ρ 0.60 [Uehara 2026], so low confidence is a hint, not a rule (accent lowers it too). `no_speech_prob` is the guard against Whisper inventing words in silence. Whisper hallucinated in about 1.4% of transcripts in one study; 38% of those had harmful content. Longer silences predicted it [Koenecke et al. 2024]. Fuori waits up to 5 s for speech, so silent or near-silent recordings will happen. Drop turns that are mostly silence before they count as evidence.

---

## 2. How much evidence before trusting an estimate, and how to avoid flip-flopping

**About five conversations.** In an ETS study of speaking tasks (261 examinees), one task with one rating had dependability 0.51. Four tasks reached 0.79; five reached 0.82. Twelve were needed for 0.90. Adding tasks helped more than adding raters, and gains flattened after 5–6 [Lee 2005]. The learner-by-task interaction was about 17% of the variance in a single score. In plain words, people do better on some tasks than others, so one conversation says little. Josh's "start with 5" fits this well. A conversation at the bakery and one about a train are different tasks, which helps.

**But only conversations with enough of the learner's own speech count.** A conversation where the learner only repeats offered answers is not a speaking sample. I found no published minimum for short dialogue turns. **Uncertain.** A working rule to test: a conversation counts if it has at least 3 turns in the learner's own words (not echoes, not English).

**Rate the conversation, not the line.** Josh's rule says "90% of the learner's speech at the next level". Rating single lines is unstable. A one-word answer has no level, and the Haiku judge wobbles run to run. All the scoring systems above rate a whole response or set of responses.

**Avoid flip-flopping (hysteresis).** Mastery research warns that thresholds like BKT's 0.95 often declare mastery too early when the model's assumptions don't fit. It recommends simple rules: average performance plus number of attempts [Pelánek 2018]. Elo-style systems in learning apps shrink the update size as evidence builds up, so early answers move the estimate a lot and later ones little [Pelánek et al. 2017; from the abstract and general knowledge of the method, **not checked in the full text**]. For Fuori that suggests the following (my design, not from a source):

- **Up:** at least 4 of the last 5 counted conversations rated B1-ready by the judge, **and** the counts agree: English share falling, own-words turns rising. Then Magda suggests; the learner decides.
- **Down:** never automatic. If 3 conversations in a row show the learner lost (lots of English, help requests, silence), add support back (slower speech, more English) without changing the label. Support can move often; the label should not.
- **After a move,** ignore the old window. Start a fresh count before any move back.
- **Keep every rating** with its reason, as `level_checks` already does, so a wrong move can be traced.

---

## 3. Implications for Fuori, ranked

1. **A speaking record per conversation** (cost: small). When a conversation ends, store counts: turns in own words, echoes of offered answers, English turns, help and "say it in English" uses, empty or silent turns, words per own-words turn, and speech rate and pause ratio from Whisper's timings. All of these work in any language. They are the cheap backbone, and they make the judge's ratings checkable.
2. **Mark echoes of offered answers** (small). Compare each learner turn with the answers the character offered. Exclude echoes from "own speech". Use echo accuracy as a separate Beginner-stage signal, as an elicited-imitation measure: repeating a longer sentence accurately is real evidence [Yan et al. 2016].
3. **Turn the level check into a learner-speaking judge per conversation** (medium). Reuse `learner-level.md`'s approach (holistic, CEFR known to the model, "if in doubt, lower"). Change three things: rate one conversation at a time, see the speaking record, and allow "not enough evidence". Run it on every counted conversation, not just the first 3. One Sonnet or Haiku call per conversation.
4. **Calibrate on real graded learner speech** (medium). The open problem in `00` §5 ("needs an examiner-graded learner corpus") has an Italian answer. LIPS holds about 1,500 CILS oral exams from about 500 candidates, A1–C2, about 700,000 tokens, Università per Stranieri di Siena, listed as available at parlaritaliano.it [Gallina]. The level is the exam taken; pass or fail per candidate needs checking. **Uncertain.** For Spanish, look for an equivalent oral learner corpus (not researched here). Use 20–40 A1–B1 samples as the judge's answer key, the way exam listening scripts were used for characters.
5. **Use the up-and-down rule from §2** (small). 4 of 5 counted conversations to suggest moving up; support, not label, moves down.
6. **Treat Whisper text as optimistic** (small). Don't build an accuracy measure on it. Drop mostly-silent turns using `no_speech_prob` and recording length. Never run Whisper with a prompt holding the expected answer for scoring, because it pulls the text toward the target [Dietz Smith et al. 2025].
7. **Make sure the Beginner format leaves something to measure** (small to medium; a dialogue decision for Josh). If every Beginner turn is a say-back, nothing shows readiness for B1. Fading stages that ask for own words (the 1,2,1,1,2 stages) are the moments the evidence comes from.
8. **Skip lexical diversity and word lists for now** (none). Revisit MATTR on pooled text once there's data.

---

## 4. What questions the direction

- **"90% of the learner's speech at the next level" can't be measured as written.** Most Beginner lines are too short to have a level. No validated system scores L2 speaking line by line. Suggest wording it as "most recent conversations judged at the next level (4 of 5)", with the line-level 90% kept only as the target for what characters say.
- **Whisper pushes toward moving up too early.** It is least accurate on the weakest speakers and tidies their errors. A judge reading Whisper text will see a more fluent, more correct learner than an examiner would hear. Holding at 4 of 5, keeping "if in doubt, lower", and leaning on timing and interaction counts are the guards.
- **The Beginner format may starve the measurement.** If the learner mostly says back offered answers, there is little own speech to judge. That's fine early on, but the move to Intermediate depends on turns where the learner builds a sentence.
- **Speaking lags listening.** Josh decided speaking decides moving up and listening sets how characters talk. A learner who follows B1 speech but speaks at A2 would stay with Beginner characters a long time. The interaction counts (few help requests, little English) are listening evidence. They could raise how characters talk before the speaking label moves. This is consistent with Josh's split, but nothing would do it today.
- **The evidence base is mostly English.** Almost every automatic-scoring study here is on English learners, and most on B1–B2. A1 is barely represented (A2 is 2–3% of the main Cambridge corpus). Expect weaker numbers at Fuori's starting levels, in Italian and Spanish.

---

## 5. Sources

- [Natural Language-based Assessment of L2 Oral Proficiency using LLMs (Bannò, Ma, Qian, Tang, Knill, Gales, 2025)](https://arxiv.org/html/2507.10200v1)
- [Can GPT-4 do L2 analytic assessment? (Bannò, Vydana, Knill, Gales, 2024)](https://arxiv.org/pdf/2404.18557)
- [Interpretable, Fairly Evaluated Automated L2 Speaking Assessment… Pause Encoding (Uehara, 2026)](https://arxiv.org/pdf/2608.26137)
- [Aspects of fluency across assessed levels of speaking proficiency (Tavakoli, Nakatsuhara, Hunter, 2020)](https://reading-clone.eprints-hosting.org/84796)
- [Tavakoli et al., British Council non-technical summary (Aptis fluency)](https://www.britishcouncil.org/sites/default/files/tavakoli_et_al_non-tech_vb_0.pdf)
- [Facets of speaking proficiency (De Jong, Steinel, Florijn, Schoonen, Hulstijn, 2012)](https://dare.uva.nl/id/5b444a03-fb61-4a24-86c1-b5e3cbe69e3f)
- [Evaluating evidence for the reliability and validity of lexical diversity indices in L2 oral task responses (Kyle, Sung, Eguchi, Zenker, 2024)](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/evaluating-evidence-for-the-reliability-and-validity-of-lexical-diversity-indices-in-l2-oral-task-responses/E51955F0291E21A916CD2C4787508B80)
- [Proficiency-Aware Adaptation and Data Augmentation for Robust L2 ASR (Sun, Zhu, Shi, 2025)](https://arxiv.org/html/2510.10738v1)
- [Speak & Improve Challenge 2025: Tasks and Baseline Systems](https://arxiv.org/pdf/2412.11985)
- [Acoustically Precise Hesitation Tagging Is Essential for End-to-End Verbatim Transcription Systems (Zhou et al., 2025)](https://arxiv.org/html/2506.04076v2)
- [Prompting Whisper for Improved Verbatim Transcription and End-to-end Miscue Detection (Dietz Smith, Yee, King Chen, Findlater, 2025)](https://arxiv.org/pdf/2505.23627)
- [Careless Whisper: Speech-to-Text Hallucination Harms (Koenecke et al., 2024)](https://talkbank.org/aphasia/publications/2024/Koenecke24.pdf)
- [Alignment of code switching varies with proficiency in second language learning dialogue (Sinclair & Fernández, 2023)](https://dare.uva.nl/id/858af213-a565-4848-8eab-f2b30c389935)
- [What Changes When the Interlocutor Is an AI? Interactional Fluency and Linguistic Uptake in L2 Spoken Dialogue (Scheinberg et al., 2026)](https://arxiv.org/pdf/2606.22225)
- [Elicited imitation as a measure of second language proficiency: a narrative review and meta-analysis (Yan, Maeda, Lv, Ginther, 2016)](https://journals.sagepub.com/doi/10.1177/0265532215594643)
- [Self-assessment and Spanish OPIc study, reporting the Ross 1998 and Li & Zhang 2021 meta-analyses (Cambridge, c. 2023)](https://www.cambridge.org/core/product/786D4E0E0D500DCDD43CCE24ED610592/core-reader)
- [Relationship Between L2 Proficiency and Psychological Traits With Self-Assessment Bias Among L2 Speakers (Iwamoto, 2023)](https://jalt-publications.org/articles/28458-relationship-between-l2-proficiency-and-psychological-traits-self-assessment-bias)
- [Dependability of Scores for a New ESL Speaking Test: Evaluating Prototype Tasks (Lee, ETS RM-04-07, 2005)](https://www.ets.org/Media/Research/pdf/RM-04-07.pdf)
- [Conceptual Issues in Mastery Criteria (Pelánek, 2018)](https://www.fi.muni.cz/~xpelanek/publications/mastery-modeling.pdf)
- [Elo-based Learner Modeling for the Adaptive Practice of Facts (Pelánek et al., 2017)](https://www.ics.muni.cz/en/research/publications/1359654)
- [Duolingo English Test short paper (correlations with TOEFL 0.71, IELTS 0.70)](https://s3.amazonaws.com/duolingo-papers/other/DET_ShortPaper.pdf)
- [LIPS, a corpus of spoken Italian by foreigners from CILS exams (Gallina)](https://www.lancaster.ac.uk/fass/events/laelpgconference/papers/v04/2-Francesca%20Gallina.pdf)

Not read (blocked or inaccessible during research): the Careless Whisper arXiv abstract page, Cambridge's "Self-assessment in second language learning" review, and the BEA 2023 GPT-4 CEFR essay paper. The figures above come from the pages that were read.
