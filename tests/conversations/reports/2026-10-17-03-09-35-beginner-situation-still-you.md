# Conversation test

2026-10-17 03:09 UTC · model claude-sonnet-5-5 · prompt 2026-10-12i + level "Beginner: situation, still you" · 5 conversations · 6 learner turns each

## Grade: 8.7 / 10

| Criterion | Average |
|---|---|
| language | 10.0 |
| understands | 9.4 |
| adapts | 8.0 |
| alive | 7.4 |
| regional | 8.8 |

## Length

| Measure | Value |
|---|---|
| Opener (median words) | 8 |
| Reply (median words) | 18 |
| Reply (average words) | 16.8 |
| Longest reply (words) | 28 |
| Replies over 30 words | 0% |
| Questions per reply | 0.6 |
| Replies asking 2+ questions | 0% |

_Yardstick: a typical conversational turn is about 5–10 words._

## Top problems

1. **Replies run about double natural length.** Median replies are 14-21 words against a ~10-word norm, and openers reach 14. Sofía's "Sí, Tom! Los dulces son de Puebla. El camote es muy típico aquí. Mi familia los hace desde hace muchos años." is three or four beats where one would do.
2. **Stock warmth and echoing make characters feel scripted.** Chuy's "¡Claro que sí, mi vida!", Lupe's "mi cielo"/"mi vida" in nearly every line, and Sofía mostly restating the learner's words.
3. **Víctor ends nearly every turn with a question.** "¿Quiere sentarse un momento?" is fine alone, but turn after turn it feels like an interview and gives the learner nothing to react to.

## Recommendations

1. **Add one situational line to character.md about the pace of the exchange, not a length rule.** For example: "Es una charla de pie, de unos segundos: contestas lo que te preguntaron y dejas que la otra persona siga." It fits the situation-not-style approach and should pull turns toward 10 words, which fixes the most common problem. Re-run these five and check that median reply length drops without hurting the 9-10 comprehension scores.
2. **Replace endearments in character data with concrete local detail.** If Lupe's and Chuy's data lists "mi vida"/"mi cielo" (or the examples seed them), cut it. Give each character one or two specific things they're doing or care about: what Sofía is wrapping or stirring, which candy she'd push, what Chuy is cooking right now. Specifics give Sofía something to say besides echoing, and the endearment can then show up occasionally on its own.
3. **Give Don Víctor things to offer besides questions.** In his character data, add a few of his own observations or habits, like a bench, a regular he knows, or what the plaza is like at this hour. That lets him end turns on a statement and still be warm. Don't touch the gender-error recasts for Chuy; a natural character not correcting every slip is fine here.

Scores on language and comprehension are already 9-10 across the board, so the prompt is working. Concha's and Chuy's adaptation went untested because their learners never got lost, so run one more test with a learner who visibly struggles before changing anything for adaptation.

## By character (weakest first)

| Character | Place | Learner | language | understands | adapts | alive | regional | Overall | Opener words | Median reply |
|---|---|---|---|---|---|---|---|---|---|---|
| Sofía (ayuda en la dulcería de su familia) | Dulces Típicos La Gloria, Puebla | hesitant | 10 | 9 | 8 | 6 | 8 | 8.2 | 14 | 17 |
| Doña Lupe (quesadillera) | Quesadillas Doña Lupe, Ciudad de México | hesitant | 10 | 9 | 8 | 7 | 9 | 8.6 | 8 | 14 |
| Don Víctor (jubilado) | Parque Juárez, San Miguel de Allende | improving | 10 | 10 | 8 | 8 | 8 | 8.8 | 7 | 18 |
| Doña Concha (sacristana) | Templo de San Matías Jalatlaco, Oaxaca | english-beginner | 10 | 9 | 8 | 9 | 9 | 9.0 | 12 | 21 |
| Doña Chuy (cocinera) | Cocina Económica Doña Chuy, Guadalajara | english-beginner | 10 | 10 | 8 | 7 | 10 | 9.0 | 8 | 19 |


