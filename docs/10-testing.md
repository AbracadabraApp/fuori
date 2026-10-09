# Testing Strategy

Testing a voice-first language game means validating not just code, but conversation quality, language accuracy, and the learner experience. This document covers automated tests, manual test protocols, and quality checks.

**For a one-person prototype, what matters now is section 4 (level rules and the simulated learner) and testing on your phone (section 9).** The rest is reference for later milestones.

## Testing Layers

```
1. Unit tests (code correctness)
2. Integration tests (API flows)
3. Conversation tests (Claude behavior)
4. Language validation (level rules + simulated learner)
5. User testing (real learners)
```

## 1. Unit Tests

Standard Jest/Vitest tests for pure functions and utilities.

### What to test:

**Prompt builder:**
```typescript
// lib/prompt-builder.test.ts
describe('buildPrompt', () => {
  it('constructs correct layer order for caching', () => {
    const prompt = buildPrompt({ character, scene, transcript });
    expect(prompt).toContain('House rules');
    expect(prompt).toContain('Character sheet');
    expect(prompt.indexOf('House rules')).toBeLessThan(
      prompt.indexOf('Transcript')
    );
  });

  it('includes relationship memory when available', () => {
    const memory = { facts: ['Name is Josh', 'From Chicago'] };
    const prompt = buildPrompt({ character, scene, transcript, memory });
    expect(prompt).toContain('Josh');
    expect(prompt).toContain('Chicago');
  });

  it('marks cache breakpoints correctly', () => {
    // Test cache control annotations
  });
});
```

**State management:**
```typescript
// lib/state.test.ts
describe('updateJourneyState', () => {
  it('marks scene as completed', () => {
    const state = updateJourneyState(current, 'roma-bar-day1');
    expect(state.completedScenes).toContain('roma-bar-day1');
  });

  it('advances day when all today scenes are done', () => {
    // Complete all day 1 scenes
    const state = completeAllTodayScenes(initial);
    expect(state.currentDay).toBe(2);
  });
});
```

**Word/mistake tracking:**
```typescript
// lib/quaderno.test.ts
describe('addWord', () => {
  it('adds new word with firstSeen date', () => {
    const words = addWord([], 'vorrei', 'I would like', 'scene-1');
    expect(words[0].timesUsed).toBe(1);
    expect(words[0].firstSeen).toBeTruthy();
  });

  it('increments count for existing word', () => {
    const existing = [{ it: 'vorrei', timesUsed: 1, /* ... */ }];
    const words = addWord(existing, 'vorrei', 'I would like', 'scene-2');
    expect(words[0].timesUsed).toBe(2);
  });

  it('updates lastUsed date', () => {
    const before = new Date('2024-01-01');
    const existing = [{ it: 'vorrei', lastUsed: before, /* ... */ }];
    const words = addWord(existing, 'vorrei', 'I would like', 'scene-2');
    expect(words[0].lastUsed).not.toEqual(before);
  });
});
```

**Schema validation:**
```typescript
// lib/schemas.test.ts
describe('TurnOutputSchema', () => {
  it('accepts valid turn output', () => {
    const valid = {
      understood: 'buongiorno',
      it: 'Buongiorno! Come stai?',
      en: 'Good morning! How are you?',
      correction: null,
      words: [],
      steps_done: [0],
      hint: null,
      confused: false,
      mood: 'warm',
      scene_over: false,
      memory_notes: [],
    };
    expect(() => TurnOutputSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid mood', () => {
    const invalid = { /* ... */, mood: 'angry' };
    expect(() => TurnOutputSchema.parse(invalid)).toThrow();
  });

  it('limits words array to 2 items', () => {
    const tooMany = { /* ... */, words: [{}, {}, {}] };
    expect(() => TurnOutputSchema.parse(tooMany)).toThrow();
  });
});
```

### Test coverage targets:

- Prompt building: 100%
- State updates: 100%
- Data transformations: 100%
- Schema validation: 100%
- API route handlers: 80%+

## 2. Integration Tests

Test full API flows with mocked external services.

### API route tests:

