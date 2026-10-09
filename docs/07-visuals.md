# Visuals

Three kinds of image, each matched to how much it matters and how often it's needed:

| What | How | Why |
|---|---|---|
| **Anchors and Magda** | Illustrated portraits with four moods, made in advance | Seen every day; worth the care |
| **Generated people** | One SVG avatar each, drawn in code from the character sheet | Created during play; free, instant, consistent |
| **Real places and food** | Real photos with credits | Accuracy; generated landmarks get details wrong |

Nothing is generated during a conversation.

## Portrait style (settled)

Tested with Giulia and Enzo: **watercolour and ink on white paper, travel-sketchbook style.** Loose transparent washes, fine ink lines, generous white paper, one accent colour per character (Giulia's indigo stripes, Enzo's olive jacket). A hint of their place behind them, fading into white.

- **Square 1:1**, head and shoulders, looking at the viewer. Set the aspect ratio in the generator's settings; most tools ignore it in the prompt.
- **No text or signs** in images.
- **Invented people only.**

### Base prompt template

Start a fresh chat per character so earlier images don't steer the style. Lead with the style:

> **Watercolour and ink sketch on white paper, travel-sketchbook style.** Loose transparent washes, fine ink lines, lots of blank white paper. Square, head and shoulders, looking at the viewer. {person: age, look, clothes with one accent colour, expression}. Behind them, only a few soft washes suggesting {place}, fading into plain white paper.

If the tool has a negative-prompt field, put "photo, photorealistic, text, sign, lettering" there rather than in the main prompt.

### Moods

Each portrait character gets four, matching the `mood` field the conversation engine returns:

| Mood | Shown when | Expression |
|---|---|---|
| `warm` | Default, greetings, goodbyes | Friendly smile |
| `amused` | A joke or a charming mistake | Laughing, eyes crinkled |
| `curious` | Asking a question, waiting | Eyebrows raised, playful half-smile |
| `busy` | Mid-task, thinking | Looking down; may hold one object (Enzo's tomato) |

**Keep the background identical across moods:** make the base image, then create each mood with a **masked edit** (inpainting) over the face only, so everything outside the mask stays pixel-identical. Regenerating, even from the same prompt, redraws the background and the face jumps in the app. Tools with region editing: ChatGPT's image editor (selection brush), Midjourney "Vary (Region)", Photoshop Generative Fill; Grok and other generators if their editor supports a selection.

Save as `public/characters/<id>/<mood>.webp` at 1024×1024 (512px is enough on screen). The conversation screen crossfades between moods and falls back to `warm`.

### Status

- **Giulia:** four moods made (tall format; crop to square before use).
- **Enzo:** amused, curious and busy made on one background; `warm` needs one more masked edit from the amused image so it matches.

## SVG avatars

For every generated person, and as placeholders in M1: drawn in code from the character sheet's appearance (age, hair, skin tone, clothing colours), so the same person always looks the same. A simple face with mood expressions is enough. Keep the palette in line with the watercolour portraits.

## Places

- **Real landmarks and food** (Santa Maria in Trastevere, a plate of cacio e pepe): real photos from Wikimedia Commons (mostly CC BY / CC BY-SA, attribution required) or Unsplash/Pexels. Store them with the app, record source, author and licence next to each in the content files, and show a small credit line.
- **Everyday places** (a bar, a market stall, a courtyard): watercolour illustrations in the portrait style, no people, used as tile images and as the blurred background behind conversations.

## Portrait descriptions: Roma anchors and seeds

Use with the base template above.

| Character | Person | Place |
|---|---|---|
| Giulia (anchor) | Italian woman in her early 30s, dark curly hair pinned up messily, small silver hoop earrings, navy-and-cream striped shirt, black apron, warm smile | A café counter |
| Signora Rita (anchor) | Italian woman around 70, short silver hair neatly set, reading glasses on a chain, a soft rust-coloured cardigan, kind but sharp eyes | Her courtyard doorway with ivy |
| Magda (tutor) | A teacher in her 50s from the Veneto, warm and precise, a deep blue scarf as accent | A bookshelf and a window onto a canal, very soft |
| Enzo (seed) | Italian man in his 60s, sun-tanned, weathered face, thick grey moustache, worn flat cap, faded olive-green work jacket over a white shirt, broad proud smile | A market stall under a striped awning, tomatoes and artichokes |