## How this test works

1. **Sample.** Random characters from the city files (one per city), each at their own place.
2. **Simulate.** Claude plays a learner for 6 turns. The character's replies come from `lib/turn.ts`, the same code the app uses, so this is the real prompt.
3. **Grade.** A separate Claude call reads each transcript and scores the character 1–10 (10 = a native speaker would find it entirely natural):
   - **language**: Speaks Spanish. Uses English only when the learner asks for it, and only as much as the character's English allows, then returns to Spanish.
   - **understands**: Understands imperfect speech. Reads garbled speech-to-text and learner errors as what they meant, without commenting on them.
   - **adapts**: Adapts when the learner is lost. Talking fast or in complex Spanish is fine (real people do); what matters is that when the learner signals confusion the character slows down and rephrases, and when they ask to repeat, repeats.
   - **alive**: Feels like a real person in that place. Distinct personality, reacts to what was said, recasts mistakes naturally instead of teaching.
   - **regional**: Uses Mexican Spanish. Avoids Spain Spanish markers like vosotros, vale, coger (for "take"), ordenador, zumo. Uses Mexican vocabulary and expressions.
4. **Measure length.** Counted, not graded: words in the opener, median and longest reply, share of replies over 30 words, questions per reply, and share asking more than one question (several threads at once). Yardstick: real conversational turns run about 1–2 seconds, roughly 5–10 words (Heldner & Edlund 2015; Stivers et al. 2009). These are measurements only; nothing is sent to the characters.
5. **Recommend.** One more call reads all the grades and lengths and suggests up to 3 changes. Nothing is changed automatically.

**Learner types**

- **english-beginner**: An American beginner (A1). Short, simple sentences. Typical mistakes: wrong article gender, English word order, mixing formal/informal (usted/tú). Some lines arrive garbled by speech-to-text.
- **hesitant**: A nervous beginner (A1). Hesitates ("ehm... yo... "), sometimes says "repite por favor" or "más lento", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").
- **improving**: A learner around A2 who has been in Mexico a few weeks. Uses past tense and longer sentences with occasional errors. Curious and chatty; asks the character about themselves and the neighbourhood.
- All learners are told to be honest: when a line is too fast or complex for their level, they say so instead of pretending to follow.

**Reading the results**

- The sample is small and the conversations are random, so expect grades to move by about half a point between runs with no changes. Look for problems that repeat, not single scores.
- The learner is simulated. It catches clear failures (switching to English, correcting speech-to-text noise, never recovering when the learner is lost) but is no substitute for talking to the characters yourself.
- To compare before and after a change, run both with the same `--seed` (same characters and learners) and compare the grades and length numbers. The learner's lines still vary between runs, so look at clear differences, not small ones.

## Transcripts

### Sofía, Dulces Típicos La Gloria (Puebla) · hesitant · 8.2

_Problem: Sofía is pleasant but generic and a bit scripted: she mostly echoes the learner's words and offers little personality or local color, with 'Está atrás' and 'Come, come' as the only real touches._

```
Sofía: ¡Hola! Bienvenido a Dulces Típicos La Gloria. Me llamo Sofía. ¿Quieres probar un dulce?
Learner: Ehm... hola, Sofía. Yo... ehm... sí, por favor.
Sofía: ¡Qué bien! Toma, este es un camote. Es un dulce de Puebla. ¡Está muy rico!
Learner: Ehm... gracias. ¿Qué es... "camote"?
Sofía: Camote es una papa dulce. Mi familia hace este dulce con camote y azúcar. ¡Es mi favorito!
Learner: Ehm... ¿papa dulce? Ah... ¿Repite, por favor? Más lento.
Sofía: ¡Claro! Camote... es una papa... dulce. Come, come. ¡Es muy rico!
Learner: Ehm... ah, okay. Camote... papa dulce. Mmm... gracias, está... ehm... muy rico.
Sofía: ¡Qué bueno! Me da mucho gusto. Mi abuela hace el camote aquí, en la tienda. ¿Cómo te llamas?
Learner: Ehm... me llamo... Tom. ¿Tu abuela... ehm... hace los dulces? Perdón, no entiendo todo.
Sofía: ¡Mucho gusto, Tom! Sí, mi abuela hace los dulces. Está atrás, en la cocina. No hay problema, hablo despacio.
Learner: Ehm... mucho gusto, Sofía. ¿Los dulces... ehm... son de Puebla?
Sofía: ¡Sí, Tom! Los dulces son de Puebla. El camote es muy típico aquí. Mi familia los hace desde hace muchos años.
```

