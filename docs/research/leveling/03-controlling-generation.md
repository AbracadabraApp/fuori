# Leveling: what holds a model's language to a level

2026-11-02 · Research agent, topic: controlling generation · Scope: Beginner (A1–A2) → Intermediate (B1). Read [00-what-we-know.md](00-what-we-know.md) first. This page builds on [llm-language-learning.md](../llm-language-learning.md) and goes deeper and newer.

**The short version.** Telling a model the level works on average, but it is weak, and it slides over a long conversation. Every published method that holds a beginner level reliably does one of two things. It steers the model word by word (which needs access the Anthropic API doesn't give), or it checks each line and throws out or rewrites the ones that miss. For Fuori, the realistic path is a strong prompt plus a check on every line, and the check has to be fast. Fuori's own prompt results (60–91% of lines a beginner can follow) already match or beat what papers report for prompting alone. So the next gains will come from checking and choosing, not from more wording.

## 1. Techniques, ranked by evidence

### 1.1 Steer the model word by word (constrained or guided decoding)

**How it works.** While the model writes, a small classifier lowers the odds of words above the level. FUDGE is the best-known version. A harder form masks every word outside an allowed list.

**Measured effect.** This is the strongest result for beginner dialogue. In a Japanese tutoring study, real A1–A2 learners understood 39.4% of turns with a basic level prompt, 58.3% with a detailed prompt, and **83.3% with FUDGE**. The share of words they missed fell from 17.2% to 8.0%. FUDGE also showed no upward drift across turns, while the prompt methods did ([Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). The sample was small: 6 learners, 6 turns per method. For children's English dialogue, masking out-of-list words cut violations from 45% to 9%, but grammar errors appeared and quality dropped a little ([Controllable Spoken Dialogue Generation 2026](https://arxiv.org/pdf/2604.22542)). A 2022 Cambridge chatbot found that soft word penalties plus a filter matched examiner-rated level best (rank correlation 0.755). Hard vocabulary limits did poorly (about 0.2) ([Tyen et al. 2022](https://aclanthology.org/2022.bea-1.28.pdf)).

**Latency and cost.** Small, if you run your own model. None of these papers report latency.

**Fit with Fuori.** **Not available.** It needs the model's word probabilities at each step. As far as this research found, the Anthropic Messages API exposes no logit bias, token mask or log-probabilities. It offers structured JSON output, which Fuori already uses (`lib/level.ts`), but that shapes format, not words. *Uncertain: the API docs page was blocked during this research and could not be re-checked.* Hard masks would also need a fixed word list per language, which Fuori has ruled out (CLAUDE.md; 00 §4).

**Tried in Fuori?** No. It can't be, on Claude.

### 1.2 Check each line, then keep, choose or fix (judge-in-the-loop)

This is the API-friendly stand-in for guided decoding. It comes in three forms.

**a. Generate several, pick the easiest (overgenerate and rerank).** The Cambridge chatbot drew 20 candidates and ranked them by a sentence-level CEFR model. Examiner agreement with the target level reached 0.72, with only small losses in sense and grammar: sensible 76% against 82%, grammatical 87% against 90% ([Tyen et al. 2022](https://aclanthology.org/2022.bea-1.28.pdf)). With only 5 candidates, the Japanese study saw no gain over a good prompt: 58.3% for both ([Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). So the effect depends on how many candidates there are and how good the scorer is. Learners rated the reranked turns the most natural (7.5 of 10).

**b. Generate, judge, revise until it passes.** A 2026 English study scored each sentence with a fine-tuned CEFR classifier. Lines that failed went back with feedback until they passed. **87.4% of sentences landed within one level of the learner, against 54.1% without the loop**, and none were above B2 ([Level-appropriate agents 2026](https://arxiv.org/pdf/2607.21887)). Only 3 learners took part, so treat it as a demo. One detail matters for drift: **only accepted lines entered the model's memory.** The model never saw its own harder lines, so it had nothing to imitate.

**c. Simplify with a second model.** The 2025 shared task on simplifying to A2 and B1 drew 20 teams. The winners all generated many candidates and then selected them with a CEFR scorer. Some made up to 120 candidates from six models. A Claude Sonnet 4 system that looped up to 5 times on CEFR feedback reached an error of 0.12 levels. The organisers' conclusion: reliable control "often requires complex, multi-iterative processes" ([TSAR 2025 findings](https://preview.aclanthology.org/ingest-emnlp/2025.tsar-1.8.pdf)). That task was English text, not dialogue.

**Latency and cost.** This is the catch for a 2-second turn. Candidates can run in parallel, so best-of-3 costs 3× tokens but little extra wait. The judge adds a step in sequence. An API LLM judge takes about 1 s per call. A small fine-tuned classifier takes about 10–100 ms ([Ace-CEFR 2025](https://arxiv.org/html/2506.14046v1)). A full retry adds a whole turn, about 2 s on Sonnet without thinking (prompt-trials, 18b).

**Fit with Fuori.** Good in principle, and it works in any language if the judge does. Today's word-level judge (`level.md`) runs on Sonnet with thinking, so it is too slow to sit in the turn. A CEFR-named judge on Haiku ranked lines about as well as Sonnet (rank correlation 0.89 against 0.85), so a fast judge looks possible (level-judge-test round 2). Its speed wasn't measured.

**Tried in Fuori?** Partly. A rewrite pass on single lines made them simpler but lost persona, place and teaching, and it added 1–3 s. Rewriting **with the whole conversation in view** kept all three and roughly halved line length (level-judge-test, 2026-10-16 samples). No form of the loop has run on live turns, and best-of-N has never been tried.

### 1.3 Describe the learner in the prompt (name the level, give examples, or list features)

**How it works.** Put the level in the system prompt as a CEFR label, a description, example lines, or rules ("short sentences, present tense").

**Measured effect.** It works on average, but weakly. Four open 7–12B models given A1, B1 or C1 prompts did produce text in the right order on Spanish readability, length and sentence structure. Over nine turns the levels **drifted toward each other**, and the authors call prompting alone "brittle" ([Almasi & Kristensen-McLachlan 2025](https://arxiv.org/html/2505.08351v2)). In the Japanese study, a detailed prompt (level description, an example dialogue, 100 known expressions) raised comprehension from 39% to 58%, still far below FUDGE ([Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). Asked to rewrite to A1 words, even GPT-5.2 reached only 45% coverage of A1 vocabulary ([Re-RIGHT 2026](https://arxiv.org/pdf/2604.05302)). An earlier study found GPT-4 controls CEFR level "reasonably well" with few-shot prompts for stories, not dialogue (Malik et al. 2024, as reported in [llm-language-learning.md](../llm-language-learning.md); *the paper page was blocked here, so its numbers weren't re-checked*). Naming fine-grained grammar targets in the prompt gave accurate but "too homogeneous" output. Ranking candidates with a grammar detector did better than GPT-4 prompting alone ([Glandorf & Meurers 2024](https://aclanthology.org/2024.bea-1.24/)).

**Latency and cost.** None beyond a few prompt tokens.

**Fit with Fuori.** Good, and already the base layer. Fuori's own results are the best evidence for its own setup. Describing the learner's situation beat a list of rules (68% vs 60% of lines followable in Italy; 66% vs 59% in Mexico). "Still you, sometimes ask" reached 62–68% in Italy and 80–91% in Mexico, against 23–27% with no block (level-judge-test rounds 2–6). That is in line with, or better than, published prompt-only results.

**Tried in Fuori?** For Beginner, yes, many times (00 §3). **For Intermediate, never.** No tier reaches the Intermediate prompt at all (00 §1). So "name B1 in the prompt" is untested, not failed. The literature suggests B1 is the easier target: the drift studies show prompts separate levels on average, and the hard problem sits at A1.

### 1.4 Give the model a word list

**How it works.** Put allowed words, or "words the learner knows", in the prompt.

**Measured effect.** Weak. Putting a whole graded vocabulary in the system prompt barely helped: 45% of turns broke the list, against 42% for the base model ([Controllable Spoken Dialogue Generation 2026](https://arxiv.org/pdf/2604.22542)). The Japanese "detailed" prompt included 100 known expressions, but its effect wasn't separated from the rest ([Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). Story systems that hold vocabulary to a learner's known words do it with decoding, not prompting ([SRS-Stories 2025](https://preview.aclanthology.org/setup/2025.emnlp-industry.44)).

**Fit with Fuori.** Poor. Fixed lists are ruled out, and Fuori's lists failed as judges (Kelly; syllabus list, rho 0.28–0.36, round 23). The one form still open is Josh's idea 3: the learner's own words, as a record rather than a prediction (level-judge-test, "Ideas to keep"). No paper tested that in a prompt.

### 1.5 Train the model (fine-tuning, reinforcement learning)

**Measured effect.** Strong. RL with a vocabulary reward cut violations from 55% to 7% while keeping variety and quality ([Controllable Spoken Dialogue Generation 2026](https://arxiv.org/pdf/2604.22542)). A 4B model trained this way beat Gemini 2.5 prompting on coverage at easy levels ([Re-RIGHT 2026](https://arxiv.org/pdf/2604.05302)).

**Fit with Fuori.** Out of reach on Claude, and against "all Claude calls through `lib/claude.ts`". Mentioned only because it shows where the ceiling is.

### 1.6 Re-state the level near the end of the context

**How it works.** Put the level block in the newest message, not only the system prompt, to fight drift.

**Fit and evidence.** No outside study isolates it. In Fuori it tied on Sonnet and helped Haiku (43% → 57%), though Haiku in Mexico still slid from 87% to 27% late in a conversation (level-judge-test rounds 3–4). The judge-in-the-loop "only keep accepted lines" trick (1.2b) is a stronger fix for drift, because it cleans the history the model copies.

## 2. Measuring level for Italian and Spanish

| Tool | What it gives | Good for Fuori? |
|---|---|---|
| **Claude, CEFR named** (Fuori's judge) | One level per line | Yes, for comparing. Rank correlation 0.84–0.89 on exam lines and graded readers. But it rates too easy, more so higher up (level-judge-test round 2) |
| **Claude, hard words** (`level.md`) | Share of words a beginner knows | Yes. It's the scorecard measure. Too slow for the live turn |
| **Word-miss rate against learner lists** | Share of tokens unknown | It tracked real learners' comprehension well (ρ 0.78) in Japanese ([Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). Fuori's list version failed on gaps and lemma errors (round 23) |
| **Fine-tuned classifiers** (XLM-R on UniversalCEFR) | CEFR class, in about 10–100 ms | Promising for speed. Weighted F1 was 83% for Italian and 70% for Spanish. Prompted open LLMs got 77% and 37% ([UniversalCEFR 2025](https://arxiv.org/abs/2506.01419v1)). *Caveat: much of the data is learner writing, not speech heard by a learner.* An Italian L2 text-difficulty system also exists ([MALT-IT2 2020](https://preview.aclanthology.org/setup/2020.lrec-1.890)) |
| **Expert-labelled short lines** | A model of how hard short spoken lines are | The right kind of data: 890 lines averaging 12 words. A fine-tuned BERT came close to the best LLM setup (error 0.37 against 0.48), and a single human expert scored 0.75 ([Ace-CEFR 2025](https://arxiv.org/html/2506.14046v1)). *English only.* |
| **Gulpease** (Italian) | Score from letters per word and sentence length; below 80 is hard for a reader with only primary school ([SupportHost](https://supporthost.com/it/flesch-reading-ease-in-italiano-e-la-sua-affidabilita)) | Not per line. All these formulas were built for long texts. Fuori's length-only control ranked lines at only 0.46 (round 2) |
| **Fernández-Huerta, Szigriszt-Pazos (INFLESZ scale), Gutiérrez de Polini, Crawford** (Spanish) | Flesch-style scores | Same caveat. Short texts make the sentence-length term swing ([Screaming Frog](https://www.screamingfrog.co.uk/blog/readability-of-spanish-texts-alternative-metrics-to-flesch/)). Fine for whole-conversation trends. The `textstat` library has Gulpease and all four Spanish formulas ([textstat](https://pypi.org/project/textstat)) |

**How Duolingo scores a call.** It runs a CEFR predictor on every turn of a Video Call transcript and **takes the hardest turn as the call's level** ([Glance, KDD 2025, via CEO Interviews](https://ceointerviews.ai/quote/we-use-a-cfr-predictor-to-tag-each-Mzg0NDQ3/)). Its research report shows speaking gains from both Falstaff (guided, for beginners) and Lily (open, for intermediates), but it gives no numbers on comprehension or level fit ([Duolingo](https://blog.duolingo.com/video-call-research-report)).

**How good are LLM judges against humans?** With no examples, a large LLM judge was poor: error 1.45 levels squared, worse than a simple feature model (0.81). With examples and separate prompts for words and phrases, it got to 0.48, better than one human expert ([Ace-CEFR 2025](https://arxiv.org/html/2506.14046v1)). Averaging three runs helped (0.98 → 0.78). Fuori's own judge already ranks lines well, so its main problem is calibration (too lenient). Examples at level, which Fuori hasn't tried yet (approach 3 in the judge test), are the published fix.

## 3. Spoken, not written

- **Coverage for listening.** Listeners who knew 90% of the words scored 7.35 of 10, and at 95% they scored 7.65. The difference wasn't significant, but the 90% group varied far more. The authors recommend 95% ([van Zeeland & Schmitt, via Cambridge](https://www.cambridge.org/core/product/1D217A56A2E0056E67802A6A8360FDDE/core-reader)). Being able to ask questions in a conversation may lower the need, but that is a prediction, not a result (same source).
- **Speed.** Slowing from 116 to 98 words a minute helped young learners. Slowing further to 58 made no difference ([Chiu & Chen 2023](https://ideas.repec.org/a/ibn/eltjnl/v16y2023i7p74.html)). Slowed recordings felt easier but were not rated more appealing. Simplified wording at normal speed raised real comprehension (German 53% → 77%) and interest ([Gallien et al. 2000](https://jalt-publications.org/sites/default/files/pdf-article/jj-22.2-art3.pdf)). *Inference:* Fuori's 0.7 speed for Beginners may be past the point where slower helps. Simpler words probably matter more than slower speech.
- **Elaborate, don't only simplify.** Older work found that input changed through interaction (repeating, rephrasing, checking) helps comprehension at least as much as pre-simplified input, and it may support deeper processing (Pica, Young & Doughty 1987; Long & Ross 1993; both summarised in [Gallien et al. 2000](https://jalt-publications.org/sites/default/files/pdf-article/jj-22.2-art3.pdf)). This matters for Fuori's "simpler means flatter" problem. A character can keep a lively line and add a repeat or a gloss, rather than stripping the line bare.

## 4. Implications for Fuori, ranked

1. **Put a B1 block in the Intermediate prompt, naming the level and describing the learner ("still you" style).** It has never been tried. The evidence says prompts separate levels on average, and B1 is the easier target. Measure with the existing judges on `test:replay`, early against late turns. *Cost: small.*
2. **Score every live character line with a fast judge, logged, not acted on.** Use the hardest-turn rule (Duolingo) alongside the share of lines that pass. This gives real-play numbers, which 00 §2 says don't exist yet. Run it after the line plays, so it adds no wait. *Cost: small to medium (one Haiku call per line).*
3. **Calibrate the CEFR judge with examples at each level** from exam and graded-reader lines (approach 3, never run). Published few-shot gains are large (1.45 → 0.48 error). *Cost: small.*
4. **Best-of-2 or best-of-3 in parallel, chosen by a fast judge.** Draw 2–3 Sonnet replies at once (no thinking), score each for level, and keep the easiest one that still answers the learner. Accept only checked lines into the history, so drift has nothing to feed on. Measure the added wait first: it must fit in the 2 s budget. *Cost: medium (2–3× turn tokens, plus about 0.5–1 s, unmeasured).*
5. **Retry only on a clear miss**, with the whole conversation in view and the hard words named. Fuori's own samples show context-aware rewrites keep persona and teaching. Use it when best-of-N finds no passing line. *Cost: medium (+~2 s on the turns that miss).*
6. **Prompt for elaboration as well as simplicity.** For example: "if you use a word they may not know, say it again another way". Test whether lines stay alive at the same level of comprehension. Fits CLAUDE.md's "slowing down, repeating, rephrasing". *Cost: small.*
7. **Re-test Beginner speech at 0.8–0.85 against 0.7.** The evidence suggests mild slowing helps and heavy slowing doesn't. Josh's ear decides. *Cost: small.*
8. **A small fine-tuned classifier for Italian and Spanish** (XLM-R on UniversalCEFR, tuned on Fuori's own judge labels). It is the only judge fast enough (about 0.1 s) to sit in every turn cheaply. It runs outside `lib/claude.ts`, needs one per language, and is trained on writing. *Cost: large.*

## 5. Findings that question the direction

- **The most effective method isn't available on Claude.** Guided decoding (83% understood) and RL-trained models beat every prompt method, and both need open weights. Over the API, the ceiling in the literature is roughly 58–87%, reached with prompts plus judge loops. Fuori is already at 62–91% on Beginner blocks. **Going from there to 90%+ on every turn may not be possible with prompting alone, at Sonnet speed, within 2 s.** The honest choices are: accept a checking step that costs time or tokens, or count help (English, repeats, "say it again") toward "follows" instead of chasing 90% raw coverage.
- **The 90% bar sits between two things.** The listening research says 95% coverage is the safer bar for understanding a passage, and 90% still works on average. Fuori's bar is 90% of words on 90% of lines, with the option to ask. That is probably fine for live, interactive talk, but it hasn't been checked against real learners' comprehension. A 6-person test like Jin et al.'s, where learners mark words they didn't get, would calibrate the judge better than more exam lines.
- **Simplifying may be the wrong lever for liveliness.** Research favours elaboration (repeat, rephrase, gloss) over stripping a line bare, which is where Fuori's flatness comes from (00 §5). Beginner.md's English parts are already a form of elaboration.
- **Fuori's own Haiku drift matches the literature.** Prompted levels slide late in conversations ([Almasi & Kristensen-McLachlan 2025](https://arxiv.org/html/2505.08351v2); [Jin et al. 2025](https://arxiv.org/html/2506.04072v2)). A faster model will need either a check on each line or a clean history, not a longer prompt.

## Sources

- [Alignment Drift in CEFR-prompted LLMs for Interactive Spanish Tutoring (Almasi & Kristensen-McLachlan, BEA 2025)](https://arxiv.org/html/2505.08351v2)
- [Toward Beginner-Friendly LLMs for Language Learning: Controlling Difficulty in Conversation (Jin, Dugan, Callison-Burch 2025)](https://arxiv.org/html/2506.04072v2)
- [Towards an open-domain chatbot for language practice (Tyen et al., BEA 2022)](https://aclanthology.org/2022.bea-1.28.pdf)
- [Findings of the TSAR 2025 Shared Task on Readability-Controlled Text Simplification](https://preview.aclanthology.org/ingest-emnlp/2025.tsar-1.8.pdf)
- [Towards Reducing Foreign Language Anxiety Using Level-Appropriate Embodied Conversational Agents (2026)](https://arxiv.org/pdf/2607.21887)
- [Controllable Spoken Dialogue Generation: An LLM-Driven Grading System for K-12 Non-Native English Learners (2026)](https://arxiv.org/pdf/2604.22542)
- [Right at My Level: A Unified Multilingual Framework for Proficiency-Aware Text Simplification (Re-RIGHT, 2026)](https://arxiv.org/pdf/2604.05302)
- [Towards Fine-Grained Pedagogical Control over English Grammar Complexity in Educational Text Generation (Glandorf & Meurers, BEA 2024)](https://aclanthology.org/2024.bea-1.24/)
- [SRS-Stories: Vocabulary-constrained multilingual story generation for language learning (EMNLP 2025 Industry)](https://preview.aclanthology.org/setup/2025.emnlp-industry.44)
- [From Tarzan to Tolkien: Controlling the Language Proficiency Level of LLMs for Content Generation (Malik et al., Findings ACL 2024)](https://preview.aclanthology.org/dashboard/2024.findings-acl.926)
- [Flesch or Fumble? Evaluating Readability Standard Alignment of Instruction-Tuned Language Models (Imperial & Tayyar Madabushi, GEM 2023)](https://aclanthology.org/2023.gem-1.18)
- [UniversalCEFR: Enabling Open Multilingual Research on Language Proficiency Assessment (2025)](https://arxiv.org/abs/2506.01419v1)
- [Ace-CEFR: A Dataset for Automated Evaluation of the Linguistic Difficulty of Conversational Texts for LLM Applications (2025)](https://arxiv.org/html/2506.14046v1)
- [MALT-IT2: A New Resource to Measure Text Difficulty in Light of CEFR Levels for Italian L2 Learning (LREC 2020)](https://preview.aclanthology.org/setup/2020.lrec-1.890)
- [Natalie Glance (Duolingo), KDD 2025 talk, quoted on CEO Interviews](https://ceointerviews.ai/quote/we-use-a-cfr-predictor-to-tag-each-Mzg0NDQ3/)
- [Duolingo Video Call research report](https://blog.duolingo.com/video-call-research-report)
- [How much vocabulary is needed to use English? Replication proposal (van Zeeland & Schmitt et al., Language Teaching)](https://www.cambridge.org/core/product/1D217A56A2E0056E67802A6A8360FDDE/core-reader)
- [The effect of speech rate on listening comprehension (Chiu & Chen 2023, English Language Teaching)](https://ideas.repec.org/a/ibn/eltjnl/v16y2023i7p74.html)
- [Simplified and slowed authentic listening texts (Gallien, Hotho & Staines, JALT Journal 2000)](https://jalt-publications.org/sites/default/files/pdf-article/jj-22.2-art3.pdf)
- [Readability of Spanish Texts: Alternative Metrics to Flesch (Screaming Frog)](https://www.screamingfrog.co.uk/blog/readability-of-spanish-texts-alternative-metrics-to-flesch/)
- [Flesch Reading Ease in italiano e la sua affidabilità (SupportHost; Gulpease thresholds)](https://supporthost.com/it/flesch-reading-ease-in-italiano-e-la-sua-affidabilita)
- [textstat (Python readability library)](https://pypi.org/project/textstat)
- Repo: [00-what-we-know.md](00-what-we-know.md), [../../prompt-trials.md](../../prompt-trials.md), [../../level-judge-test.md](../../level-judge-test.md), [../llm-language-learning.md](../llm-language-learning.md)
