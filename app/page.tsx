'use client';

import { useState } from 'react';
import { PlaceCard } from './components/PlaceCard';
import { ShowMore } from './components/ShowMore';
import { language, cities as cityPantries, pack } from '@/content';
import { ConversationScreen } from './components/ConversationScreen';
import { characterForPlace } from '@/lib/characters/for-place';
import { feedOrder } from '@/lib/places/feed-order';
import { CharacterSheet } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscripts, setShowTranscripts] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [allowDialect, setAllowDialect] = useState(false);

  // Feeds show 10 cards at a time; "show more" adds the next 10 below
  const PAGE = 10;
  const [cityCount, setCityCount] = useState(PAGE);
  const [placeCount, setPlaceCount] = useState(PAGE);

  // Cities in the list: hidden ones stay in the data but aren't shown
  const shownCities = cityPantries.filter((c) => !c.hidden);

  // Region (or state) shown under the city name, from the city's data
  const getRegion = (cityId: string) => cityPantries.find((c) => c.id === cityId)?.region ?? '';

  // Show conversation if place selected
  if (selectedPlace && selectedCity) {
    const cityData = cityPantries.find((c) => c.id === selectedCity);
    const place = cityData?.places.find((p) => p.id === selectedPlace);

    // Anchors (Giulia, Rita) or the city file's character for this place
    const characterSheet: CharacterSheet | undefined =
      cityData && place ? characterForPlace(cityData, place) : undefined;

    if (!characterSheet) {
      return (
        <div className={styles.screen}>
          <div onClick={() => setSelectedPlace(null)} className={styles.back}>
            ← {cityData?.name}
          </div>
          <p className={styles.emptyNote}>{place?.name}: nobody to talk to here yet.</p>
        </div>
      );
    }

    return (
      <ConversationScreen
        character={characterSheet}
        characterPortrait={`${pack.images}/portraits/${characterSheet.id}.jpg`}
        cityName={cityData?.name || ''}
        cityId={cityData?.id}
        onBack={() => setSelectedPlace(null)}
        showTranscripts={showTranscripts}
        showEnglish={showEnglish}
        allowDialect={allowDialect}
      />
    );
  }

  // Show places if city selected
  if (selectedCity) {
    const cityData = cityPantries.find((c) => c.id === selectedCity);
    if (!cityData) return null;

    return (
      <div className={styles.screen}>
        <h1 className={styles.cityTitle}>{cityData.name}</h1>

        {/* Scrolling place cards */}
        <div>
          {(() => {
            // Mixed across neighbourhoods and kinds (lib/places/feed-order.ts)
            const ordered = feedOrder({ ...cityData, places: cityData.places.filter((p) => !p.hidden) });
            return (
              <>
                {ordered.slice(0, placeCount).map((place) => {
                  const character = cityData.characters?.find((ch) => ch.id === place.characterId);
                  return (
                    <PlaceCard
                      key={place.id}
                      placeName={place.name}
                      characterName={character?.name || ''}
                      neighborhood={place.neighbourhood}
                      imageUrl={`${pack.images}/places/${place.id}.jpg`}
                      onTap={() => setSelectedPlace(place.id)}
                    />
                  );
                })}
                {placeCount < ordered.length && (
                  <ShowMore label={language.ui.showMore} onClick={() => setPlaceCount((n) => n + PAGE)} />
                )}
              </>
            );
          })()}
        </div>
      </div>
    );
  }

  // Show cities (entry screen)
  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>{language.appName}</h1>
        <button onClick={() => setShowSettings(true)} className={styles.settingsButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
          </svg>
          <span>Settings</span>
        </button>
      </div>

      {/* City cards */}
      <div>
        {shownCities.slice(0, cityCount).map((city) => (
          <PlaceCard
            key={city.id}
            placeName={city.name}
            characterName=""
            neighborhood={getRegion(city.id)}
            imageUrl={`${pack.images}/cities/${city.id}.jpg`}
            onTap={() => {
              setSelectedCity(city.id);
              setPlaceCount(PAGE); // each city starts with its first 10 places
            }}
          />
        ))}
        {cityCount < shownCities.length && (
          <ShowMore label={language.ui.showMore} onClick={() => setCityCount((n) => n + PAGE)} />
        )}
      </div>

      {/* Settings sheet overlay */}
      {showSettings && (
        <div className={styles.overlay} onClick={() => setShowSettings(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h2 className={styles.sheetTitle}>Settings</h2>
              <button onClick={() => setShowSettings(false)} className={styles.close}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label className={styles.option}>
              <input
                type="checkbox"
                checked={showTranscripts}
                onChange={(e) => setShowTranscripts(e.target.checked)}
              />
              Show {language.name} transcripts
            </label>

            <label className={styles.option}>
              <input
                type="checkbox"
                checked={showEnglish}
                onChange={(e) => setShowEnglish(e.target.checked)}
              />
              Show English translation
            </label>

            <label className={styles.optionDisabled}>
              <input
                type="checkbox"
                checked={allowDialect}
                onChange={(e) => setAllowDialect(e.target.checked)}
                disabled={true}
              />
              Allow dialect (coming soon)
            </label>

            <button onClick={() => setShowSettings(false)} className={styles.primaryButton}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