### Doña Concha, Templo de San Matías Jalatlaco (Oaxaca) · english-beginner · 9.0

_Problem: The learner never signals confusion, so adaptation is barely tested; Concha does speak simply, but she never needs to rephrase or repeat._

```
Doña Concha: ¡Buenos días! Yo soy Concha. Cuido esta iglesia. ¿Cómo se llama usted?
Learner: Buenos días, Doña Concha. Me llamo Jake, mucho gusto.
Doña Concha: Mucho gusto, Jake. Bienvenido a mi iglesia. Es pequeña, pero muy bonita. ¿Es su primera vez aquí?
Learner: Sí, es mi primera vez. La iglesia es muy bonito.
Doña Concha: Gracias, Jake. Sí, es muy bonita. Yo la limpio todos los días. Mire, las flores del altar son nuevas. ¿Le gustan?
Learner: Sí, me gusta las flores. Son muy bonito.
Doña Concha: Me alegra, Jake. Sí, son muy bonitas. Las compré esta mañana en el mercado. Son para la misa de hoy. ¿Usted quiere ver el altar?
Learner: Sí, quiero ver el altar. ¿Es muy viejo?
Doña Concha: Sí, Jake, es muy viejo. Pero está fuerte, como yo. Venga, por aquí, despacito.
Learner: Ok, gracias. ¿Cuántos años tiene la altar?
Doña Concha: El altar tiene más de doscientos años, Jake. Es más viejo que yo, ¡y yo tengo setenta! Mire el oro, es muy bonito.
Learner: ¡Wow! Doscientos años es muy viejo. ¿El oro es real?
Doña Concha: Sí, Jake, es oro de verdad, pero muy delgadito, como papel. Mire con los ojos, no con las manos. Yo sí lo limpio, pero yo soy la sacristana.
```

### Don Víctor, Parque Juárez (San Miguel de Allende) · improving · 8.8

_Problem: Nothing goes wrong, but Don Víctor ends almost every turn with a question, which makes the exchange feel a bit like an interview, and his Spanish has few distinctly Mexican markers or local color._

```
Don Víctor: Buenas tardes, joven. Qué bonito día, ¿verdad?
Learner: Buenas tardes, señor. Sí, es un día muy bonito. Yo llegué a San Miguel hace tres semanas, ¿y usted vive aquí cerca?
Don Víctor: Sí, vivo muy cerca de aquí. Bienvenido a San Miguel, joven. ¿Le gusta el parque?
Learner: Sí, me gusta mucho el parque. Ayer yo caminé aquí y vi muchos árboles y unos niños que jugaban, ¿usted viene aquí todos los días?
Don Víctor: Sí, vengo casi todos los días. Me siento aquí y miro los árboles. ¿Quiere sentarse un momento?
Learner: Sí, gracias, me siento un momento. ¿Usted es de San Miguel o es de otra ciudad?
Don Víctor: Soy de San Miguel, de aquí. Tengo setenta y cinco años, pero las piedras de esta ciudad son más viejas que yo. ¿Y usted, de dónde es?
Learner: Yo soy de Canadá, de Toronto. Setenta y cinco años, ¡qué bien! ¿Usted trabajó aquí en San Miguel antes?
Don Víctor: ¡Toronto! Qué lejos. Sí, trabajé aquí muchos años. Fui maestro de arte en una escuela. ¿Le gusta el arte?
Learner: Sí, me gusta el arte. Ayer yo visité una galería en el centro y vi cuadros muy bonitos, ¿usted pinta también?
Don Víctor: Sí, pinto un poco. Pinto estos árboles. Son siempre iguales, y siempre distintos. ¿Qué cuadro le gustó ayer?
Learner: Me gustó un cuadro de una mujer con flores rojas, era muy grande y muy colorido. ¿Usted pintó también a personas, o solo árboles?
Don Víctor: De joven pinté a muchas personas. Ahora solo árboles. Los árboles no se mueven y no se quejan. ¿Usted pinta?
```

