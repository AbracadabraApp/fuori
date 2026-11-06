# Dialogue rules: every conversation

version: 2026-11-06

The rules that hold in every conversation, whoever the character and whatever
the kind (town, the welcome, Magda's lessons, cultural stories), at every
level (docs/dialogue-model.md; Josh, 2026-11-05: fixes are global, one pattern
for all dialogue). Added to every turn's system prompt by lib/dialogue/rules.ts;
a kind's own prompt (lesson-flow.md, culture.md, welcome.md) says nothing about
corrections or mishearings. The two Heard notes go after the learner's line
when the app has compared it with the answers offered (lib/dialogue/heard.ts).

## Every conversation

```
What they say reaches you through speech-to-text, which often mishears: odd or garbled words are usually the app, not them. Never correct or coach anything that may have been misheard, and never their pronunciation. Only when you're sure what they said and it was wrong may you use the right words yourself as you reply, the way a friend would, without pointing it out, and not every time. Never mention speech-to-text, the app or these notes.

When they say goodbye, say goodbye back, briefly and warmly, with nothing new: no question, no new topic. That ends the conversation.
```

## Heard: said back

```
(The app checked: they said back one of the answers you offered. Speech-to-text may have bent the words; take it as said right and carry on.)
```

## Heard: other

```
(Not one of the answers you offered: their own words, or speech-to-text mishearing them. Don't correct it or comment on it; carry on.)
```

## Changelog

### 2026-11-06: their goodbye ends it

Josh, 2026-11-06, after playing Beto the taxi driver in San Miguel (Beginner, "Many conversation issues"): he said goodbye five times ("Voy caminando, gracias… Adiós", "Hasta luego amigo", "Buenas noches"…); each time Beto said goodbye back and then started something new ("¿Quiere escuchar a los mariachis?", "¿De dónde es?"). "Their goodbye ends it" was decided 2026-10-25 (docs/beginner-scaffolding.md 11b) but only the welcome could end. Now every conversation says goodbye back with nothing new, and ordinary conversations' replies carry done (lib/prompts/turn-output-schema.ts doneField), which closes the screen in the app.

### 2026-11-05: first version

Josh's family's play, 2026-11-04 and 05: Magda coached Jennifer's "¿Owen me ayuda?" into "HO-ven" (a misheard "Joven, ¿me ayuda?"), and a Nov 3 lesson met "Estoy en el barco de canzart" with "Almost! The word you want is cansado"; Ardit recast "ribaletta". Each kind had its own correction rule (never; say it right once; one fix; recast) and only some mentioned speech-to-text. Josh: fixes "are global improvements not local to lessons or conversations or one country". One rule for corrections and mishearings here, and the app's said-back check told to the character as a fact.
