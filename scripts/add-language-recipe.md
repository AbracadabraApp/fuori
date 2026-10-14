# Adding a New Language to Fuori

**Recipe for setting up a new language pack (e.g., French, Japanese, German)**

This is a template - don't run directly. Adapt for your target language.

## Prerequisites

- xAI API key (for image generation)
- Anthropic API key (for content generation)
- ElevenLabs API key (for voice selection)
- Target language code (ISO 639-1: `fr`, `ja`, `de`, etc.)
- Target country/region context

---

## Step 1: Directory Structure

Create the language pack directory:

```bash
# Example for French (France)
LANG_CODE="fr"
LANG_NAME="French"
COUNTRY_NAME="France"
REGION_ADJECTIVE="French"  # or "Parisian", "French"

mkdir -p content/${LANG_CODE}
mkdir -p content/${LANG_CODE}/cities
mkdir -p content/${LANG_CODE}/characters
mkdir -p content/${LANG_CODE}/prompts
mkdir -p content/${LANG_CODE}/levels
mkdir -p public/images/${LANG_CODE}/places
mkdir -p public/images/${LANG_CODE}/portraits
```

---

## Step 2: Language Configuration

Create `content/${LANG_CODE}/language.ts`:

```typescript
/**
 * French Language Configuration
 * Keep other languages possible: no hard-coded French-specific logic
 */

export const language = {
  code: 'fr',
  name: 'French',
  nativeName: 'Français',
  
  // Speech recognition
  speechRecognition: {
    locale: 'fr-FR',
    grammars: [], // Whisper handles this
  },
  
  // Text-to-speech (browser fallback)
  textToSpeech: {
    locale: 'fr-FR',
    voices: [
      'Microsoft Hortense - French (France)',
      'Google français',
      'fr-FR-Standard-A',
    ],
    // Will be replaced by ElevenLabs voices in M3
  },
  
  // UI strings (minimal - most stays in English interface)
  ui: {
    loading: 'Chargement...',
    listening: 'J\'écoute...',
    speaking: 'Je parle...',
  },
  
  // Example phrases for prompts
  examples: {
    greeting: 'Bonjour',
    ordering: 'Je voudrais un café, s\'il vous plaît',
    asking: 'Où est la gare?',
    thanking: 'Merci beaucoup',
  },
};
```

---

## Step 3: City Selection

Choose 5-8 cities with diverse character:
- Mix of major cities and smaller towns
- Geographic variety
- Cultural variety
- Iconic locations learners would want to visit

