import { Scene } from './types';

interface CreateTestSceneParams {
  characterId: string;
  place: string;
  city: string;
  goals?: string[];
}

/**
 * Creates a test scene for use by the test runner.
 * This will be replaced by the full `/api/scene` endpoint in M2.
 */
export function createTestScene(params: CreateTestSceneParams): Scene {
  const {
    characterId,
    place,
    city,
    goals = ['Start a conversation'],
  } = params;

  return {
    id: crypto.randomUUID(),
    place,
    city,
    characterId,
    timeOfDay: 'morning',
    setting: `A typical ${place.toLowerCase()} in ${city}`,
    goals,
    openingGuide: 'Greet the learner warmly and ask how they are doing',
    fallbackOpening: 'Buongiorno! Come stai?',
    wordsToRecycle: [],
  };
}
