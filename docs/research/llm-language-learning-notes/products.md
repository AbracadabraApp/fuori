# AI conversation products for language learning: features, evidence, sentiment, business, gaps

Research date: 2026-10-15. About 18 tool calls. Throughout, "company claim" means the vendor itself is the source, and "independent" means academic or third-party work. Many review sites in this space are run by competitors (LanguaTalk/Langua, Talkio, Unstar), and this is flagged where it applies. I could not reach Reddit threads directly; user sentiment below comes from Trustpilot, Product Hunt and review blogs.

## Q1. What the products do: correction, level adaptation, memory, structure vs. free talk

### Takeaway
Most products are tutor-framed: an avatar or tutor, short scenario or lesson-linked conversations, and feedback after the chat. Duolingo is the most structured: experts write each Roleplay scenario and set where the conversation goes. Memory of the learner is the weakest and most contested feature in the category. Free talk is commonly criticised as generic. Only a few early-stage products (LingoLooper, Noun Town) try a game world with many characters, and none of them clearly documents persistent, character-level memory.

### Cited Findings
**Duolingo Max (Explain My Answer, Roleplay, Video Call with Lily)**
- Launched March 2023 on GPT-4 at $29.99/month or $167.99/year. — [Yahoo/Engadget](https://autos.yahoo.com/duolingo-launches-subscription-tier-access-185143879.html); [TechRadar](https://www.techradar.com/news/duolingos-new-gpt-4-ai-will-happily-explain-why-your-spanish-is-wrong)
- Explain My Answer: after an exercise, the learner opens a chat with Duo. GPT-4 gives a first explanation and the learner can ask follow-ups. Duolingo judges the quality of an explanation by how deep the learner has to go before returning to the lesson. Duolingo said GPT-3 struggled with grammar explanations and GPT-4 gave "far more confidence in the accuracy." — [OpenAI customer story](https://openai.com/index/duolingo)
- Roleplay: human experts write the scenarios (for example a café waiter in Paris, or planning a vacation with a friend), match the opening prompt to where the learner is in the course, write the first message, and "tell the AI model where to take the conversation." After the chat, the learner gets AI feedback on the accuracy and complexity of their replies, plus tips. — [OpenAI customer story](https://openai.com/index/duolingo)
- This is heavily scripted, curriculum-linked roleplay. Correction is mostly deferred to a debrief after the chat rather than given in character.
- Video Call with Lily: Lily is a "sassy" or "somewhat dour but clever" character. Learners can ask her to repeat or slow down. Duolingo's AI team says the design goal was to avoid conversation that feels "robotic and repetitive." It came to Android in January 2025. In 2024 it was available only for French and Spanish (possibly out of date). Duolingo has also added chatting and games with other characters, such as Falstaff. — [Duolingo blog](https://blog.duolingo.com/video-call); [TechRadar](https://www.techradar.com/computing/artificial-intelligence/you-can-now-chat-and-play-games-with-duolingos-ai-characters-to-learn-spanish-or-french); [Tech Brew 2024](https://www.techbrew.com/stories/2024/09/25/duolingo-debuts-ai-video-chats); [Android launch release](https://markets.financialcontent.com/concordmonitor/article/gnwcq-2025-1-16-duolingo-launches-ai-powered-video-call-for-android)
- A journalist's hands-on review (The Dial) describes mixed experiences and says the reviewer felt embarrassed in front of the robot. — [The Dial](https://thedial.world/articles/news/issue-22/duolingo-language-learning-fluency)
- I found no Duolingo documentation of how Video Call adapts difficulty or remembers the learner across calls. The research page does not cover this either. — [Duolingo research report](https://blog.duolingo.com/video-call-research-report)

**Speak (OpenAI-backed, founded 2016)**
- The AI tutor gives feedback on pronunciation, grammar and vocabulary, and was upgraded to GPT-4 in March 2023. Speak had over 100,000 subscribers in South Korea in 2023. — [TechCrunch 2023](https://techcrunch.com/2023/08/31/openai-backed-language-learning-app-speak-raises-16m-to-expand-to-the-u-s)
- Structure: core lessons (speaking drills), Speak Tutor, Free Talk, and personalised "Made for You" lessons. A reviewer says "Made for You" is "just more Speaking Drills" and only unlocks after a Free Talk session, which makes it less useful for absolute beginners. Grammar explanations are short and text-based and "could be improved a lot." There are Premium and Premium Plus tiers; only Premium Plus has unlimited custom lessons. This reviewer is LanguaTalk, a competitor. — [LanguaTalk Speak review](https://languatalk.com/blog/speak-app-review/)
- Company-sourced claims: a "unique learning path" based on interests and goals, and adaptation to accent and pace. Speak created 25M+ personalised lessons in 2024. — [AIM Research](https://aimresearch.co/?p=12965); [FlowHunt (promotional)](https://flowhunt.io/ai-companies/speak-ai-language-learning-app-review)

**Praktika**
- AI avatar tutors with distinct backstories and accents, in about 9 languages, at about $12/month. — [mwm.ai listing](https://mwm.ai/apps/id/1624701477); [topai comparison](https://topai.tools/s/conversational-language-learning)
- A user on Trustpilot: "no memory on common errors. In no way like a tutor, and also in no way personalised." Another user called the free chat clichéd and said it felt "more like a school teacher than a native speaker." Users also report that level placement sometimes started too advanced, plus lag and glitches. Users like the avatars for lowering speaking anxiety. — [Trustpilot](https://uk.trustpilot.com/review/praktika.ai?page=8); [Product Hunt](https://www.producthunt.com/posts/praktika)

**Langua (LanguaTalk)**
- Correction is configurable: real-time written or spoken correction, or none. It provides post-session reports with categorised errors, transcripts, saved vocabulary carried into future conversations, spaced repetition, grammar drills built from frequent mistakes, and multiple AI characters with different dialects "cloned from native speakers." These are mostly self-described or from affiliate reviewers. — [LanguaTalk Pingo review](https://languatalk.com/blog/pingo-ai-review/); [Fabryk review](https://thefabryk.com/blog/langua-review); [Lingtuitive review](https://lingtuitive.com/blog/langua-ai-tutor-review)

**Pingo AI**
- Structured themed lessons of about 4–5 minutes, plus custom roleplays. According to a competitor's review: corrections are brief and encouraging but shallow, speech recognition is "far too forgiving" (it accepts nonsense syllables), complexity does not adapt, saved vocabulary is never reintroduced, there is no spaced repetition, and mastery scores are misleading. Pricing is $14.99/month or $99.99/year. The voice is clear but unnatural. — [LanguaTalk Pingo review (competitor)](https://languatalk.com/blog/pingo-ai-review/)
- Another roundup credits Pingo with session memory that brings back earlier mistakes and vocabulary, so the memory claim is contested. — [Talkio roundup (competitor)](https://www.talkio.ai/blog/best-ai-language-speaking-practice-apps-in-2026)

**TalkPal, Gliglish, Loora, Jumpspeak, Univerbal**
- TalkPal: 57+ languages, $4.68/month on the annual plan or $14.99/month. A 2024 blog says it does not save conversation history. — [App Store](https://apps.apple.com/tw/app/talkpal-ai%E8%AA%9E%E8%A8%80%E5%AD%B8%E7%BF%92/id6468219825?l=en-GB); [topai comparison](https://topai.tools/compare/talkpal-vs-gliglish); [DLSDC blog 2024](https://dlsdc.com/blog/ai-chatbots-for-language-practice/)
- Gliglish: saves past conversations, 38 languages, a free tier of 10 minutes of conversation per day, and plans at about €23/year or €29/month (the figures vary by source). — [DLSDC blog 2024](https://dlsdc.com/blog/ai-chatbots-for-language-practice/); [topai comparison](https://topai.tools/compare/gliglish-vs-talkpal)
- Loora: English-only conversation coach with instant feedback on pronunciation, grammar and fluency, and a summary after each lesson. — [Talkio roundup](https://www.talkio.ai/blog/best-ai-language-speaking-practice-apps-in-2026)
- Jumpspeak and Univerbal: only one-line mentions in roundups; no feature detail found. — [GoStudent](https://www.gostudent.org/en-gb/blog/best-ai-language-tutors); [Upskillist](https://www.upskillist.com/blog/best-ai-language-learning-apps/)

**Game-like and immersion products**
- LingoLooper: an "AI language game" set in a virtual 3D world with characters who have "diverse personalities and stories," gamified role-play, and a claimed 350+ avatars per city. It is in early access. — [App Store](https://apps.apple.com/us/app/lingolooper-ai-language-game/id1670913076); [lingolooper.com](https://www.lingolooper.com/)
- Noun Town (Steam, VR and non-VR): an open world where you speak to NPCs using speech recognition. It includes Spanish. Its store page does not say whether the NPCs run on an LLM. — [Steam](https://store.steampowered.com/app/2313720/Noun_Town_Language_Learning/); [Steam VR](https://store.steampowered.com/app/1643100/Noun_Town_VR_Language_Learning/)
- Immerse Learning: an older virtual-city program in Second Life that predates LLMs and has since moved away from Second Life. — [Wikipedia](https://en.wikipedia.org/wiki/Immerse_Learning)
- Character.AI used for practice: students in Indonesian perception studies report better fluency and confidence and less anxiety. Limitations they report include "unnatural responses," inaccuracies, and a "lack of emotional interaction." The authors frame it as a supplement. — [JELE study](https://jele.or.id/index.php/jele/article/view/2398); [IDEAS case study](https://ejournal.iainpalopo.ac.id/index.php/ideas/article/view/10181)

### Inferences
- The category has converged on a pattern: a tutor avatar, a scenario, and feedback after the chat. Correction is either deferred to a debrief (Duolingo, Loora, Langua) or given as light in-chat nudges (Pingo). Recasting in character, as Fuori does, is not a documented pattern in any product found.
- In reviews, "memory" usually means vocabulary or error tracking that feeds spaced repetition. It does not mean characters remembering the learner's life and relationships. Fuori's kind of memory (locals who remember you across days) appears to be absent from the documented products.
- Speech recognition that is too lenient (Pingo) is a known way these products fail: learners lose trust in the feedback. Fuori forgives speech-recognition noise by design, so it should still visibly catch real errors to avoid the same perception.

### Gaps
- No primary documentation found on how Lily, Speak Tutor or Praktika store memory between sessions.
- Univerbal and Jumpspeak: no substantive feature information found.
- Whether LingoLooper or Noun Town use LLMs, or have persistent character memory, is unconfirmed.

## Q2. Published efficacy evidence

### Takeaway
Evidence for specific products is almost entirely company-run and under-reported. Duolingo's Video Call studies give no sample sizes, test names or effect sizes. I found no published efficacy study by Speak. Independent academic work on AI conversation partners in general consists of small, short, single-site studies (mostly EFL in Asia). Results lean positive on speaking scores and willingness to communicate, are mixed on anxiety, and say almost nothing about long-term retention.

### Cited Findings
- **Duolingo Video Call research (company claim, page dated 2026-03-30)** covers three studies:
  - Falstaff calls with early-beginner French and Spanish learners. Callers were better at speaking useful conversation phrases.
  - Japanese learners of English at Duolingo Score 60–71 who used Lily at least twice a day for a month. They improved more on an unnamed standardized speaking test than learners doing regular lessons.
  - English speakers learning Spanish at Duolingo Score 45–55. Lily users improved more in speaking and reported higher confidence.
  - The page gives no randomization details, sample sizes or effect sizes. — [Duolingo blog](https://blog.duolingo.com/video-call-research-report)
- I found no independent or peer-reviewed study of Duolingo Max, Lily or Roleplay. — Searches above; see [Feedbagel](https://feedbagel.com/post/duolingo-study-shows-video-calls-improve-language-learners-speaking-skills), which only restates Duolingo's claims.
- **Speak:** no company or independent efficacy study found. Search results for "Speak app" returned studies of different apps: ELSA Speak, Speak Pal, and a "SPEAK APP" game with 16 participants that found fluency and pronunciation gains but complaints about speech-recognition latency and accuracy. — [Mahidol repository (IJIET 2024)](https://repository.li.mahidol.ac.th/handle/123456789/101924); [Speak Pal thesis](https://repository.syekhnurjati.ac.id/15104/)
- **Anxiety (independent, mixed):**
  - A 2025 study of 30 Indonesian students found ChatGPT lowered communication apprehension and fear of negative evaluation; pronunciation feedback and naturalness were weak points. — [JL3T via DOAJ](https://doaj.org/article/795a8beda7374b28a05752a4a3f74774)
  - Ding & Yusof (2025, mixed methods) reported reduced anxiety. — [Humanities & Social Sciences Communications](https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05550-z.html)
  - A 15-week study of 90 Japanese undergraduates using ChatGPT voice found no significant change in anxiety. — [Waseda report](https://www.wrs.waseda.jp/sp-r/admin/print/number/2025C-786)
  - A 2023 Egyptian study (n=48, older) found chatbot interaction slightly increased foreign language anxiety. — [CALICO Research Brief 2023](https://calico.org/wp-content/uploads/2023/06/Research-Brief-8-Summer-2023.pdf)
- **Willingness to communicate and speaking (independent):**
  - A study of 103 Chinese EFL learners found AI more effective than human teachers or peers at improving speaking performance and willingness to communicate. — [IRAL (De Gruyter)](https://www.degruyterbrill.com/document/doi/10.1515/iral-2024-0310/pdf)
  - The EAP Talk AI program produced a significant rise in in-class willingness to communicate. — [CALL-EJ](https://callej.org/index.php/journal/article/view/470)
  - A 2026 paper on drivers of willingness to communicate with generative AI looks at self-efficacy, enjoyment and anxiety. — [PMC 2026](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12883774/)

### Inferences
- No product has shown long-term proficiency or retention outcomes with credible methods. A measured, transparent claim, even an internal one, would set Fuori apart.
- The most consistent independent signal is affective: lower speaking anxiety and more willingness to speak. That supports a low-stakes, character-driven design. It is not evidence of acquisition.

### Gaps
- No rigorous randomized trial with a standardized oral exam (for example CEFR-aligned) and delayed retention testing was found for any named product.
- Duolingo's earlier general efficacy reports (reading and listening vs. university semesters) were not re-checked in this pass.

## Q3. What users report

### Takeaway
Users value low-pressure speaking practice and less anxiety. The recurring complaints are: generic or clichéd free chat that feels like a teacher rather than a native speaker, no memory or personalisation, inaccurate or overly lenient pronunciation feedback, repetitive and shallow conversations, paywalls and sneaky subscriptions, robotic voices, and lag. This evidence is anecdotal.

### Cited Findings
- Praktika: "no memory on common errors… in no way personalised"; free chat "spouts clichés," "more like a school teacher than a native speaker"; inaccurate pronunciation correction; levels started too advanced; lag. Positive: avatars make practice "enjoyable and stress-free." Praktika has a 4.6-star average across about 27k ratings on one listing (aggregator figure). — [Trustpilot](https://uk.trustpilot.com/review/praktika.ai?page=8); [Product Hunt](https://www.producthunt.com/posts/praktika); [Unstar](https://unstar.app/developer/praktika-ai-company-ios-1624701479?country=jp)
- An analysis of 1–3 star reviews across Speak, ELSA, TalkPal, Loora and Learna (by a competitor's site) found: sneaky weekly subscriptions, "repetitive and shallow" conversations, paywalled lessons, and slower real-world progress than the marketing promised. — [Unstar blog 2026](https://unstar.app/blog/is-speak-elsa-talkpal-loora-learna-ai-english-apps-legit-2026)
- Pingo: the voice "sounds unnatural," feedback is shallow, and it is beginner-only. — [LanguaTalk (competitor)](https://languatalk.com/blog/pingo-ai-review/)
- Character.AI learners report "unnatural responses" and a "lack of emotional interaction." — [IDEAS case study](https://ejournal.iainpalopo.ac.id/index.php/ideas/article/view/10181)
- Duolingo's users and Wall Street were "unimpressed" in 2025 despite record numbers; this is a Class Central headline. — [Class Central 2025](https://www.classcentral.com/report/duolingo-2025/)

### Inferences
- "Feels like a school teacher" and "clichés" are the complaints Fuori's design answers most directly: locals with real personalities and ongoing lives, and a teacher (Magda) kept separate from the people you talk to.
- Fuori should treat latency and voice quality as core to the product, since they are named complaints. It currently uses browser speechSynthesis before hosted TTS in M3.

### Gaps
- I could not get Reddit r/languagelearning or r/duolingo threads through search. User comments about Lily specifically (repetition, forgetting context, talking too much) are unverified.
- No churn or retention figures from users were found for any of these apps.

## Q4. Business and engagement data

### Takeaway
The money is real (Speak and Praktika have revenue in the tens of millions, and Duolingo has 12.7M paying subscribers), but AI conversation as a premium upsell is a small slice of the market. Max was about 5% of Duolingo's paid subscribers at the end of 2024 and about 9% in late 2025, and commentators in 2026 suggest Max may be phased out as Video Call gets cheaper.

### Cited Findings
- Duolingo:
  - Passed 10M paid subscribers in Q1 2025, with revenue up 38% year over year. — [Duolingo IR](https://investors.duolingo.com/news-releases/news-release-details/duolingo-adds-record-number-daus-surpasses-10-million-paid)
  - 12.7M paid subscribers in Q2 2026, up 17% year over year. — [Class Central Q2 2026](https://www.classcentral.com/report/duolingo-q2-2026/); [Q2 2026 shareholder letter](https://investors.duolingo.com/static-files/3c8277ee-bc94-4f5d-9b77-0db3e46f88b8)
- Duolingo Max share of paid subscribers:
  - About 5% at the end of 2024, and it "dragged down margins." — [Okara](https://okara.ai/blog/how-duolingo-grew); [Class Central 2025](https://www.classcentral.com/report/duolingo-2025/)
  - About 9% (around 981k) per von Ahn, roughly late 2025; the date is unclear in the source. — [Class Central 2025](https://www.classcentral.com/report/duolingo-2025/)
- Class Central's Q2 2026 analysis, titled roughly "Lite comes in, Max may be on its way out," cites the falling cost of Video Call. This is commentary, not a company disclosure, and I could not fetch the full text. — [Class Central Q2 2026](https://www.classcentral.com/report/duolingo-q2-2026/)
- Speak:
  - $78M Series C led by Accel at a $1B valuation (December 2024). — [AIM Research](https://aimresearch.co/?p=12965); [Techleap](https://finder.techleap.nl/news/feed/speak-raises-78m-reaches-unicorn-status)
  - About $162–166M raised in total, and 2023 revenue of $24M. — [CB Insights](https://www.cbinsights.com/company/speak-2/financials)
  - Unverified secondary claims: $50M ARR and 10M+ users, and over $100M annual revenue by late 2025. — [bestblogs](https://www.bestblogs.dev/en/article/659200); [SVIC](https://siliconvalleyinvestclub.com/companies/speak/)
- Praktika: $35.5M Series A led by Blossom Capital (May 2024). At the time it claimed 1.2M monthly active users across 100 countries and nearly $20M in revenue over the previous 12 months (company claim). Later profiles claim more than 30M registered learners. — [Yahoo/TechCrunch](https://sg.news.yahoo.com/praktika-raises-35-5m-ai-122549635.html); [Neuronfeed](https://neuronfeed.com/startups/praktika)
- Price points:

  | Product | Price |
  |---|---|
  | Duolingo Max (2023 launch) | $29.99/month or $167.99/year |
  | Pingo | $14.99/month or $99.99/year |
  | TalkPal | about $5–15/month |
  | Praktika | about $12/month |
  | Gliglish | about €23/year, with a 10-minute/day free tier |

  — sources cited in Q1

### Inferences
- These are tutor-style apps with roughly $10–30/month subscriptions. They monetise through aggressive trials and weekly plans, which shows up as a review complaint.
- Duolingo's experience suggests conversation features are expensive to serve and only a minority of payers take them as an add-on. Falling inference costs push the category toward bundling conversation into base tiers. Fuori should model its cost per minute of conversation carefully.

### Gaps
- No retention or churn figures (D30, M3) were found for any of these products. Max's share for 2026 was not confirmed from a primary source.

## Q5. Gaps in the market relevant to Fuori

### Takeaway
No documented product combines: (a) an open, generated city of characters who remember the learner as a person across days, (b) correction by recasting in character instead of a debrief, (c) a separate teacher character, and (d) the learner framed as someone staying for a while rather than a tourist or student. The closest are LingoLooper (a 3D world with many avatars, in early access) and Duolingo's character calls (persistent personalities but curriculum-scripted).

### Cited Findings
- Duolingo Roleplay is expert-scripted with set conversation directions, and feedback comes after the chat. — [OpenAI customer story](https://openai.com/index/duolingo)
- Users complain about no memory and no personalisation (Praktika) and about clichéd, teacher-like free chat. — [Trustpilot](https://uk.trustpilot.com/review/praktika.ai?page=8)
- Conversations are "repetitive and shallow" across the main AI English apps. — [Unstar blog](https://unstar.app/blog/is-speak-elsa-talkpal-loora-learna-ai-english-apps-legit-2026)
- LingoLooper uses a city framing with 350+ avatars per city, but is in early access with no documented memory. — [LingoLooper](https://www.lingolooper.com/)
- Several products are English-only or English-first (Loora, Speak's origins in Korea and Japan, Praktika's English focus), so Italian is likely underserved. — [Talkio roundup](https://www.talkio.ai/blog/best-ai-language-speaking-practice-apps-in-2026); [TechCrunch 2023](https://techcrunch.com/2023/08/31/openai-backed-language-learning-app-speak-raises-16m-to-expand-to-the-u-s)

### Inferences
- Fuori's distinctive bets are relationship memory, in-character recasting, and narrative continuity across days. They target the most-cited complaints: repetition, genericness, "feels like a teacher," and no memory. They are also untested by any competitor, so there is no outside evidence that they work.
- The risk Fuori shares with the category is shallow, lenient feedback that erodes learners' sense of progress. A visible but in-world record of progress (for example, Magda's lessons building on errors the locals noticed) could address both the "am I improving?" complaint and the lack of tracking.

### Gaps
- Direct evidence on whether character memory improves retention or learning in language apps was not found.
- LingoLooper's user metrics and reviews were not examined in depth.
