// The floor prompt (docs/prompt-testing.md → New prompts; C2): only what the
// game can't work without, the game's own who-and-where line and the reply
// format. Used by the tests that build on it (C2, C3), set in memory with
// setPromptOverride; nothing on disk changes.
import { setPromptOverride } from '@/lib/prompts/template';

/** The floor (the card's text): the game's own first line, then the reply format */
export const FLOOR = `version: floor

## System prompt

\`\`\`
You are {name}, {role}, in {city}. You're at {setting} {character}

Reply with JSON: parts, in the order you say them. Each part is { kind, text, en, gloss }.
- english: what you say in English (en and gloss empty).
- word: something you say in {language}, with its English in en.
- question: your question in {language}, with its English in en.
- answer: something they could say back, in {language}, with its English in en; shown to them, not said by you.
- gloss: empty.
\`\`\`
`;
/** dialogue.md with its every-conversation rules emptied; its Heard blocks (data about what they said) stay */
export const noRules = (md: string) => md.replace(/(^## Every conversation\s*\n+```\n)[\s\S]*?(\n```)/m, '$1$2');


/** Put the floor in place of the Beginner prompt and dialogue.md's every-conversation rules, or (off) put them back */
export function useFloor(on: boolean): void {
  setPromptOverride('beginner.md', on ? () => FLOOR : null);
  setPromptOverride('dialogue.md', on ? noRules : null);
}
