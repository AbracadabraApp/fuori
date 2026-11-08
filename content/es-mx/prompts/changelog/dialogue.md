# dialogue.md changelog

Newest first. One entry per version: what changed, why, what prompted it. The prompt is `../dialogue.md`.

### 2026-11-06b: in order, and your own place's ways

Josh, 2026-11-06, "Coffee dialogue in Florence" (Beginner, Tommaso at Ditta Artigianale): Tommaso said he was grinding the beans and making the macchiato, then "you pay at the till first, then bring the receipt", then asked "ha lo scontrino?" though Josh had never gone to the till, then handed the macchiato over anyway. Josh asked why he hadn't started at the till, and "perché ogni bar ha detto le stesse cose?": every bar had told him to pay first and that cappuccino is for the morning. Nothing in Ditta Artigianale's content says pay first; it came from the model's idea of Italian bars. Replaying his conversation (tests/experiments/bar-errand.mts, 20 Beginner and 20 Intermediate replies per country): Italy Beginner: steps out of order 2/20 before, 0/20 after; a generic custom told as this bar's (pay first, cappuccino hours) 7/20 before, 3/20 after (the three left: paying at this counter, what a macchiato is). Intermediate 0/20 and 1/20 before, 0/20 and 0/20 after. Mexico (Café de la Calzada) 1/20 and 1/20 before, all 0/20 after. Josh's idea, the same day: "We should have cashiers or customers with receipts": bars where paying first is real now say so in their own description (the customer arrives with the scontrino), so it's the place's way, not a tip.

### 2026-11-06: stay within your job

Josh, 2026-11-06, the same conversation: Beto, a taxi driver, said "I can't make you one, but I know a good spot" and then "¿Quiere la torta con queso o con jamón?"; Josh: "¿Por qué estás tomando mi orden?", then "And the torta". beginner.md's "Never offer what your job can't give" holds only for Beginners and didn't stop it. Replaying his conversation at "I'm very hungry" and "Torta, por favor" (tests/experiments/job-drift.mts): a taxi driver served food in 2/10 Beginner and 1/10 Intermediate replies before this line; with "never serve, sell or take an order… never ask how they'd like it", 1/10 and 0/10 (a Beginner still asked "¿de pollo o de jamón?" after pointing him up the street); with "ask nothing about it (not which one, not how they'd like it): your next question is about your own job or your talk", 0/20 and 0/20.

### 2026-11-06: their goodbye ends it

Josh, 2026-11-06, after playing Beto the taxi driver in San Miguel (Beginner, "Many conversation issues"): he said goodbye five times ("Voy caminando, gracias… Adiós", "Hasta luego amigo", "Buenas noches"…); each time Beto said goodbye back and then started something new ("¿Quiere escuchar a los mariachis?", "¿De dónde es?"). "Their goodbye ends it" was decided 2026-10-25 (docs/beginner-scaffolding.md 11b) but only the welcome could end. Now every conversation says goodbye back with nothing new, and ordinary conversations' replies carry done (lib/prompts/turn-output-schema.ts doneField), which closes the screen in the app.

### 2026-11-05: first version

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" into "HO-ven" (a misheard "Joven, ¿me ayuda?"), and a Nov 3 lesson met "Estoy en el barco de canzart" with "Almost! The word you want is cansado"; Ardit recast "ribaletta". Each kind had its own correction rule (never; say it right once; one fix; recast) and only some mentioned speech-to-text. Josh: fixes "are global improvements not local to lessons or conversations or one country". One rule for corrections and mishearings here, and the app's said-back check told to the character as a fact.
