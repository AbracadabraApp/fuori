# Learner modelling from conversation transcripts with LLMs (proficiency estimation and error tracking)

Scope note: the evidence is overwhelmingly English-only. Italian and Spanish coverage is flagged wherever it exists. Several full-text PDFs (MultiGEC-2025 overview, Yancey et al. 2023) could not be text-extracted in this session, so some headline numbers are missing; those are listed under Gaps rather than guessed.

## 1. How reliable are LLMs at CEFR level estimation of learner speech or text?

### Takeaway
With calibration examples or rubric descriptors, LLMs reach roughly human-level agreement on aggregated proficiency ratings (QWK roughly 0.6 to 0.9, depending on task), but zero-shot scoring is compressed toward the middle and overestimates weak learners. Agreement also varies with the learner's first language. A single short conversation is a noisy basis for a CEFR label. Estimates should be pooled across sessions and treated as coarse bands, not precise levels.

### Cited Findings
- Duolingo researchers (Yancey, LaFlair, Verardi, Burstein, BEA 2023) rated short L2 English essays on the CEFR with GPT-3.5 and GPT-4. With calibration examples, GPT-4 performed "almost as well as modern Automatic Writing Evaluation methods", but agreement with humans varied by the test taker's L1. The human-human QWK was 0.87. (English only, written.) — [Yancey et al. 2023, BEA](https://aclanthology.org/2023.bea-1.49)
- For Finnish L2 speech scoring (2025), the best LLM setup (few-shot with soft labels) reached QWK 0.67 against 0.73 for human raters. Human-human QWK on some tasks was only 0.41 to 0.61, which shows the human ceiling itself is low. Adding grading examples improved accuracy but made the model less certain which level to choose. (Finnish, non-English.) — [Finnish L2 speech scoring, AAAS 2025](https://aclanthology.org/2025.aaas-1.2.pdf)
- A zero-shot speech LLM (Qwen2-Audio-7B) on Speechocean762 (English, Mandarin L1) matched human scores exactly only 23 to 26% of the time. Predictions clustered between 7 and 9 out of 10. For 863 utterances with human accuracy scores of 6 or below, it never gave a score of 6 or below. It failed to give low scores in 95.7% of low-fluency cases and 89.3% of low-prosody cases. Raw Pearson correlations ranged from -0.02 to 0.21. — [Zero-Shot Speech LLMs for L2 Speech, arXiv 2601.16230](https://arxiv.org/html/2601.16230v1)
- Zero-shot audio LLMs tend to over-score delivery, and Qwen2-Audio's zero-shot fluency scoring was close to chance. — [arXiv 2608.26137](https://arxiv.org/pdf/2608.26137)
- Bannò et al. (SLaTE 2025) gave Qwen 2.5 72B, zero-shot and text-only, the "can-do" descriptors written for human examiners. On the S&I spoken corpus it beat a BERT model trained for the task. It did not beat fine-tuned speech LLMs, and it was "particularly effective in mismatched task settings". The authors claim interpretability because scores are grounded in the descriptors. — [Bannò et al., arXiv 2507.10200](https://arxiv.org/abs/2507.10200); [SLaTE PDF](https://www.isca-archive.org/slate_2025/banno25_slate.pdf)
- Ace-CEFR (conversational text difficulty): zero-shot LLM CEFR estimates were worse than a trained baseline but better than random. The two human raters agreed at QWK 0.89. — [Ace-CEFR, arXiv 2506.14046](https://arxiv.org/pdf/2506.14046)
- In analytic L2 writing assessment, zero-shot LLMs were better than humans at spotting weaknesses, and humans were better at spotting strengths. — [Self-Referential Analytic Assessment, arXiv 2605.04298](https://arxiv.org/html/2605.04298v1)
- A CEFR-aligned interview dialogue system (SIGDIAL 2024) reported 0.929 agreement with a gold standard, against human-rater QWK of 0.800 to 0.835. It is unclear from the snippet whether the scorer is an LLM. — [SIGDIAL 2024](https://aclanthology.org/2024.sigdial-1.34.pdf)

### Inferences
- For Fuori, the teacher (Magda) should keep a coarse, slowly moving level estimate (for example "around A2, solid on present tense") updated from several sessions, not a hard CEFR label rewritten after each chat. One conversation gives too little evidence, and zero-shot scoring is biased upward for weak learners.
- Prompting with CEFR can-do descriptors is the best-supported zero-shot approach and also yields explanations the study file can reuse.
- Expect overestimation at the beginner end, which is where Fuori's M1 learners are. Ask the model for concrete evidence (quoted utterances) behind any level claim, and only let the level rise when the evidence repeats across conversations.
- Voice conversations with characters are short, scaffolded turns, so the learner's utterances may be only tens of words. That is far less than the essay or monologue data these studies use.

### Gaps
- GPT-4's exact QWK in Yancey et al. 2023 was not retrieved (PDF not text-extractable here).
- I found no study of LLM CEFR estimation from short, multi-turn dialogue transcripts. None found for Italian or Spanish speech either.
- I found no quantitative study of how many words or turns are needed for a stable LLM CEFR estimate.

## 2. How accurate are LLMs at grammatical error detection/correction for L2 learners, especially Italian/Spanish and spoken language?

### Takeaway
Modern LLMs are strong at fluency-style correction but over-correct under minimal-edit standards (BEA-2019). Over-correction, meaning rewrites of acceptable text, is the dominant false-positive mode, and it is worse in lower-resource languages. Italian is covered by MultiGEC-2025, where small LoRA-tuned open models won. A 2024 Italian study found humans still beat ChatGPT, Gemini, Copilot and Llama 3 at L2 Italian error detection. I found no LLM GEC evaluation for learner Spanish.

### Cited Findings
- GPT-4 set a new high on the fluency-oriented JFLEG benchmark but "significantly underperformed" on the minimal-edit BEA-2019 benchmark (Coyne et al. 2023, as summarised in Goto et al.). — [Goto et al., BEA 2026 / arXiv 2605.13624](https://arxiv.org/pdf/2605.13624)
- Edit-level majority voting over several samples from one LLM, a training-free method, reduces over-correction. It beats greedy and MBR decoding across nine benchmarks in English, Czech, German, Ukrainian, Korean, Hindi and Romanian. Over-correction matters most on low-error text (CWEB-G). — [Goto et al., ACL Anthology 2026.bea-1.60](https://aclanthology.org/2026.bea-1.60/)
- Claude Sonnet 4.5 is reported to show superior zero-shot GEC, beating previously reported scores on benchmarks including BEA-2019. — [Instruction-Following LLMs for GEC, BEA 2026](https://aclanthology.org/2026.bea-1.17.pdf)
- Other 2025 to 2026 work targets over-correction directly: minimal-edit adaptation of LLMs, a larger context window with fewer over-corrections, and post-correction that exploits over-correction. — [Adapting LLMs for Minimal-edit GEC](https://arxiv.org/pdf/2506.13148); [Larger Context Window, Fewer Overcorrections](https://arxiv.org/pdf/2609.10810); [Leveraging What's Overfixed](https://www.researchgate.net/publication/395848616_Leveraging_What's_Overfixed_Post-Correction_via_LLM_Grammatical_Error_Overcorrection)
- In multilingual retrieval-based GEC, over-correction is more pronounced in lower-resource languages such as Romanian. — [Encode Errors, arXiv 2606.15416](https://arxiv.org/pdf/2606.15416)
- MultiGEC-2025 was the first text-level multilingual GEC shared task. It covered 12 European languages including Italian, in a minimal track and a fluency track. UAM-CSI won both tracks with Gemma-2 9B plus LoRA adapters. All teams used one English instruction template for every language, and scores were relatively low for low- and mid-resource languages. — [MultiGEC-2025 overview](https://aclanthology.org/2025.nlp4call-1.1/); [OmniGEC, arXiv 2509.14504](https://arxiv.org/pdf/2509.14504); [Lattice @MultiGEC-2025](https://www.researchgate.net/publication/389799158_Lattice_MultiGEC-2025_A_Spitful_Multilingual_Language_Error_Correction_System_Using_LLaMA)
- Italian: Fioravanti, Forti and Spina (CLiC-it 2024) compared ChatGPT, Copilot, Gemini and Llama 3 with human annotators on L2 Italian error detection, using a fine-grained Italian morphosyntax scheme. Humans outperformed the LLMs, and performance varied by error type. — [Fioravanti et al., CLiC-it 2024](https://aclanthology.org/2024.clicit-1.44)
- Spanish: the COWS-L2H learner Spanish corpus has error annotations and parallel corrections, but its GEC baseline is a pre-LLM neural model. I found no LLM evaluation on it. — [Davidson et al., LREC 2020](https://aclanthology.org/2020.lrec-1.894); [UC Davis dissertation](https://escholarship.org/uc/item/3c47078z)
- Spoken GEC (English, Linguaskill): end-to-end Whisper-based spoken GEC is competitive with cascaded ASR → disfluency removal → GEC pipelines. Feedback is harder for the end-to-end model at lower proficiency levels, and labelled spoken GEC data is scarce (77 hours, expanded to 2,500+ hours by pseudo-labelling). — [Scaling and Prompting for E2E SGEC, arXiv 2505.21137](https://arxiv.org/html/2505.21137); [E2E SGEC, arXiv 2506.18532](https://arxiv.org/html/2506.18532); [Towards E2E SGEC, arXiv 2311.05550](https://arxiv.org/abs/2311.05550)
- Background (pre-LLM): GEC output has been used to assess L2 speaking proficiency automatically. — [Back to grammar, Speech Communication](https://www.sciencedirect.com/science/article/abs/pii/S0167639323001590)

### Inferences
- For learning notes, ask for minimal edits ("change only what is wrong") and quote the learner's exact words next to the better version. Fluency rewrites will flag acceptable Italian as mistakes, so the study file fills with false "errors".
- Cheap precision boosters fit the after-conversation step: sample 2 to 3 times and keep only mistakes that recur (as in edit-level voting), and ask the model to label each item as certain or uncertain.
- Spoken, informal Italian is legitimately elliptical ("Un caffè, grazie"). Fragments and colloquialisms should not be logged as errors. Instruct this explicitly, since the GEC literature mostly trains on written text.
- Italian is a high-resource language for frontier models, but the one direct study still found LLMs below human annotators. Error *categories* (for example article–noun agreement or the passato prossimo auxiliary) are probably more reliable than fine-grained taxonomies.

### Gaps
- Per-language Italian scores from MultiGEC-2025 were not retrieved (PDF text extraction failed).
- Precision/recall numbers from Fioravanti et al. 2024 were not retrieved (fetch failed).
- I found no LLM GEC evaluation on learner Spanish, and no spoken GEC work for Italian or Spanish.
- I found no direct measure of LLM false-positive rates on *transcribed conversational* learner speech.

## 3. Effects of ASR errors on downstream error analysis and assessment

### Takeaway
ASR causes two opposite failures. It can *hide* learner errors, because strong language models in ASR (Whisper included) smooth non-standard forms toward correct ones. It can also *invent* errors, when misrecognitions get blamed on the learner. Grammar and pronunciation feedback are the most exposed, especially at low proficiency. Content-level judgements are fairly robust.

### Cited Findings
- Knill et al. (2018, background) studied ASR impact on free-speaking assessment of non-native learners. Pronunciation and grammar feedback are the most exposed. Pronunciation feedback for A1 is the most affected by ASR errors, and grammar-related error rates varied most at B1. — [Knill et al. 2018, ISCA](https://eprints.whiterose.ac.uk/id/eprint/152761/8/Knill%20et%20al%202018%20Impact%20of%20ASR%20performance%20on%20free%20speaking%20language%20assessment,%20ISCA.pdf)
- Content-feedback models for non-native spontaneous speech were robust to ASR errors. Results on ASR output were comparable to those on manual transcripts. — [ETS-style patent, content feedback](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11854530)
- Error-preserving ASR (ACL 2024; English, about 85 hours from Swiss learners in grades 4 to 6): most ASR systems include a strong language model that smooths over speakers' mistakes, which removes the errors corrective feedback needs. A model trained on learner data preserved errors much better. One summary reports a word error preservation rate (WEPR) of 0.38 against 0.47 for Whisper-Large, where lower is better. That figure comes from a secondary review and was not verified on the primary page. — [Error-preserving ASR, ACL 2024](https://aclanthology.org/2024.acl-long.348/); [secondary review](https://liner.com/review/errorpreserving-automatic-speech-recognition-young-english-learners-language)
- Non-native spontaneous speech has much higher ASR error rates than read speech. Whisper and AssemblyAI were most accurate on read non-native speech, while spontaneous speech varied more across systems. — [ASR for non-native English, arXiv 2503.06924](https://arxiv.org/pdf/2503.06924)
- Normalisation (removing disfluencies, standardising forms) reduces the impact of disfluencies but can hide non-standard forms. — [Error-preserving ASR PDF](https://aclanthology.org/2024.acl-long.348.pdf)
- In end-to-end spoken GEC, a Whisper model fine-tuned on fluent transcripts learns to drop disfluent content. Prompting Whisper large-v2 with fluent transcripts gave the best spoken GEC result (WER 11.08%). — [arXiv 2505.21137](https://arxiv.org/html/2505.21137)

### Inferences
- Whisper's tendency to normalise means Fuori will *under*-report grammar errors, such as wrong article gender or verb ending, because Whisper often "hears" the correct form. The study file should treat "no error seen" as weak evidence.
- Mitigations available to Fuori without new models:
  - Tell the note-writing model the text is a Whisper transcript, and ask it to skip anything that could be a misrecognition (near-homophones, garbled words, single odd tokens).
  - Log only errors that are linguistically plausible for a learner and repeated, or confirmed by context such as the character's reply.
  - Use Whisper's per-segment confidence or `avg_logprob`, if Groq returns it, to drop low-confidence segments from error analysis.
  - Never quote a "mistake" back to the learner in a way that implies certainty when the input was low-confidence audio.
- English fallbacks and "words not understood" are more robust to ASR than fine-grained morphology. Whisper language detection, or a mix of English words in the transcript, is a fairly reliable signal, so these categories deserve more weight in the study file.
- This matches the project rule that characters "forgive speech-recognition noise". The same forgiveness should apply in the notes.

### Gaps
- I found no study of Whisper's error-normalisation on Italian or Spanish learner speech.
- I found no 2024–2026 study measuring how ASR errors change LLM-generated grammar feedback (misattribution rate).

## 4. Learner models in ITS and language apps: what representations work?

### Takeaway
Production language apps use structured, item-level models: per-word or per-skill recall probabilities (Duolingo's half-life regression, later Birdbrain). Open learner model research favours views the learner can inspect, with a quick at-a-glance summary plus detail on demand. LLM-era systems add free-text profiles, but no evidence shows free text beats structured records for tracking. Hybrids (structured items plus a short narrative) are the common pattern.

### Cited Findings
- Half-life regression (Settles and Meeder, ACL 2016, background) models each word's memory half-life as h = 2^(Θ·x) from features of the learner's history with that word. It cut recall-prediction error by more than 45% against baselines. — [Settles and Meeder 2016](https://preview.aclanthology.org/fix_video/P16-1174.pdf); [Duolingo blog](https://blog.duolingo.com/how-we-learn-how-you-learn)
- Duolingo A/B tests of HLR showed +9.5% retention in practice sessions, +1.7% in lessons, and +12% in overall activity. — [Duolingo blog](https://blog.duolingo.com/how-we-learn-how-you-learn)
- Birdbrain is Duolingo's proprietary learner model. One Japanese-language article links HLR to its development. That link is secondary and unconfirmed by an English primary source. — [ASCII.jp](https://ascii.jp/elem/000/004/140/4140458/); [VentureBeat](https://venturebeat.com/ai/how-duolingo-is-using-ai-to-humanize-virtual-language-lessons)
- A 2026 revisit of HLR (mixed-effects plus random forest) improved prediction and explainability. — [Ilidio et al. 2026, PMLR](https://proceedings.mlr.press/v339/ilidio26a.html)
- Open learner models hold the system's estimates of a learner's knowledge and misconceptions. They serve fast-use monitoring at a high level and slow-use scrutiny of the underlying model. Learner-facing dashboards have received relatively little work. — [OLM-driven data design, Computers & Education: AI](https://www.sciencedirect.com/science/article/pii/S2666920X22000248)
- An LLM-driven teacher dashboard for EFL writing (RECIPE4U data) used fine-tuned GPT-4 plus BERT scoring. It was co-designed with EFL faculty, gave weekly overviews with warning signs and curriculum-goal filters, and favoured semantic analysis over raw counts. — [LLM-Driven Learning Analytics Dashboard, arXiv 2410.15025](https://arxiv.org/pdf/2410.15025)
- The OpenLearnLM benchmark includes teaching-assistant tasks for real-time error detection and instructor-facing group and individual learner profiles. — [OpenLearnLM, arXiv 2601.13882](https://arxiv.org/html/2601.13882)

### Inferences
- A good fit for Fuori is a hybrid. Keep a small structured store of observation items (type: mistake / not-understood / English-fallback; quote; better version; topic tag; date; count) as the source of truth. Have the ~20-line study file *rendered* from it for Magda. This keeps HLR-style counts and recency, so "last seen", "seen 3 times" and "not seen since" can drive review and retirement.
- Recency and repetition matter, as HLR shows. An item seen once three weeks ago should fade, and items repeated across days should rise. A free-text file rewritten by an LLM cannot reliably track counts or dates.
- Open learner model principles suggest the learner can see the study file, framed as Magda's notebook. That supports trust and self-correction.

### Gaps
- I found no published comparison of structured versus free-text LLM learner profiles for language tutoring outcomes.
- Birdbrain's architecture is not publicly documented in a primary source I retrieved.

## 5. Summarising learner progress for teachers; drift/hallucination when repeatedly rewriting a cumulative summary

### Takeaway
Recursive summarisation (fold each new session into the old memory) works for keeping long dialogues consistent. But because each rewrite builds on the last, distortions and stale facts carry forward, and quantitative evidence on drift is thin. Current agent-memory systems move away from whole-document rewrites toward atomic facts with explicit add/update/delete operations.

### Cited Findings
- LLM-Rsum (Wang et al., arXiv 2308.15022; Neurocomputing 2025) builds memory recursively from the previous memory plus new context. It gave more consistent long-conversation responses, and in human evaluation the generated memory sometimes beat ground-truth memory. The authors note that outdated information kept in memory hurts response quality. — [arXiv 2308.15022](https://arxiv.org/abs/2308.15022); [Neurocomputing](https://www.sciencedirect.com/science/article/abs/pii/S0925231225008653)
- Mem0 has the LLM extract atomic facts, retrieve related memories, and decide to add, update, delete or ignore. Zep stores history as a temporal knowledge graph. Both are summarised in a 2026 preprint on proactive memory extraction, which argues against static summarisation. — [Beyond Static Summarization, arXiv 2601.04463](https://arxiv.org/pdf/2601.04463)
- With a 20-message sliding window, 96% of a 500-message conversation is lost (claim from a 2026 preprint proposing hallucination-resistant persona memory). — [Synthius-Mem, arXiv 2604.11563](https://arxiv.org/pdf/2604.11563)
- A non-peer-reviewed essay proposes a cascade in which lossy compression erodes detail, which then drives hallucination or generic fallback. Treat it as a hypothesis only. — [Medium, Smith](https://medium.com/@frederick-smith/persistent-llm-memory-decay-drift-continuity-93b1db4bcdb2)
- Teacher dashboards were most useful when co-designed with teachers and focused on actionable signals, such as warning signs and curriculum goals, rather than raw activity counts. — [arXiv 2410.15025](https://arxiv.org/pdf/2410.15025)

### Inferences
- Risks of rewriting the whole ~20-line file after every conversation:
  - Quotes get paraphrased until they no longer match what the learner said.
  - Items are silently dropped or merged.
  - Old errors persist after the learner has fixed them.
  - Fabricated generalisations appear ("struggles with subjunctive" from one instance).
- Mitigations:
  - Keep per-conversation notes immutable and append-only.
  - Rebuild the study file from the structured notes, or update it with explicit operations (add / bump count / mark resolved / remove), not free rewriting.
  - Require every line in the study file to cite at least one dated note.
  - Cap categories, for example ≤5 current mistakes, ≤5 unknown words, 1 level line, 1 strengths line, so items must compete for space.
  - Periodically regenerate from raw notes to reset drift.
  - Test with a regression fixture: run 10 synthetic sessions and check quotes are still verbatim and resolved items are gone.
- Include strengths. Evidence that zero-shot LLMs emphasise weaknesses more than human raters do (Q1) suggests a study file that only lists mistakes will skew negative, which affects Magda's tone.

### Gaps
- I found no quantitative measurement of hallucination or drift rates from repeated rewriting of a cumulative LLM summary, and no study in an educational or learner-profile setting.
- I found no study evaluating LLM-written learner progress summaries against teacher judgements for accuracy.