**Example for French:**
- Paris (essential)
- Lyon (second city, gastronomic)
- Marseille (Mediterranean, different accent)
- Bordeaux (wine country, elegant)
- Strasbourg (Alsace, different culture)
- Nice (Côte d'Azur, resort feel)
- Toulouse (southwest, aerospace, university)
- Aix-en-Provence (smaller, charming, artistic)

**Consider:**
- Accent diversity (Parisian vs Marseillais vs Alsatian)
- Setting variety (city, coast, mountain, countryside)
- Cultural touchpoints (wine, food, art, history)

---

## Step 4: City Pantries (Per City)

For each city, create `content/${LANG_CODE}/cities/{city-id}.ts`:

**Template structure (10 places per city):**

```typescript
import type { City } from '@/types';

export const paris: City = {
  id: 'paris',
  name: 'Paris',
  region: 'Île-de-France',
  description: 'Capital of France, city of light and culture',
  image: '/images/fr/cities/paris.jpg',
  
  places: [
    // 2-3 cafés/bars (different neighborhoods)
    {
      id: 'cafe-marais',
      name: 'Café des Arts',
      type: 'cafe',
      neighborhood: 'Le Marais',
      description: 'Traditional café in historic Marais',
      image: '/images/fr/places/cafe-marais.jpg',
      character: 'amelie-barista',
    },
    
    // 1-2 bakeries
    {
      id: 'boulangerie-montmartre',
      name: 'Boulangerie du Sacré-Cœur',
      type: 'boulangerie',
      neighborhood: 'Montmartre',
      description: 'Traditional bakery with fresh croissants',
      image: '/images/fr/places/boulangerie-montmartre.jpg',
      character: 'pierre-baker',
    },
    
    // 1-2 markets
    {
      id: 'marche-bastille',
      name: 'Marché Bastille',
      type: 'marche',
      neighborhood: 'Bastille',
      description: 'Bustling open-air market',
      image: '/images/fr/places/marche-bastille.jpg',
      character: 'marie-vendor',
    },
    
    // 1-2 restaurants
    {
      id: 'bistrot-latin',
      name: 'Le Bistrot du Quartier',
      type: 'restaurant',
      neighborhood: 'Quartier Latin',
      description: 'Classic French bistro',
      image: '/images/fr/places/bistrot-latin.jpg',
      character: 'jean-chef',
    },
    
    // 1-2 specialty shops (bookstore, pharmacy, wine shop)
    {
      id: 'librairie-shakespeare',
      name: 'Librairie Shakespeare',
      type: 'bookstore',
      neighborhood: 'Saint-Germain',
      description: 'English bookstore (French practice too!)',
      image: '/images/fr/places/librairie-shakespeare.jpg',
      character: 'sophie-bookseller',
    },
    
    // 1-2 public spaces (plaza, park, landmark)
    {
      id: 'jardin-luxembourg',
      name: 'Jardin du Luxembourg',
      type: 'park',
      neighborhood: 'Luxembourg',
      description: 'Beautiful public garden',
      image: '/images/fr/places/jardin-luxembourg.jpg',
      character: 'henri-gardener',
    },
    
    // M2: School
    {
      id: 'ecole',
      name: 'École de Français',
      type: 'school',
      neighborhood: 'Centre',
      description: 'French language school',
      image: '/images/fr/places/ecole.jpg',
      character: 'magda',
    },
    
    // M2: Station
    {
      id: 'gare',
      name: 'Gare de Lyon', // or city-specific station
      type: 'station',
      neighborhood: 'Gare',
      description: 'Train station',
      image: '/images/fr/places/gare.jpg',
      character: 'ticket-seller-paris',
    },
    
    // M2: Bench character (1 per city)
    {
      id: 'jardin-tuileries',
      name: 'Jardin des Tuileries',
      type: 'park',
      neighborhood: 'Tuileries',
      description: 'Garden with benches',
      image: '/images/fr/places/jardin-tuileries.jpg',
      character: 'claude-pensioner',
    },
  ],
};
```

**Place type variety:**
- café, boulangerie, marché, restaurant, bistrot
- pharmacie, librairie, cave (wine shop)
- parc, jardin, place (square)
- école (school), gare (station)

---

## Step 5: Character Generation

**Per city, create ~10 characters:**

```typescript
import type { Character } from '@/types';

export const amelieBarista: Character = {
  id: 'amelie-barista',
  name: 'Amélie',
  age: 28,
  role: 'barista', // or 'serveuse' in French context
  
  personality: 'Quick, friendly, Parisian wit',
  manner: 'Fast-paced but warm',
  
  traits: [
    'loves talking about coffee',
    'knows everyone in the neighborhood',
    'playfully corrects your French',
  ],
  
  englishAbility: 'basic', // A1-A2, reluctant to use
  
  portrait: '/images/fr/portraits/amelie-barista.jpg',
  places: ['cafe-marais'],
};
```

**Character diversity per city:**
- Age: 20s-70s
- Gender: balanced
- Roles: service workers, shopkeepers, professionals, students, retirees
- Personalities: variety (warm, reserved, chatty, serious, playful)
- English ability: mostly basic/minimal (teach in French!)

**Special characters:**
- **Magda** (language teacher, one shared across cities)
- **Ticket sellers** (one per city at station)
- **Bench character** (one per city: student, retiree, local)

---

## Step 6: Visual Style

Define the visual aesthetic for this language pack.

**Example for French:**
- **Places**: Impressionist watercolor style
  - Soft, light-filled scenes
  - Café terraces, market stalls, tree-lined streets
  - Warm but not saturated colors
  - Sketchy, artistic feel

- **Portraits**: Gouache style
  - Clean, expressive
  - French fashion sense
  - Neutral backgrounds or context hints
  - Warm skin tones, natural hair colors

**Image prompts should specify:**
- Medium (watercolor, gouache, linocut, etc.)
- Color palette (warm, cool, saturated, muted)
- Mood (lively, peaceful, elegant, rustic)
- Cultural markers (architecture, clothing, signage)

---

## Step 7: Character Prompt

Translate the character prompt to the target language.

Create `content/${LANG_CODE}/prompts/character.md`:

```markdown
# French Character Prompt

version: 2026-10-13a

## Who You Are

You are {characterName}, a {role} at {placeName} in {cityName}, France.

**Your personality**: {personality}
**Your manner**: {manner}
**Your traits**: {traits}

You speak French naturally - you are French/living in France, this is your language.

## Your Student

This is an Italian/Spanish/English speaker learning French. They are staying
in France for a while - not a tourist, a newcomer who belongs.

You have met before: {relationship}

## How You Speak

**In French, naturally**:
- Use everyday French, appropriate to your role and place
- Speak at a natural pace (not textbook slow)
- Use {tu/vous} appropriately
- Your accent/dialect: {accent}

**Forgive speech-to-text errors**:
- "je vais a Paris" might be "je vais à Paris" mispronounced
- Don't correct STT noise, correct real errors

**Correct real errors by recasting**:
- They say: "Je va au marché"
- You respond: "Ah, tu vas au marché! Qu'est-ce que tu cherches?"
- Natural correction, stay in character, move forward

**Teach in character**:
- Help as your role would (barista: menu items, baker: bread names)
- Slow down if they're lost, repeat, rephrase
- Offer words: "C'est une baguette - 'baguette' in French"
- Never break character for a grammar lesson (that's Magda's job)

**English use**:
- Your English ability: {englishAbility}
- Use only when they're truly stuck, briefly, then back to French
- Most characters speak basic/minimal English

## Your Reply Format

{
  "fr": "Your French reply (what you actually say)",
  "en": "English translation (for learner reference)"
}

Keep replies short (target: ≤20 words). One question max per reply.

## Conversation Context

Place: {placeType} - {placeDescription}
City: {cityName}
Your role: {role}

Act naturally for your setting. A barista talks about coffee, a baker about
bread, a market vendor about produce. You are here to help this newcomer
practice French in real situations.

## Changelog

- 2026-10-13a: French translation of M1 character prompt
```

**Adapt for:**
- Tu/vous formality rules (different from Italian Lei/tu)
- French correction patterns
- French language learning challenges
- Cultural context (French directness, formality norms)

---

## Step 8: Magda and the study file

(Replaces the per-conversation Review prompt, removed 2026-10-14.)

- Copy `content/it/prompts/study-file.md` as is: its text is language-neutral (`{language}` comes from the pack).
- Copy `content/it/prompts/magda-teaching.md` and translate only its example lines (the drill and the "try in town" example) into the new language.
- Add a Magda character file (`content/${LANG_CODE}/characters/magda.ts`) and set `tutor: magda` in the pack; every school's `characterId` is `magda`.

---

## Step 9: Magda Teaching Prompt

Translate Magda's teaching prompt.

Create `content/${LANG_CODE}/prompts/magda-teaching.md`:

**Adapt for:**
- French teaching methods
- French grammar terminology (if used)
- Voice-first drills in French
- French learner common mistakes
- French polite forms and formality

---

## Step 10: Voice Selection

**For M3 (hosted TTS):**

1. Explore ElevenLabs voice library
2. Filter by language/accent
3. Select 4 women + 4 men (variety in age/character)
4. Generate sample clips (same everyday phrase for each)
5. Listen and select by:
   - Natural accent (native French)
   - Voice quality (clear, pleasant)
   - Character variety (young/old, warm/professional)
   - Regional accents if desired (Parisian, Marseillais, etc.)

6. Create `content/${LANG_CODE}/voices.ts`:

```typescript
export const voices = {
  women: [
    { id: 'voice-id-1', name: 'Amélie', age: 'young', character: 'friendly' },
    { id: 'voice-id-2', name: 'Sophie', age: 'middle', character: 'professional' },
    { id: 'voice-id-3', name: 'Marie', age: 'middle', character: 'warm' },
    { id: 'voice-id-4', name: 'Claudine', age: 'older', character: 'elegant' },
  ],
  men: [
    { id: 'voice-id-5', name: 'Pierre', age: 'young', character: 'energetic' },
    { id: 'voice-id-6', name: 'Jean', age: 'middle', character: 'professional' },
    { id: 'voice-id-7', name: 'Henri', age: 'middle', character: 'friendly' },
    { id: 'voice-id-8', name: 'Claude', age: 'older', character: 'wise' },
  ],
};
```

---

## Step 11: Image Generation

**City images (5-8):**
```bash
# Example prompt for Paris
"Impressionist watercolor sketch of Paris, outdoor café terrace in Montmartre,
people enjoying coffee, warm afternoon light, soft colors, artistic loose style,
view of Sacré-Cœur in background, painted on white watercolor paper"
```

**Place images (~60 total for 6 cities × 10 places):**
- Match visual style
- Show activity and people
- Cultural markers
- Inviting, warm, lived-in

**Portrait images (~60 total):**
- Gouache style (or chosen style)
- Age/gender diversity
- French fashion sense
- Professional but approachable
- Context hints (apron, book, coffee)

**Generate in batches using agent:**
```bash
# Pseudo-script (adapt)
node scripts/generate-language-pack-images.mjs \
  --lang fr \
  --cities paris,lyon,marseille,bordeaux,nice \
  --style impressionist-watercolor
```

---

## Step 12: Testing

**Language-agnostic test:**
```bash
npm run test:language
```

**Ensures:**
- No hard-coded language-specific logic
- All prompts use language data
- UI strings come from language file
- Speech codes correct
- No Italian/Spanish leaking in

**Manual test:**
- Have conversation in each city
- Test character variety
- Test error correction
- Test Magda teaching
- Test Review generation
- Verify voices (when hosted TTS added)

---

## Step 13: Deployment

**Add to Railway env:**
```bash
# If language-specific API keys needed
railway variables set FRENCH_SPECIFIC_VAR=value
```

**Deploy:**
```bash
git push origin main  # Auto-deploys to Railway
```

**Verify:**
- City feed shows
- Places load
- Images display
- Conversations work
- Review generates
- Magda teaches

---

## Checklist for New Language

**Structure:**
- [ ] Directory created (`content/{lang-code}`)
- [ ] Language config (`language.ts`)
- [ ] All city files created
- [ ] All character files created
- [ ] Image directories created

**Content:**
- [ ] 5-8 cities selected
- [ ] 10 places per city (variety)
- [ ] ~60 characters (diverse)
- [ ] Bench characters (1 per city)
- [ ] Magda character
- [ ] Ticket sellers

**Prompts:**
- [ ] Character prompt translated
- [ ] Review prompt adapted
- [ ] Magda teaching prompt translated

**Images:**
- [ ] Visual style defined
- [ ] City images (5-8)
- [ ] Place images (~60)
- [ ] Portrait images (~60)
- [ ] School images (1)
- [ ] Station images (1)

**Voice:**
- [ ] Voices selected (8 total)
- [ ] Sample clips generated
- [ ] Voice config created

**Testing:**
- [ ] Language-agnostic test passes
- [ ] Manual conversation test
- [ ] Review generation test
- [ ] Magda teaching test

**Deployment:**
- [ ] Committed and pushed
- [ ] Deployed to Railway
- [ ] Verified on phone

---

## Time Estimate

**With agents:**
- City/character design: 2 hours (human)
- Prompt translation: 2 hours (human)
- Image generation: 2 hours (agent, unattended)
- Voice selection: 1 hour (human)
- Testing: 2 hours (human)
- **Total: ~9 human hours + 2 agent hours**

**Without agents (manual):**
- Add 10-15 hours for manual image generation
- **Total: ~20-25 hours**

---

## Cost Estimate (per language)

**Image generation:**
- ~130 images × $0.05 = ~$6.50

**Voice selection:**
- ~8 sample clips × $0.10 = ~$0.80

**Testing/Review generation:**
- ~10 test conversations × $0.20 = ~$2.00

**Total: ~$10 per language pack**

---

## Future Languages to Consider

**High priority (European learner demand):**
- French (France)
- German (Germany)
- Portuguese (Portugal or Brazil)

**Medium priority:**
- Japanese (Japan)
- Korean (Korea)
- Mandarin (China or Taiwan)

**Lower priority (smaller markets):**
- Arabic (Morocco, Egypt, UAE)
- Russian (Russia)
- Turkish (Turkey)

Each can reuse this recipe with cultural adaptations.

---

## Notes

- Keep language packs independent (no shared content except Magda concept)
- Visual style should reflect culture (French ≠ Mexican ≠ Japanese)
- Voice selection critical (native accent essential)
- Test with native speakers before launch
- Consider regional variants (France vs Quebec, Spain vs Mexico)
