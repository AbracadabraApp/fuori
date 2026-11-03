# Onboarding: Doña Chela's welcome (Mexico)

2026-11-02 · Claude's draft for Josh, from Giulia's agreed script ([onboarding-giulia.md](onboarding-giulia.md)) · Not built.

Afuera's version of the same path: shown once, after the country choice; Doña Chela's regular portrait (`chela-chapulines`, 63, sells chapulines and quesillo in the Mercado Benito Juárez, Oaxaca; teasing, motherly). Claude plays her with this script as her brief, in the Beginner format; the answers are read from the whole conversation when it ends. Same rules as Giulia's: a misheard name is corrected by saying so; "either", non-binary or unclear → feminine; the last question is answered with a button.

## 1 · Hello and your name
> *¡Hola! Me dicen Doña Chela.* (Hi! People call me Doña Chela.)
> *¿Cómo te llamas?* (What's your name?)

Answers: *Me llamo …*

## 2 · Bienvenido or bienvenida
> *¡Mucho gusto, {name}!* (Nice to meet you!)
> "One thing that matters in Spanish: many words change between masculine and feminine, even 'welcome'. Should I say *bienvenido* or *bienvenida* to you?"

Answers: *Bienvenido* (masculine) / *Bienvenida* (feminine)

> *¡Bienvenida, {name}!* (or *Bienvenido*)
> *¿Es tu primera vez en México?* (Is this your first time in Mexico?)

Answers: *Sí, es mi primera vez.* / *No, no es mi primera vez.*

## 3 · Her reaction, then your Spanish
> If yes: "Then you've got so much ahead of you." *¡Qué padre!* (How great!)
> If no: "So you know it a little already." *¡Bienvenido de nuevo!* / *¡Bienvenida de nuevo!* (Welcome back!; Claude, 2026-11-02: *de vuelta* is a word-for-word "welcome back", *de nuevo* is what a local says, and keeps the masculine or feminine)
>
> *¿Ya hablas español?* (Do you already speak Spanish?)

Answers: *Todavía no.* (Not yet.) / *Sí, bastante bien.* (Yes, fairly well.)

## 4 · What Afuera is
> "In Afuera you can visit lots of cities and talk with interesting people: at the market, the fonda, the zócalo."
> *Cada ciudad es diferente.* (Every city is different.)
>
> "And whenever you need help, just ask in English or try your best in Spanish. People are friendly."
> *¡Somos muy buena onda!* (We're really friendly!)
>
> *Entonces, ¿a dónde vamos?* (So, where shall we go?)

The mic doesn't open. A button, *¡Vámonos!* (Let's go!), opens the city list.

## What the answers set
Same as Giulia's: name; masculine or feminine; first time in Mexico, into her memory and the onboarding record; *Todavía no* → Beginner, *Sí, bastante bien* → Intermediate (a first guess; when in doubt, Beginner).

## Choices made for Mexico (Claude)
- *Me dicen Doña Chela*: "Doña" is a title others give her, so she says what people call her rather than *Soy Doña Chela*.
- *Tú* throughout: an older market woman talking to a newcomer, motherly.
- *¡Qué padre!* and *buena onda*: everyday Mexican, where Italy has *Che bello!* and *simpatici*.
- Places named: market, fonda, zócalo, where Italy has bar, market, piazza.

## Meeting her again (Josh, 2026-11-02)
Onboarding writes to her memory, so when the player later visits her stall in the Mercado Benito Juárez she recognises them (*¡Ay, {name}! ¿Cómo te ha ido?*), as Giulia does in Italy.

## Decided (Josh, 2026-11-02)
- **Mic refused:** if the player taps "Don't Allow", they can tap an answer bubble instead, and she says once that the mic can be turned on in Settings.
- **Shown once means finished:** it counts as shown only when the player reaches the last button. Leave partway and it starts again at the next launch.
- **Everyone goes through it once**, including players who already play (those who arrived during the skip have no name, gender or level). Settings' "start over" replays it.

## Placement and the record (Josh, 2026-11-02: "make all your changes")
- **Placement by how they answer, not only what** (`lib/path.ts` → `placement`): *Todavía no* read back from the offered answer → the path's step 1; the same answer in their own words (anything more than the offered sentence) → step 3, since they're past saying back; *Sí, bastante bien* → Intermediate. Said back or own words is told apart in code, as the record does (`isSaidBack`). Stored as `startStep` in the learner's onboarding record.
- **Intermediate is a first guess the record corrects:** two hard conversations in a row at Intermediate (leaving without a word counts as hard) put them back on the path's last step.
- **Not in the record:** the onboarding conversation's prompt version starts with `onboarding`, so it isn't counted as a conversation on the path.

## Changed after play (Josh, 2026-11-02)
The welcome is a plain Beginner conversation, not a script: the character gets a short brief of goals (name; masculine or feminine, explained simply; first time in the country; how much of the language they speak; the cities and people, and asking for help in English or trying in the language) and says it her own way. The lines above are suggestions, not required wording. Two guards: the brief names the must-cover points, and if the reader at the end finds one missing she asks once more before the button. Why: forcing the exact script into the Beginner format made her repeat words, drop the English of a phrase, and copy the answer as its own English. It starts only after the country is chosen on the landing page.

**Leaner, after Josh's second play (2026-11-03):** too many topics and too much of the language. Three goals only: name; masculine or feminine; how much of the language they speak (no "first time in the country"). English carries it; the language in three moments only: hello and the name question; *Benvenuto o benvenuta?* / *¿Bienvenido o bienvenida?* after one English sentence ("words change for men and women"); the level question. Then one English sentence (every city has people to meet; ask for help in English anytime) and the button.