**`/api/turn` with mocked Claude:**
```typescript
// app/api/turn/route.test.ts
describe('POST /api/turn', () => {
  beforeEach(() => {
    mockClaudeResponse({
      understood: 'vorrei un cappuccino',
      it: 'Un cappuccino, certo! Subito.',
      // ... rest of valid turn output
    });
  });

  it('returns valid turn output', async () => {
    const response = await POST(mockRequest({
      transcript: 'vorrei un cappuccino',
      sceneId: 'roma-bar-day1',
      learnerId: 'test-123',
    }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.it).toBeTruthy();
    expect(TurnOutputSchema.parse(data)).toBeTruthy();
  });

  it('handles Claude API errors gracefully', async () => {
    mockClaudeError(new Error('Rate limit'));
    const response = await POST(mockRequest({ /* ... */ }));
    expect(response.status).toBe(429);
  });

  it('updates relationship memory', async () => {
    await POST(mockRequest({
      transcript: 'mi chiamo Josh',
      // ...
    }));
    const relationship = getRelationship('test-123', 'giulia');
    expect(relationship.memory.facts).toContain('Name is Josh');
  });
});
```

**`/api/transcribe` with mocked Whisper:**
```typescript
// app/api/transcribe/route.test.ts
describe('POST /api/transcribe', () => {
  it('transcribes Italian audio', async () => {
    mockWhisperResponse('buongiorno');
    const audioBlob = createMockAudioBlob();

    const response = await POST(mockRequest({ audio: audioBlob }));
    const data = await response.json();

    expect(data.text).toBe('buongiorno');
  });

  it('enforces Italian language', async () => {
    const call = getWhisperApiCall();
    expect(call.params.language).toBe('it');
  });

  it('handles timeout errors', async () => {
    mockWhisperTimeout();
    const response = await POST(mockRequest({ /* ... */ }));
    expect(response.status).toBe(504);
  });
});
```

### Test database:

For M4 when Postgres is added:
- Use a test database (not production)
- Reset between tests
- Seed with fixture data
- Test migrations

## 3. Conversation Tests (Regression Suite)

The most important tests: does Claude behave correctly in Italian conversations?

### Golden conversations:

Store expected behavior for common scenarios as test cases.

**Test case format:**
```typescript
// tests/conversations/giulia-day1-order.json
{
  "name": "Giulia Day 1: Simple order",
  "character": "giulia",
  "scene": "roma-bar-day1",
  "turns": [
    {
      "learner_says": "buongiorno",
      "expected": {
        "understood": "buongiorno",
        "it_contains": ["Buongiorno", "cosa"],
        "confused": false,
        "correction": null
      }
    },
    {
      "learner_says": "vorrei un cappuccino",
      "expected": {
        "understood": "vorrei un cappuccino",
        "it_contains": ["cappuccino", "certo"],
        "steps_done": [0],
        "confused": false
      }
    }
  ]
}
```

**Test runner:**
```typescript
// tests/conversation-runner.ts
describe('Conversation regression tests', () => {
  const testCases = loadConversationTests();

  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      let transcript = [];

      for (const turn of testCase.turns) {
        const response = await callTurnAPI({
          transcript,
          learnerSays: turn.learner_says,
          character: testCase.character,
          scene: testCase.scene,
        });

        // Check expected behaviors
        expect(response.understood).toBe(turn.expected.understood);
        expect(response.confused).toBe(turn.expected.confused);

        if (turn.expected.it_contains) {
          turn.expected.it_contains.forEach((phrase) => {
            expect(response.it.toLowerCase()).toContain(phrase.toLowerCase());
          });
        }

        if (turn.expected.correction !== undefined) {
          expect(response.correction).toBe(turn.expected.correction);
        }

        transcript.push({ who: 'learner', it: turn.learner_says });
        transcript.push({ who: 'npc', it: response.it });
      }
    });
  });
});
```

### Priority test scenarios:

**Forgiveness:**
- [ ] "bone journal" → reconstructs as "buongiorno", no correction
- [ ] "vorrei un cornetta" → reconstructs as "cornetto", no correction
- [ ] "quando costa" → reconstructs as "quanto costa", no correction
- [ ] English-sounding gibberish → reconstructs Italian phonetically

