/**
 * Simulated learners. Each one makes the kinds of mistakes real learners make,
 * including speech-to-text noise (Whisper mishearing non-native pronunciation),
 * and they say so when they don't understand (the runner tells them to be honest).
 */

import { language, country } from '@/content';

export interface Learner {
  id: string;
  description: string;
}

function buildLearnerDescription(id: string): string {
  const langName = language.name;
  const isSpanish = country === 'es-mx';

  switch (id) {
    case 'english-beginner':
      if (isSpanish) {
        return 'An American beginner (A1). Short, simple sentences. Typical mistakes: wrong article gender, English word order, mixing formal/informal (usted/tú). Some lines arrive garbled by speech-to-text.';
      }
      return 'An American beginner (A1). Short, simple sentences. Typical mistakes: "voglio" instead of "vorrei", wrong article gender ("il pizza"), English word order. Some lines arrive garbled by speech-to-text, e.g. "bone journal" for "buongiorno", "quando costa" for "quanto costa", "gratsie" for "grazie".';

    case 'hesitant':
      if (isSpanish) {
        return 'A nervous beginner (A1). Hesitates ("ehm... yo... "), sometimes says "repite por favor" or "más lento", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").';
      }
      return 'A nervous beginner (A1). Hesitates ("ehm... io... "), sometimes says "ripeti per favore" or "più lentamente", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").';

    case 'improving':
      if (isSpanish) {
        return `A learner around A2 who has been in Mexico a few weeks. Uses past tense and longer sentences with occasional errors. Curious and chatty; asks the character about themselves and the neighbourhood.`;
      }
      return 'A learner around A2 who has been in Italy a few weeks. Uses past tense and longer sentences with occasional errors ("sono andato al mercato ieri e ho comprato le pomodori"). Curious and chatty; asks the character about themselves and the neighbourhood.';

    default:
      return '';
  }
}

export const learners: Learner[] = [
  {
    id: 'english-beginner',
    description: buildLearnerDescription('english-beginner'),
  },
  {
    id: 'hesitant',
    description: buildLearnerDescription('hesitant'),
  },
  {
    id: 'improving',
    description: buildLearnerDescription('improving'),
  },
];
