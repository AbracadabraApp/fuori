/**
 * Simulated learners. Each one makes the kinds of mistakes real learners make,
 * including speech-to-text noise (Whisper mishearing accented Italian).
 */

export interface Learner {
  id: string;
  description: string;
}

export const learners: Learner[] = [
  {
    id: 'english-beginner',
    description:
      'An American beginner (A1). Short, simple sentences. Typical mistakes: "voglio" instead of "vorrei", wrong article gender ("il pizza"), English word order. Some lines arrive garbled by speech-to-text, e.g. "bone journal" for "buongiorno", "quando costa" for "quanto costa", "gratsie" for "grazie".',
  },
  {
    id: 'hesitant',
    description:
      'A nervous beginner (A1). Hesitates ("ehm... io... "), sometimes says "ripeti per favore" or "più lentamente", and once or twice gives up and asks in English ("sorry, what?" or "do you speak English?").',
  },
  {
    id: 'improving',
    description:
      'A learner around A2 who has been in Italy a few weeks. Uses past tense and longer sentences with occasional errors ("sono andato al mercato ieri e ho comprato le pomodori"). Curious and chatty; asks the character about themselves and the neighbourhood.',
  },
];