**Corrections:**
- [ ] "voglio un cappuccino" → corrected to "vorrei" naturally
- [ ] "la cappuccino" → corrected to "il cappuccino" naturally
- [ ] "io sono fame" → corrected to "ho fame" naturally
- [ ] Gender errors caught and recast in character

**Staying in character:**
- [ ] Character never switches to English unprompted
- [ ] Character speaks appropriate to role (Giulia quick, Rita slow)
- [ ] Character uses regional expressions correctly
- [ ] Character maintains personality across turns

**Help and scaffolding:**
- [ ] `hint: null` for successful exchanges
- [ ] `confused: false` for normal conversation
- [ ] `confused: true` only when truly incomprehensible
- [ ] Natural help offered in character

**Goal tracking:**
- [ ] Steps tick only when actually completed
- [ ] Steps remain cumulative across turns
- [ ] Scene ends when all steps done

**Memory:**
- [ ] Character remembers learner's name across scenes
- [ ] Character recalls previous orders
- [ ] Familiarity increases appropriately

### Running conversation tests:

```bash
# Run all conversation tests (uses real Claude API)
npm run test:conversations

# Run specific test
npm run test:conversations -- giulia-day1

# Record new golden test
npm run test:conversations:record -- new-scenario
```

**Cost control:**
- Conversation tests use real API, so they cost money
- Run full suite before releases
- Run affected tests on prompt changes
- Cache results when prompt/character hasn't changed

## 4. Language Validation (automated)

The creator is an A1–A2 learner, so Italian quality can't depend on anyone's personal judgement. Two automated pieces replace manual review:

### 4a. Level rules from published standards

A single rules file, `content/it/levels/a1-a2.ts`, built once by Claude from public sources:

- **CEFR descriptors** for A1 and A2 (the official "can-do" statements: ordering, asking prices, talking about yourself)
- **A frequency word list**: De Mauro's *Nuovo vocabolario di base* (the standard list of the most common Italian words), trimmed to the most frequent bands for A1–A2
- **Typical A1–A2 grammar coverage**: which tenses and structures are in scope (present, *passato prossimo*, articles, *vorrei*) and which are out (subjunctive, conditional beyond *vorrei*/*potrei*, *passato remoto*)

Use frameworks and word lists, not copied textbook pages.

```typescript
// content/it/levels/a1-a2.ts
export interface LevelRules {
  id: 'A1' | 'A2';
  canDo: string[];             // CEFR can-do statements, summarised
  maxWordsPerSentence: number;
  maxSentencesPerTurn: number;
  newWordsPerTurn: number;     // words allowed outside the vocabulary list
  tensesAllowed: string[];
  tensesAvoid: string[];
  vocabulary: string[];        // lemmas, from the frequency list
}
```

The rules feed two places: the house-rules layer of every character prompt ([Conversation engine](04-conversation-engine.md)), and the judge rubric below.

### 4b. Simulated learner

A script (`npm run test:learner`) where Claude plays a beginner and another Claude call judges the result.

1. **Learner personas**: e.g. "A1, English speaker, uses *voglio* instead of *vorrei*, mixes up article genders, sometimes answers in English". Each persona also adds transcription noise ("bone journal", "quando costa").
2. **Run**: each persona plays each scene against the real `/api/turn` prompts, about 20 conversations per run.
3. **Judge**: a separate call scores every conversation against the level rules and the [priority scenarios](#priority-test-scenarios) above:
   - Stayed within the level (length, tenses, vocabulary)
   - Recast real mistakes; ignored transcription noise
   - Stayed in Italian and in character (*tu*/*Lei* as the sheet says)
   - Scene goals ticked correctly; `confused` and `hint` used sparingly
4. **Report**: a score per criterion and per character, with the worst examples quoted, saved to `tests/reports/<date>.md`.

Run it whenever prompts or character sheets change, and compare against the previous report. It costs a little per run (real API calls), so run it on changes, not on every commit.

