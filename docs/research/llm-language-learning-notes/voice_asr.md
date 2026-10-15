# Voice-specific issues for voice-first AI language practice (ASR of L2 speech, Whisper behaviour, latency, pronunciation feedback, TTS)

Context: iPhone Safari web app; learner records a turn; audio goes to Whisper (whisper-large-v3-turbo on Groq) with language set to Italian or Spanish; an LLM replies; TTS speaks the reply. Research done 2026-10-15. Sources are 2023-2026 unless labelled older.

## 1. How accurate is Whisper/ASR on non-native (L2) speech, and does it "correct" learner errors?

### Takeaway
Whisper is among the best off-the-shelf ASR systems for accented speech, but accuracy falls sharply for low-proficiency speakers and for non-English target languages, and Whisper tends to produce fluent, grammatical text, so it can silently "fix" learner errors (articles, fillers) rather than transcribe them. I found no published WER figures for L2 learners speaking Italian or Spanish specifically.

### Cited Findings
- On L2-ARCTIC (read English by L2 speakers, including Spanish-L1 speakers), Whisper and AssemblyAI were the most accurate of five systems, with mean Match Error Rates of 0.054 and 0.056. This is English read speech, not learners speaking Spanish/Italian. — [arXiv 2503.06924](https://arxiv.org/abs/2503.06924v2)
- Verhelst & Belpaeme (HRI 2025), "Large Language Models Cover for Speech Recognition Mistakes": with Dutch-speaking students learning French, ASR performance "degrades significantly for both speakers with limited proficiency and a non-English language", but the LLM could interpret context and keep conversations going despite poor ASR output. (Specific WER numbers not available in what I could access.) — [imec record](https://imec-publications.be/handle/20.500.12860/59084); [search summary of abstract](https://imec-publications.be/entities/publication/405c0ed7-9a79-407b-9452-7430d377349f/full)
- Dutch JASMIN-CGN study: zero-shot Whisper does markedly worse on non-native adults; fine-tuning cut WER by 67% (relative) for non-native adults and 72% for non-native children, showing how much headroom zero-shot leaves for L2 speech. — [arXiv 2502.17284](https://arxiv.org/html/2502.17284v1)
- On the CEFR-graded Speak & Improve L2 English corpus, plain Whisper fine-tuning lowered average WER but widened the gap between proficiency levels, disproportionately hurting lower-level learners; proficiency-aware methods cut WER up to 29.4% relative. — [arXiv 2510.10738](https://arxiv.org/pdf/2510.10738v1)
- Speak & Improve 2025: whisper-large-v3-turbo fine-tuned with LoRA on verbatim transcripts that keep filled pauses ("um", "uh") reached 5.5% WER vs 6.2% when hesitations were removed — evidence that the default model is biased toward clean, disfluency-free output. — [arXiv 2506.04076](https://www.arxiv.org/pdf/2506.04076)
- Grammar "correction" by ASR: in a spoken grammar assessment study, Whisper sometimes fixed a learner's article error (swapping "a"/"the" or dropping the article), while a grammar-aware ASR transcribed faithfully; on 137 utterances Whisper's verbatim accuracy was 46% vs 84.7% for the grammar-aware model. — [arXiv 2410.01579](https://arxiv.org/pdf/2410.01579)
- Cascaded ASR-then-LLM pipelines for spoken grammatical error correction inherit ASR errors plus LLM over-correction, which hurts precision in educational use. — [arXiv 2506.18532](https://www.alphaxiv.org/abs/2506.18532.md)
- Whisper output "tends to be grammatical" and drops many fillers — good for clean transcripts, bad for analysing how something was said. — [eScience Center blog](https://blog.esciencecenter.nl/immaculate-speech-and-hallucinations-ea87e545a9ef)
- Prompting Whisper with the expected target text improved verbatim transcription (children's read-aloud, atypical adult speech) more than fine-tuning did (Interspeech 2025; not tested on L2 learners). — [ISCA archive](https://www.isca-archive.org/interspeech_2025/smith25_interspeech.html)
- Misrecognitions concentrate on phonetic realisations that were rare in training data (under-represented varieties get much higher WER). — [O'Neill 2023, UPenn](https://repository.upenn.edu/handle/20.500.14332/58897)
- Groq's own figures: whisper-large-v3-turbo 12% WER vs whisper-large-v3 10.3% (general benchmark); Groq recommends large-v3 for "error-sensitive, multilingual" work and turbo for price-performance. — [Groq docs](https://console.groq.com/docs/speech-to-text)
- OpenAI's turbo release notes: turbo (4 decoder layers vs 32) performs "similarly to large-v2" rather than large-v3 across languages, better on clean FLEURS than on Common Voice; it was fine-tuned on transcription data only. — [openai/whisper discussion #2363](https://github.com/openai/whisper/discussions/2363)
- Learners' affect: in a 2026 multi-stakeholder study of voice chatbots for English practice in Indian schools, repeated misunderstandings lowered some learners' mood and made one want to quit early; lag also irritated learners. — [arXiv 2601.19304](https://arxiv.org/pdf/2601.19304)
- In a speech-enabled teachable-agent study (2023), ASR errors changed conversation flow but were not related to learning gains or rapport; an earlier study found WER related to satisfaction, not learning. — [arXiv 2306.07302](https://arxiv.org/pdf/2306.07302)

### Inferences
- For Fuori, the bigger danger is not a high WER but a *fluent wrong* transcript: Whisper's language model will often turn a beginner's "io essere stanco" or mispronounced word into plausible Italian. The character LLM then cannot recast an error it never sees. Recasts based on the transcript will under-detect grammar errors and should not be presented as authoritative.
- Conversely, because the LLM "covers" for ASR mistakes (Verhelst & Belpaeme), meaning-focused conversation is robust even when transcripts are noisy — consistent with Fuori's "forgive speech-recognition noise" rule.
- Passing a short `prompt` (224-token limit) containing the scene's vocabulary or the character's last line may improve recognition of expected words, but it also increases bias toward expected/correct forms (and prompt-echo risk, see §2) — a trade-off to test.
- If verbatim error capture matters (e.g., for Magda's teaching), consider whisper-large-v3 rather than turbo for those turns, and showing the learner their transcript so they can see what was "heard".

### Gaps
- No published WER for L2 learners speaking Italian or Spanish with Whisper (any version). Tejedor-García et al. 2021 (Japanese learners of Spanish, minimal pairs) exists but I did not verify numbers.
- No study quantifying how often Whisper normalises learner grammar errors in Romance languages.
- Verhelst & Belpaeme WER values by proficiency were not accessible.

## 2. Whisper hallucinations on silence / short audio, and mitigations

### Takeaway
Whisper hallucinates readily on silence, noise and very short clips, emitting training-data artefacts ("thank you", "thanks for watching", subtitle credits such as "Subtítulos realizados por la comunidad de Amara.org"); the artefacts are language-specific because they come from subtitled video. Large-v3 is reported to hallucinate more than v2, and there is little hard evidence for turbo. The most effective mitigation is VAD before transcription, plus a phrase blocklist and confidence filters afterwards.

### Cited Findings
- Careless Whisper (Koenecke et al., FAccT 2024): about 1% of transcriptions (2023 Whisper API) contained entire hallucinated phrases or sentences absent from the audio; 38% of hallucinations contained explicit harms (violence, invented associations, false authority). Hallucinations were more common for speakers with aphasia, linked to longer shares of non-vocal duration (pauses). — [arXiv 2402.08021](https://arxiv.org/html/2402.08021v2); [ACM DOI 10.1145/3630106.3658996](https://paperswithcode.com/paper/careless-whisper-speech-to-text-hallucination)
- Barański et al. (ICASSP 2025), large-v3 on non-speech audio, language set to English: 40.3% of 301,317 non-speech inferences produced text, 9.1% with looping; rate depended on clip length (11.6%–62.3% for 1–30 s clips). Top outputs: "thank you" 24.76%, "thanks for watching" 10.32%, "so" 3.80%, "thank you for watching" 2.58%, plus "subtitles by the amara org community" 0.46%. — [arXiv 2501.11378](https://arxiv.org/html/2501.11378v1)
- Same paper, mitigation results (WER on non-speech-augmented sets, NO || OL): unprocessed 104.8 || 112.0; Silero VAD alone 8.0 || 10.8; WebRTC VAD 68.3 || 75.4; beam size 1 no help (107.2 || 112.3); hallucination_silence_threshold 20 s 39.8 || 53.7; delooping + "bag of hallucinations" (BoH) filter 17.1 || 21.1; Silero VAD + BoH 6.5 || 9.4. The BoH was built from phrases with n-gram log-prob < -10 and >4 occurrences on non-speech. Only English and only large-v3 tested. — [arXiv 2501.11378](https://arxiv.org/html/2501.11378v1)
- Calm-Whisper (Interspeech 2025): 3 of 20 decoder heads cause >75% of non-speech hallucinations; fine-tuning them cut non-speech hallucination >80% with <0.1% WER degradation on LibriSpeech (requires self-hosting a modified model). — [arXiv 2505.12969](https://arxiv.org/abs/2505.12969v1)
- Non-English artefacts: Spanish "Subtítulos creados por (la comunidad de) Amara.org" reported on the OpenAI API — [OpenAI community](https://community.openai.com/t/subtitulos-creados-por-amara-org/1113265/2); French "Sous-titres réalisés par la communauté d'Amara.org", with Microsoft's Speech team attributing it to training data and declining to change it — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/1495252/how-to-remove-the-generated-sous-titres-r-alis-s-p); complete silence transcribed as the Arabic credit "Translation by Nancy Qunqar", with similar artefacts reported in German and Romanian — [Kieran Healy](https://kieranhealy.org/blog/archives/2025/07/22/the-sound-of-silence); large-v3 reportedly responds less to parameter tweaks, VAD recommended — [GeekNews summary of the GitHub issue](https://news.hada.io/topic?id=22120)
- An OpenAI community user reports no reliable way to suppress "Subtitles made by the community of Amara.org" at generation time; post-hoc keyword filtering needed. — [OpenAI community](https://community.openai.com/t/whisper-api-hallucinating-on-empty-sections/93646)
- Large-v3 vs v2: Deepgram (a competitor) reported v3 hallucinating ~4x more on real-world data (median WER 53.4 vs 12.7) — treat with caution — [Deepgram](https://deepgram.com/learn/whisper-v3-results); GitHub discussion notes better benchmark WER but worse hallucinations in practice (anecdotal) — [discussion #1818](https://github.com/openai/whisper/discussions/1818); Japanese user proposes filtering hallucinated segments on duration, avg_logprob, compression_ratio and no_speech_prob — [discussion #1762](https://github.com/openai/whisper/discussions/1762)
- Turbo-specific: users reported repetition loops, random English words in Japanese transcripts, and one user said `no_speech_prob` values "looked unexpected" with turbo; suggested mitigations VAD, `hallucination_silence_threshold`, WhisperHallu. — [discussion #2363](https://github.com/openai/whisper/discussions/2363)
- Groq API facts: `verbose_json` returns per-segment `avg_logprob` (≈ -0.5 or lower "may signal issues"), `no_speech_prob` (near 1 = silence/non-speech) and `compression_ratio` (very high/low = problems); Groq gives no fixed cutoffs and advises setting your own. `temperature` default 0 (recommended). `language` param improves accuracy and latency. `prompt` ≤224 tokens, should be in the audio's language and only guides style/context. Minimum billed length is 10 s per request; audio downsampled to 16 kHz mono; WAV/FLAC reduce latency. — [Groq docs](https://console.groq.com/docs/speech-to-text)
- Open-source defaults referenced by practitioners: `no_speech_threshold` 0.6 combined with `logprob_threshold` -1.0 (segment treated as silence only if both indicate it); trim boundary silence with a dB threshold; Silero/WebRTC VAD before ASR. — [Dograh blog](https://www.dograh.com/feeds/blog/whisper-hallucination-silence) (practitioner source)
- The likely cause — training on web video with subtitle credits at the end — is a widely repeated hypothesis, not proven. — [Kieran Healy](https://kieranhealy.org/blog/archives/2025/07/22/the-sound-of-silence); [arXiv 2501.11378](https://arxiv.org/html/2501.11378v1)

### Inferences (concrete pipeline mitigations for an iPhone Safari app)
- **Client-side VAD / gating is the highest-value fix.** Run a VAD in the browser (e.g., Silero VAD via ONNX Runtime Web, or a simple RMS-energy gate with the Web Audio API AnalyserNode) and do not upload a clip with no detected speech, or speech shorter than ~300–500 ms. Trim leading/trailing silence before upload. (Specific ms/dB thresholds are not established in the literature; tune on real recordings.)
- **Server-side filters on Groq output:** request `verbose_json`; drop segments where `no_speech_prob` is high AND `avg_logprob` is low; flag very high `compression_ratio` (loops); and apply a per-language blocklist (Italian e.g. "Sottotitoli creati dalla comunità Amara.org", "Grazie per la visione", lone "Grazie."; Spanish "Subtítulos realizados por la comunidad de Amara.org", "Gracias por ver el video", lone "Gracias."). The Italian strings are plausible analogues of documented English/Spanish/French artefacts, not confirmed in a source — build the list empirically by sending silence/noise clips to Groq in each language. Store the blocklist in `content/<lang>/` data, not code.
- **Treat `no_speech_prob` as a weak signal**, especially for turbo (anecdotal reports it is unreliable); combine with VAD and duration.
- **Danger zone for learners:** L2 beginners pause a lot mid-utterance and speak quietly; Careless Whisper links long non-vocal stretches to hallucination. Avoid sending long-tail silence after the learner stops (end recording promptly or trim), and don't let a hallucinated "Grazie" be treated as a real learner turn — when the transcript is a blocklisted phrase or empty, have the character ask the learner to repeat rather than respond.
- **Prompt echo:** if using Groq's `prompt`, check whether the output equals/contains the prompt text and discard if so (risk widely reported with Whisper prompting; I found no turbo-specific measurement).
- **Billing note:** Groq bills a 10 s minimum per request, so very short turns cost the same as 10 s; gating silent clips also saves cost.

### Gaps
- No peer-reviewed hallucination rates for whisper-large-v3-turbo specifically, nor for Italian/Spanish set as the decoding language.
- No validated numeric `no_speech_prob` threshold for turbo; Groq gives none.
- Whether Groq's hosted turbo applies any internal VAD or hallucination suppression is undocumented in what I read.

## 3. Latency in spoken dialogue: what feels natural, and effects on learners

### Takeaway
Human turn gaps average ~200 ms across languages, which no ASR→LLM→TTS cascade will match; practitioner consensus targets <800 ms–1.2 s end-to-end, with silent waits beyond a few seconds clearly harmful. There is little learner-specific research; lag irritated learners in one voice-chatbot study, and filled waits (audio/visual cues) are preferred over silence.

### Cited Findings
- Stivers et al. 2009 (older, 10 languages): all languages minimise silence and avoid overlap between turns; mean gaps differ by language but fall within ~250 ms of the cross-language mean (~200 ms). Levinson & Torreira (2015, older) note word-encoding latency is ~600 ms+, so humans plan replies before the other speaker finishes. — [Levinson & Torreira 2015, Frontiers](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00731/full); [Stivers et al. 2009 summary](https://emcawiki.net/Stivers-etal2009)
- English turn gap reported as ~239 ms average (citing a 2009 study). — [arXiv 2404.16053](https://arxiv.org/html/2404.16053v1)
- Ekstedt & Skantze (SIGDIAL 2021): practical ASR services "typically induce a long response delay"; silence thresholds are a poor indicator of turn ends (Jiang, Ekstedt & Skantze, ACL Findings 2023); voice-activity-projection turn-taking on a robot (HRI 2025, n=39) significantly reduced delays and interruptions and was preferred. — [SIGDIAL 2021](https://aclanthology.org/2021.sigdial-1.45); [ACL Findings 2023](https://preview.aclanthology.org/fix_video/2023.findings-acl.776.pdf); [KTH turn-taking project](https://www.kth.se/tmh/projects/turn-taking-1.1043498)
- Industry targets (vendor blogs, not studies): <800 ms "natural"; 800–1,200 ms noticed but acceptable; some use <1 s ideal, <2 s acceptable. A claimed "15–20% satisfaction drop per second" has no cited study. — [Hamming](https://hamming.ai/blog/voice-ai-latency-whats-fast-whats-slow-how-to-fix-it); [Coval](https://www.coval.dev/blog/how-to-measure-voice-ai-latency-the-complete-guide); [Famulor](https://www.famulor.io/es/blog/ai-voice-agent-latency-how-fast-your-phone-bot-must-reply)
- Fröhlich (older, telephony): silent waits should stay under roughly 4–8 s; users preferred speech or music waiting cues over silence even for short waits. — [Fröhlich 2005](https://course.khoury.northeastern.edu/csg170/ssl/frohlich05.pdf)
- A 2025 social-robot thesis found users preferred a more natural TTS voice despite ~345 ms extra latency; naturalness depended more on voice quality and consistency than raw speed. — [FH OÖ thesis](https://pure.fh-ooe.at/en/studentTheses/optimizing-multimodal-dialogue-systems-for-social-robots-in-offic/)
- Learners in a 2026 voice-chatbot study were irritated by lag even as confidence grew. — [arXiv 2601.19304](https://arxiv.org/pdf/2601.19304)
- Roddy & Harte (ACL 2020): listeners judge response timing naturalness context-dependently. — [arXiv 2005.09128](https://arxiv.org/abs/2005.09128v1)

### Inferences
- Fuori's push-to-talk / record-then-send flow already breaks the ~200 ms human norm, so the goal is consistent, filled waits: an immediate character "thinking" cue (animation, a short "Mmm..."/backchannel), stream LLM tokens and start TTS on the first sentence, and keep total gap to roughly 1–2 s where possible.
- Learners are less sensitive to speed than native users in one respect: they need processing time. Explicit tap-to-talk (rather than auto end-of-turn detection) avoids cutting off learners who pause mid-sentence, a real problem since silence thresholds are poor turn-end signals.
- Budget: Groq Whisper is very fast (Groq lists turbo speed factor 216x real time), so latency will be dominated by upload on mobile networks, LLM time-to-first-token, and TTS start. Send compressed audio (Groq: FLAC/WAV recommended) and set `language` to save decode time.

### Gaps
- No peer-reviewed study found on acceptable response latency specifically for L2 learners talking to an AI partner.
- No controlled evidence that the 800 ms industry figure applies to tap-to-talk interactions.

## 4. Pronunciation feedback: CAPT evidence and reliability of ASR-based feedback

### Takeaway
ASR-based pronunciation training works on average (medium effect, g = 0.69), mainly with explicit corrective feedback and on segmentals, but automatic mispronunciation detection still produces false rejections, which discourage learners. A general-purpose ASR like Whisper is not a pronunciation scorer: a word that was "recognised" may have been mispronounced (Whisper's LM fills it in) and a misrecognition may stem from noise, not pronunciation.

### Cited Findings
- Ngo, Chen & Lai (2024, ReCALL) meta-analysis, 15 studies / 38 effect sizes (2008–2021): overall ASR effect on ESL/EFL pronunciation g = 0.69 (medium). Explicit corrective feedback → large effect; indirect feedback (e.g., ASR dictation, i.e., "did it recognise you?") → moderate. Large for segmentals, small for suprasegmentals. Short training showed no advantage over non-ASR instruction; medium/long better. Practising with peers large effect, alone small. Largest effects for adults and intermediate learners. Individual studies inconsistent. — [ReCALL 2024](https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D)
- CAPT systematic review (ReCALL 2024) cites Mahdi & Al Khateeb (2019, older): CAPT effective, especially for beginner/intermediate learners; little known about pedagogical practices and learning measures in CAPT research. — [ReCALL systematic review](https://resolve.cambridge.org/core/services/aop-cambridge-core/content/view/71E786F7DFC99727837909FDED7A2320/S0958344024000181a.pdf/computer-assisted-pronunciation-training-a-systematic-review.pdf)
- False rejection (correct phones flagged as wrong) is a key mispronunciation-detection metric; "L2 learners will feel better if FRR is lower" (Interspeech 2020, older); a 2022 paper argues precision should take priority "to avoid discouraging learners". — [Interspeech 2020](https://www.isca-archive.org/interspeech_2020/xie20_interspeech.pdf); [arXiv 2209.06265](https://arxiv.org/pdf/2209.06265)
- Many false mispronunciation alarms come from assuming phones are recognised accurately and each sentence has a single correct pronunciation; modelling uncertainty and alternative pronunciations improved precision up to 18% relative for German, Italian and Polish L2 English speakers (2021, older). — [arXiv 2101.06396](https://www.arxiv.org/pdf/2101.06396)
- L1-aware multilingual mispronunciation detection (2024) reports FRR as a primary metric alongside phone error rate and tests on speechocean762; numbers not reliably extractable. — [arXiv 2309.07719](https://arxiv.org/pdf/2309.07719)
- Assessing isolated short utterances (e.g., minimal-pair words) by ASR remains "an important challenge, even more so for non-native speakers" (Japanese learners of Spanish, 2021, older). — [UVa repository](https://uvadoc.uva.es/bitstream/handle/10324/59491/Automatic-Speech-Recognition.pdf?sequence=1)
- Learners using ASR-based pronunciation practice report misrecognition, inconsistency and environmental problems (2026 qualitative EFL study). — [JES](https://jes.ejournal.unri.ac.id/index.php/JES/article/download/1785/975/8147)
- A 2023 case study used Whisper for automatic phonetic diagnosis of French learners of English (exploratory). — [HAL hal-04547597](https://www.archives-ouvertes.fr/hal-04547597v1)

### Inferences
- Do not derive pronunciation judgements from Whisper transcripts or confidence scores in Fuori. A dedicated pronunciation-assessment model (phone-level GOP scoring with a reference text) would be needed, and even those have meaningful false-rejection rates.
- "Indirect" feedback — the character simply not understanding and asking again — is itself a moderate-effect CAPT technique, and fits Fuori's in-character design. But because misunderstanding may come from ASR or noise, the character should not attribute it to the learner's pronunciation.
- If pronunciation feedback is added (e.g., with Magda), prefer high-precision, low-recall: only flag errors with high confidence, focus on a few known L1-English problem segments in Italian/Spanish (e.g., trills, geminates, vowel quality), and offer a model to imitate rather than a score.

### Gaps
- No evidence found on CAPT effect sizes for Italian or Spanish as target languages; the meta-analysis is ESL/EFL only.
- No measured false-rejection rates for commercial pronunciation APIs on L2 Italian/Spanish.

## 5. TTS for learners: speech rate, naturalness, comprehension

### Takeaway
Slower speech generally helps lower-proficiency listeners (roughly 97–155 wpm range cited), but evidence is mixed and older; a 2026 study found learners *prefer* globally slowed TTS while it actually increased comprehension errors compared with targeted slowing. Users value natural-sounding voices, even at a latency cost.

### Cited Findings
- 2026 preprint (L2 English listeners with French, Mandarin, Japanese L1s): targeted, data-driven slowing before key vowels improved word comprehension without listeners noticing; listeners judged global slowing clearer, though it increased comprehension errors. — [arXiv 2603.30032](https://arxiv.org/html/2603.30032v1)
- Review summary: slower rates (97–155 wpm) enhance L2 comprehension, especially for lower-proficiency learners (citing Mahalingappa et al., 2024). — [Iowa State Digital Press](https://www.iastatedigitalpress.com/psllt/article/18440/galley/17405/view/)
- Older: a 2006 thesis (n=11 ESL) found higher scores at a slower rate than 134 wpm / 2.89 syllables per second, close to significant — [Iowa State](https://dr.lib.iastate.edu/entities/publication/3007a6a2-58d7-4015-89ad-434c0e712bf8); a 2001 study (n=168 Taiwanese EFL) found facilitating effects of slower rate and syntactic modification — [JALT 2001](https://jalt-publications.org/archive/proceedings/2001/532.pdf); Griffiths (older) found slower speech offered few benefits to lower-intermediate learners while faster speech reduced comprehension (cited in the same sources).
- Users preferred a more natural TTS voice despite ~345 ms extra latency (2025 thesis). — [FH OÖ thesis](https://pure.fh-ooe.at/en/studentTheses/optimizing-multimodal-dialogue-systems-for-social-robots-in-offic/)
- Principals in the Indian school chatbot study warned students may "switch off the moment they cannot parse the audio". — [arXiv 2601.19304](https://arxiv.org/pdf/2601.19304)

### Inferences
- Offer a moderately slower default rate for beginners (browser `speechSynthesis` `rate` ~0.85–0.9) with a replay and a "slower" button rather than heavy global slowing, which may feel clearer but sound unnatural and not help as much. Pair with on-demand text (`{ it, en }`) for unparsed audio.
- Voice quality matters for engagement; iOS Safari's `speechSynthesis` voice quality varies by installed voices (enhanced/premium voices sound much better) — an argument for the planned M3 hosted TTS.

### Gaps
- No recent study comparing neural TTS vs human audio for L2 Italian/Spanish comprehension.
- No evidence found on optimal speech rate for Italian or Spanish specifically (syllable-timed languages have high syllable rates; wpm figures from English may not transfer).
