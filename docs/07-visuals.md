# Visuals

Every conversation shows the person you're talking to, and their face changes with their mood. Claude writes the portrait prompts; an image-generation model draws them. Portraits are made **once, in advance**, never during play.

## Why pre-generated

- **Speed:** generating an image takes seconds, which would break a spoken conversation.
- **Consistency:** Giulia must look like the same person on day 1 and day 4. Image models drift between generations, so we lock a portrait set per character and reuse it.
- **Cost:** a cast of 8 with 4 moods each is about 32 images per city, generated once.

## Style guide

- **Illustrated, not photographic.** Warm gouache / graphic-novel style: visible brush texture, simplified shapes, soft natural light. This keeps the cast consistent and avoids the uncanny look of fake photos.
- **Palette:** Roman ochres, terracotta walls and faded greens in the backgrounds; characters' clothing in muted colours with one personal accent.
- **Framing:** head and shoulders, three-quarter view, looking at the viewer, as if across a counter or a table. Square, 1024×1024.
- **Background:** a hint of the character's place (bar counter, market stall, courtyard), softly out of focus.
- **People:** invented characters only. Never a real or recognisable person, never a celebrity lookalike. Ages, body types and looks as varied as real Italian streets.

## Moods

Each character gets four expressions, matching the `mood` field the conversation engine returns:

| Mood | Shown when | Expression |
|---|---|---|
| `warm` | Default, greetings, goodbyes | Friendly smile, open face |
| `amused` | Learner makes a joke or a charming mistake | Laughing or grinning |
| `curious` | Character asks a question, waits for an answer | Raised eyebrows, head slightly tilted |
| `busy` | Mid-task, thinking, or the learner is slow to answer | Glancing down or aside, hands occupied |

## Pipeline

1. **Write the character sheet** in `content/characters/<id>.ts` (already needed for the conversation engine).
2. **Claude writes the portrait prompt** from the sheet: one base description plus a line per mood, using the style guide above. Store it in the character file as `portrait.prompt`.
3. **Generate the base portrait** (the `warm` mood) with an image model. Generate a few candidates and pick one.
4. **Generate the other moods from the base image**, using the model's image-editing or reference-image feature ("same person, same clothes, now laughing"), so the face stays the same.
5. **Save** as `public/characters/<id>/<mood>.webp` (about 512px is enough on screen), and commit them.
6. **In the app**, the conversation screen shows `/characters/<id>/<mood>.webp`, crossfading when the mood changes. Fall back to `warm` if a mood image is missing.

A small script (`scripts/portraits.ts`) can run steps 2–4 for every character missing images. The image service and its API key are only needed when generating, not when playing. Image models that support editing from a reference image (Google, OpenAI and Flux-based services all offer one) work for step 4; pick one when we get there.

### Placeholders for M1

Before real portraits exist, draw simple SVG avatars in code: a coloured circle, hair shape, eyes and mouth that change with the mood. Free, instant and consistent, and they keep the UI honest about where portraits go.

## Places

One illustration per location, used as the conversation screen's background (blurred and dimmed behind the chat) and on the journey map:

- Giulia's bar: zinc counter, espresso machine, pastries under glass, morning light
- Mercato di San Cosimato: Enzo's stall, crates of tomatoes and artichokes, striped awning
- Franco's tabaccheria: the blue "T" sign, lottery tickets, a narrow counter
- Rita's courtyard: ivy, laundry lines, a bench, terracotta pots
- Matteo's wine bar: a few stools, bottles to the ceiling, warm lamp light
- Piazza di Santa Maria in Trastevere at dusk: the fountain, the church mosaics glowing

## Portrait prompts: Roma cast

Base prompt template (style guide applied):

> Head-and-shoulders illustrated portrait, warm gouache graphic-novel style, visible brush texture, soft natural light, three-quarter view looking at the viewer, square format. Background: {place}, softly out of focus, Roman ochre and terracotta tones. Subject: {description}. Expression: {mood}. An invented person, not resembling any real individual.

| Character | Description | Place |
|---|---|---|
| Giulia | Italian woman in her early 30s, dark curly hair tied up messily, small silver hoop earrings, black barista apron over a striped shirt, quick lively eyes | Behind the counter of a small Roman coffee bar |
| Signora Rita | Italian woman around 70, short silver hair neatly set, reading glasses on a chain, cardigan over a floral blouse, kind but sharp eyes | Her courtyard doorway with ivy and laundry lines |
| Enzo | Italian man in his 60s, sun-tanned, thick grey moustache, flat cap, rolled-up sleeves, holding a ripe tomato as if presenting a jewel | His market stall under a striped awning |
| Franco | Italian man in his 50s, heavyset, close-cropped greying hair, reading glasses pushed up on his forehead, plain dark polo shirt, gruff but not unkind | A narrow tabaccheria counter with lottery tickets behind him |
| Nonna Franca | Very old Italian woman, small and round, white hair in a bun, black dress with a knitted shawl, deeply lined smiling face | Sitting on a bench in a sunlit courtyard |
| Davide | Italian man around 25, slim, short dark hair, light stubble, round glasses, denim jacket over a band T-shirt | A family dinner table with a checked tablecloth |
| Matteo | Italian man in his 40s, broad shoulders, salt-and-pepper beard, sleeves rolled, holding up a glass of red wine to the light | A tiny wine bar with bottles to the ceiling, warm lamp light |
| Sofia | Italian woman around 22, long straight brown hair, paint on her fingers, oversized linen shirt, sketchbook in hand | Piazza di Santa Maria in Trastevere at dusk |

Mood lines to append:
- `warm`: "a warm, friendly smile"
- `amused`: "laughing, eyes crinkled with amusement"
- `curious`: "eyebrows raised, head slightly tilted, waiting for an answer"
- `busy`: "glancing down at their work, hands busy, mid-task"