Not independent of Claude, but it is systematic and repeatable, which manual review by a beginner can't be. A native speaker reading a few transcripts later remains a nice-to-have, never a gate.

## 5. User Testing

Real learners trying the game.

### M1 user test protocol:

Recruit 3-5 people learning Italian (A1-A2 level):

**Setup:**
1. Don't explain how it works - see if UI is intuitive
2. Ask them to complete 2 scenes
3. Observe but don't interrupt
4. Record audio and screen

**Questions after:**
- Could you understand what the characters were saying?
- Did the voice recognition work for you?
- When did you feel stuck?
- Did you notice when characters corrected you?
- Would you want to keep playing?
- What was frustrating?
- What was delightful?

**Metrics to track:**
- Scene completion rate
- Time per scene
- Number of turns per scene
- Where users get stuck (which step)
- How often they use "Come si dice?"
- How often hints appear
- Transcription accuracy (compare Whisper output to what they meant)

### M2 user test protocol:

Focus on multi-day experience:

- Can they complete 3 days in Roma?
- Do they notice characters remembering them?
- Do they look forward to seeing characters again?
- Does the diario help?
- Are mistakes actually decreasing?

## 6. Performance Testing

### Response time targets:

| Endpoint | Target | Max Acceptable |
|----------|--------|----------------|
| `/api/transcribe` | <1s | <2s |
| `/api/turn` (first word) | <1.5s | <3s |
| `/api/turn` (complete) | <2s | <4s |
| `/api/diario` | <3s | <6s |

**Test with:**
```bash
# Use Artillery or similar
artillery quick --count 10 --num 5 https://fuori.vercel.app/api/turn
```

### Load testing:

Before inviting other players:
- Simulate 10 concurrent learners
- Measure API costs at scale
- Check rate limits
- Verify caching works

## 7. Accessibility Testing

### Checklist:

- [ ] Screen reader can navigate conversation log
- [ ] All buttons have proper labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works (no voice)
- [ ] Touch targets are 44px minimum
- [ ] Motion can be reduced (prefers-reduced-motion)
- [ ] Works in high contrast mode
- [ ] Text can be resized

**Tools:**
- axe DevTools
- Lighthouse accessibility audit
- Manual keyboard navigation
- VoiceOver (iOS) / TalkBack (Android)

## 8. Device Testing

### Minimum supported:

- iPhone Safari (iOS 15+)
- Mac Safari (macOS 12+)
- Chrome (desktop, latest)
- Chrome (Android, latest)

### Test matrix:

| Device | Browser | Mic | TTS | Notes |
|--------|---------|-----|-----|-------|
| iPhone 13 | Safari | ✓ | ✓ | Primary target |
| iPad | Safari | ✓ | ✓ | |
| MacBook | Safari | ✓ | ✓ | |
| MacBook | Chrome | ✓ | ✓ | |
| Pixel | Chrome | ✓ | ? | Test Android TTS quality |
| Windows | Chrome | ✓ | ? | Lower priority |

## 9. Mobile Testing (Critical)

Fuori is **mobile-first**. The primary experience is voice conversations on a phone. Desktop is secondary.

### Mobile testing workflow

**Standard cycle (fast iteration):**

```bash
# 1. Make changes on laptop
git add .
git commit -m "Test Giulia dialogue improvements"

# 2. Deploy to Railway (30 seconds)
git push origin main

# 3. Test on phone
# Open fuori.railway.app in Safari
# Run through conversation
# Check for issues

# 4. Debug if needed (see below)
```

**Feature branch testing (for bigger changes):**

```bash
# 1. Create feature branch
git checkout -b feature/come-si-dice-button

# 2. Push to GitHub
git push origin feature/come-si-dice-button

# 3. Railway auto-creates preview deploy
# fuori-pr-123.railway.app

# 4. Test on phone
# 5. Merge when working
```

### Remote debugging

**iOS Safari (primary target):**

Setup (one time):
```
iPhone:
1. Settings → Safari → Advanced
2. Enable "Web Inspector"
3. Connect iPhone to Mac via USB

Mac:
1. Open Safari
2. Develop menu → [Your iPhone] → fuori.railway.app
3. See console logs, network, DOM inspector
```