### Doña Chuy, Cocina Económica Doña Chuy (Guadalajara) · english-beginner · 9.0

_Problem: She never recasts the learner's gender errors ("una agua", "la pozole", "huele muy bueno") and leans on a repeated "¡Claro que sí, mi vida!" filler, which makes her a bit stock-like, though the learner never signals confusion._

```
Doña Chuy: ¡Buenas tardes, mi vida! Pásale, siéntate. ¿Tienes hambre?
Learner: Buenas tardes. Sí, tengo mucho hambre. ¿Qué tiene usted hoy?
Doña Chuy: ¡Qué bueno, mi vida! Hoy tengo pozole y tacos dorados. Todo está recién hecho. ¿Quieres pozole?
Learner: Sí, quiero el pozole, por favor. ¿Es picante?
Doña Chuy: ¡Ahorita te lo sirvo, mi vida! No, no es picante. El chile va aparte, tú le pones. Y te doy bastante, ¿eh?
Learner: Okay, gracias. ¿Tienes una agua también, por favor?
Doña Chuy: ¡Claro que sí, mi vida! Ahorita te traigo tu agua. Tengo agua de jamaica y agua natural. ¿Cuál quieres?
Learner: Agua natural, por favor. ¿Cuánto es todo?
Doña Chuy: Son ochenta y cinco pesos, mi vida. Pero primero come, después pagas. ¡Siéntate, siéntate!
Learner: Okay, gracias. Me siento aquí. ¡Huele muy bueno!
Doña Chuy: ¡Claro que sí, mi vida! Es mi receta de siempre. Ahorita te traigo tu pozole bien caliente, con tu agua. ¡Y a comer todo!
Learner: Gracias, doña Chuy. ¿Es la pozole de pollo o de puerco?
Doña Chuy: Es de puerco, mi vida. En mi cocina, el pozole siempre es de puerco. ¡Con mucho maíz y bien rico!
```

### Doña Lupe, Quesadillas Doña Lupe (Ciudad de México) · hesitant · 8.6

_Problem: Her warmth is repetitive ("mi cielo"/"mi vida" in nearly every line) and her explanation of "pica" is a bit dictionary-like, though it's still simple and clear._

```
Doña Lupe: ¡Hola, mi cielo! Bienvenido. ¿Quieres una quesadilla caliente?
Learner: Ehm... hola. Sí... una quesadilla, por favor.
Doña Lupe: ¡Claro que sí, mi vida! Ya la preparo. ¿De queso o de flor de calabaza?
Learner: Ehm... de queso, por favor.
Doña Lupe: ¡Perfecto, mi cielo! Una de queso. Ya está en el comal, y huele rico.
Learner: Ehm... gracias. ¿Cuánto... cuánto es?
Doña Lupe: Son treinta pesos, mi cielo. Ya casi está lista.
Learner: Ehm... ¿treinta? Sí, sí... aquí está.
Doña Lupe: Gracias, mi vida. Aquí tienes tu quesadilla, bien calientita. ¿Quieres salsa?
Learner: Ehm... ¿salsa? Sí... un poco, por favor.
Doña Lupe: Claro, mi cielo. Aquí tienes la salsa verde. Está rica, pero pica un poquito.
Learner: Ehm... ¿pica? Perdón, no entiendo. Más despacio, por favor.
Doña Lupe: Con calma, mi cielo. Pica quiere decir que es picante. Tiene chile. Pruébala poquito a poquito.
```
