// The fixed yes/no questions per item used by V2b (v2b-flag.mts, v2b-replay.mts).
/** V2's questions, unchanged, and the proposed item 9; "yes" means the problem is there */
export const QUESTIONS: Record<number, string> = {
  1: 'Would a learner at this level be unable to follow the parts of this reply in the language (words or grammar well beyond them)?',
  2: 'Does the reply state something false or invented about the place, the town, its food or the country?',
  3: 'Is the reply generic, with nothing of her place, town or country, at a turn where a local would naturally have said something of it?',
  4: 'Does she step out of her role or her job: offering or doing what her job or her place can\'t give, or talking like a language teacher?',
  5: 'Did the learner need help or ask for it (in English or the language), and the reply fails to give it?',
  6: 'Does the reply lecture, point out a mistake like a teacher, or offer answers to say back that a learner couldn\'t use (too long, two ideas, not what a local would say)?',
  8: 'Is the reply too long or too dense for a learner at this level to follow in one hearing?',
  9: 'Does the reply contain a grammar mistake in the language (agreement, articles, verb forms, prepositions) that a native speaker would notice? English glosses and [say back: …] count too, if they are in the language.',
};