**Chrome Android (secondary):**

Setup (one time):
```
Android phone:
1. Settings → Developer Options → USB Debugging (enable)
2. Connect to laptop via USB

Laptop:
1. Open Chrome
2. Navigate to chrome://inspect
3. Find your phone under "Remote Target"
4. Click "inspect" on fuori.railway.app tab
```

### Mobile-specific test checklist

Run this checklist on **iPhone Safari** before considering M1 complete:

**Voice input:**
- [ ] Mic button shows iOS permission prompt on first tap
- [ ] Permission prompt is clear (explains why mic is needed)
- [ ] Mic activates after permission granted
- [ ] Recording indicator appears (red dot or animation)
- [ ] Can see interim transcription (loading state)
- [ ] Whisper returns Italian text (not English gibberish)
- [ ] Text appears in input field
- [ ] Can edit transcribed text before sending
- [ ] Send button submits the conversation turn

**Voice output:**
- [ ] Character response plays immediately (<2s latency)
- [ ] TTS doesn't cut off mid-sentence
- [ ] Can replay any message with "Ascolta" button
- [ ] Slow mode works (Piano button)
- [ ] Audio continues when screen locks
- [ ] Volume controls work

**Touch interactions:**
- [ ] Mic button is easy to tap (44px minimum)
- [ ] "Come si dice?" button is easy to tap
- [ ] Scene picker cards are easy to tap
- [ ] All buttons have visual feedback on tap
- [ ] No accidental taps on small targets
- [ ] Scrolling conversation log is smooth
- [ ] Can scroll while TTS is playing

**Layout & orientation:**
- [ ] Portrait layout looks good (primary)
- [ ] Landscape layout works (secondary)
- [ ] Keyboard doesn't cover input when typing
- [ ] Safe area respected (notch, home indicator)
- [ ] Content reflows on orientation change

**Network conditions:**
- [ ] Works on WiFi
- [ ] Works on cellular (4G/5G)
- [ ] Shows clear error on network timeout
- [ ] Can retry after network error
- [ ] Offline message is helpful

**Interruptions:**
- [ ] Handles phone call interruption
- [ ] Resumes after phone unlocked
- [ ] Handles app switching (to/from Messages)
- [ ] State persists on page reload
- [ ] localStorage survives app restart

**Error states:**
- [ ] Clear message if mic blocked
- [ ] Can fall back to text input
- [ ] Whisper timeout handled gracefully
- [ ] Claude API error shows helpful message
- [ ] Rate limit error explains wait time

### Mobile logging for debugging

Add to components that handle voice:

```typescript
// lib/mobile-logger.ts
interface MobileLog {
  event: string;
  timestamp: string;
  userAgent: string;
  [key: string]: any;
}

export function logMobile(event: string, data: Record<string, any> = {}) {
  const log: MobileLog = {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...data,
  };

  // Always log to console (visible in remote debugging)
  console.log('[MOBILE]', log);

  // Send critical events to server for Railway logs
  if (
    event.includes('error') ||
    event.includes('failed') ||
    event.includes('timeout')
  ) {
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    }).catch(() => {
      // Don't let logging errors break the app
    });
  }
}

// Usage in conversation component:
logMobile('mic-permission-requested');
logMobile('mic-permission-granted');
logMobile('recording-started');
logMobile('recording-stopped', { duration: Date.now() - startTime });
logMobile('whisper-request-sent', { audioDuration });
logMobile('whisper-response', { text, latency });
logMobile('whisper-error', { error: error.message, duration });
logMobile('turn-complete', { sceneId, stepsDone });
```

**Viewing logs:**

```bash
# On laptop, watch Railway logs while testing on phone
railway logs --follow

# Look for [MOBILE] events
# See errors from phone in real-time
```

### Mobile performance testing

**Target metrics:**
- Mic to transcription: <2s
- Transcription to Claude response (first word): <1.5s
- TTS playback starts: <500ms
- Touch response time: <100ms
- Scroll frame rate: 60fps

