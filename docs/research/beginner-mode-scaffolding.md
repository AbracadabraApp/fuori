# Fuori Beginner Mode: Scaffolding Research

2026-10-17 · Josh

## What the evidence says

Speaking aloud helps memory, but recalling a phrase does more than reading it, so beginner mode should move learners from echoing toward producing.

**Saying it aloud is worth it, even when it's just reading.** The production effect is well documented: words said aloud are remembered better than words read silently. In one L2 study, students learning Esperanto remembered spoken words better at every interval tested, and those words faded more slowly over two weeks. Another study found the effect was larger in a second language than in a first. This supports the "speak, don't tap" rule. Caveat: most of these studies use word lists in a lab, not conversation.

**Reading a phrase aloud is repetition, not retrieval, and retrieval does more.** In a study of beginners learning Turkish from spoken dialogues, the retrieval-practice group scored highest overall. Verbal repetition matched it for vocabulary but fell behind on grammar. Pimsleur is built on this distinction: a cue, a silent pause to produce the answer aloud, then a native confirmation. The learner produces before hearing the answer. If beginner mode only shows the full phrase, it gets the production effect but loses the larger retrieval benefit.

**Chunks are the right unit for beginners.** Early learners lean on memorized phrases when their grammar can't yet do the job, which lets them sound more advanced than they are. Over time those chunks get unpacked and serve as models for real grammar. L2 learners at every level process chunks faster and with fewer errors than non-chunks. "Mi chiamo…", "Vorrei un…", and "Sono di…" are the right building blocks.

**Frames help, and support should fade.** Sentence frames give learners partial structures to fill in while speaking. Small studies show gains, though mostly without control groups. Support that never changes tends to create over-reliance, which is why researchers study fading it over time.

**Spacing only helps after enough reps.** A study of 1,589 learners found spaced retrieval worked only once learners had enough prior repetitions to recall the item successfully. Echo first, then quiz.

**Duolingo split the problem into two characters.** Falstaff gives early beginners guided practice with useful phrases. Lily handles open-ended conversation for intermediate learners, and early reviewers said her lack of hints made her much harder. Fuori could do this as one mode with a support level instead of two cast members.

## What this suggests for Fuori

Superseded in detail by [../beginner-scaffolding.md](../beginner-scaffolding.md); kept as the original reasoning.

Make the prompt a five-rung ladder, tracked per chunk rather than per session.

1. **Echo.** Full Italian phrase with a small English line. Say it.
2. **Choose.** Two Italian options, no English; meaning comes from the scene. The choice adds a small retrieval step.
3. **Frame.** "Mi chiamo ___" or "Vorrei un ___, per favore." The learner fills the slot with something real: a name, Seattle, what they actually want.
4. **Cue.** English intent only ("ask for the bill"); the learner produces the Italian. This is Pimsleur's anticipation step.
5. **Free.** No prompt. A hint is available on request.

Design notes:

- **The character's reply is the confirmation.** Pimsleur needs a native speaker to model the correct form. Fuori already has that if the character recasts naturally.
- **Fading means the next prompt changes, not that text dissolves.** This avoids disappearing UI.
- **Chunk state carries across characters**, so proficiency doesn't restart with each new person. A chunk moves up a rung after it lands in conversation and drops back after a miss.
- **Spacing comes free from the world.** Different places and characters can create situations that call for the same chunks, so reuse comes from new scenes rather than drills.

The Nuovissimo Progetto italiano 1 page ("Vacanze italiane") shows the input side of the same idea. It's readable at A1 because it leans on cognates (*ideali*, *location*, *VIP*, *romantico*), photos that carry the meaning, and repeated frames like "per chi ama…" and "potete…". In beginner mode, characters could favor cognates and lean on what's visible in the scene.

## Sources

- [Pimsleur Spanish methodology analysis](https://courses.languagereactor.com/david/alc-english/raw/commit/adecabbc4d062182efd4cd12bf79b1138be11d98/pimsleur-study/ANALYSIS.md)
- [Vocal production and L2 vocabulary (Icht et al.)](https://cris.iucc.ac.il/en/publications/the-effect-of-vocal-production-on-vocabulary-learning-in-a-second/)
- [Production effect in L1 vs L2 (Memory & Cognition)](https://link.springer.com/article/10.3758/s13421-023-01510-7)
- [Retrieval practice with Turkish dialogues; spacing vs repetition (NSF PAR)](https://par.nsf.gov/biblio/10433293)
- [Formulaic sequences in early interlanguage](https://www.jbe-platform.com/content/books/9789027273260-lllt.32.04myl)
- [Chunk processing across proficiency levels](https://www.degruyterbrill.com/document/doi/10.1515/iral-2022-0005/html)
- [Sentence frames and speaking performance](https://digilib.uinsgd.ac.id/143099/)
- [Fade-in vs fade-out scaffolding](https://civilica.com/doc/2657332/)
- [Duolingo Video Call research report](https://blog.duolingo.com/video-call-research-report)
- [Duoplanet on Video Call with Lily](https://newsletter.duoplanet.com/posts/duolingo-video-call-lily)