**Test with slow 3G:**

Chrome DevTools (remote debugging):
```
1. Connect phone via chrome://inspect
2. Network tab → Throttling → Slow 3G
3. Test conversation flow
4. Verify loading states appear
5. Verify timeouts are reasonable
```

**Test tools:**
```typescript
// Add performance marks for key events
performance.mark('mic-start');
// ... record audio
performance.mark('mic-end');
performance.measure('recording-duration', 'mic-start', 'mic-end');

// Log to see timing
const measures = performance.getEntriesByType('measure');
logMobile('performance', {
  measures: measures.map((m) => ({
    name: m.name,
    duration: m.duration,
  })),
});
```

### Common mobile issues & fixes

**Issue: Mic permission denied**
- Check: Does Railway deploy have HTTPS? (required)
- Check: Is user on iOS Private Browsing? (mic blocked)
- Fix: Show clear message, offer text input fallback

**Issue: Audio plays but cuts off**
- Check: Is TTS response too long for speechSynthesis?
- Check: Does phone lock during playback?
- Fix: Chunk long responses, request wake lock

**Issue: Transcription comes back in English**
- Check: Is Whisper language set to 'it'?
- Check: Is user speaking clearly enough?
- Fix: Already solved by using Whisper instead of browser STT

**Issue: Layout breaks on small screens**
- Check: Are you testing on actual phone? (not just browser DevTools)
- Check: Safe areas for notch/home indicator?
- Fix: Use viewport units, test on real device

**Issue: Touch targets too small**
- Check: Are buttons <44px?
- Fix: Increase size, add padding, test with thumb

### Recording test sessions

For user testing, record screen + audio:

**iOS:**
```
1. Control Center → Screen Recording
2. Long-press recording button → Microphone On
3. Start conversation
4. Stop recording, save to Photos
5. AirDrop to Mac for review
```

**Analysis:**
- Watch for user confusion points
- Note where they tap wrong things
- Measure time to complete scenes
- Identify unclear UI elements

## Test Commands

```json
// package.json scripts
{
  "test": "vitest",
  "test:unit": "vitest run",
  "test:integration": "vitest run tests/integration",
  "test:conversations": "node tests/run-conversation-tests.js",
  "test:conversations:record": "node tests/record-conversation.js",
  "test:e2e": "playwright test",
  "test:accessibility": "pa11y-ci"
}
```

## When to Run Tests

**On every commit:**
- Unit tests
- Schema validation

**On PR:**
- Integration tests
- Key conversation tests (subset)

**Before release:**
- Full conversation test suite
- Language validation review
- User testing
- Device testing
- Performance testing
- Accessibility audit

**Weekly:**
- Random conversation sampling
- Cost analysis
- Error rate monitoring

## Test Data Management

### Fixtures:

Store in `tests/fixtures/`:
- `learner-profiles.json` - Sample learners
- `character-sheets.json` - Test characters
- `conversations.json` - Sample transcripts
- `relationships.json` - Memory states

### Factory functions:

```typescript
// tests/factories.ts
export function createLearner(overrides = {}) {
  return {
    id: 'test-learner-1',
    name: 'Test User',
    level: 'A1',
    ...overrides,
  };
}

export function createTurn(overrides = {}) {
  return {
    who: 'npc',
    transcript: 'Buongiorno!',
    translation: 'Good morning!',
    ...overrides,
  };
}
```

## Monitoring in Production

Once live, track:

**Error rates:**
- Whisper failures
- Claude API errors
- Timeout frequency
- Client-side errors

**Quality metrics:**
- Average transcription confidence
- Correction frequency per scene
- Scene completion rates
- User drop-off points

**Cost metrics:**
- API spend per learner per day
- Cache hit rates
- TTS generation vs cache serving

**User metrics:**
- Daily active users
- Scenes completed per session
- Retention (day 1, 3, 7)
- Which scenes are hardest (lowest completion)

Set up alerts:
- Error rate >5%
- API cost >$2/user/day
- Response time >5s
- Cache hit rate <70%
