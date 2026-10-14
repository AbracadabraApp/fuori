'use client';

import { useState, useEffect } from 'react';
import { PlaceCard } from './components/PlaceCard';
import { ShowMore } from './components/ShowMore';
import { CityPicker } from './components/CityPicker';
import { language, cities as cityPantries, pack } from '@/content';
import { ConversationScreen } from './components/ConversationScreen';
import { characterForPlace } from '@/lib/characters/for-place';
import { feedOrder } from '@/lib/places/feed-order';
import { departureFor, type Departure } from '@/lib/travel/departure';
import { CharacterSheet } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  // City list: the first-screen cities, then the rest after "Mostra altro" (Josh, 2026-10-14)
  const [showAllCities, setShowAllCities] = useState(false);
  const [showTranscripts, setShowTranscripts] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [allowDialect, setAllowDialect] = useState(false);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [showCityPicker, setShowCityPicker] = useState(false);
  // Station: which station place was tapped, and the trip chosen on the
  // departures board (fixed when chosen, so the ticket and the clerk agree)
  const [stationPlace, setStationPlace] = useState<string | null>(null);
  const [trip, setTrip] = useState<({ to: string } & Departure) | null>(null);

  // Visit counts for the stamps: fetched on entering a city and again on
  // coming back from a place, so a stamp appears as soon as you leave
  useEffect(() => {
    if (selectedCity && !selectedPlace) {
      fetch(`/api/visits?city=${encodeURIComponent(selectedCity)}`)
        .then((res) => res.json())
        .then((data) => setVisitCounts(data))
        .catch((err) => console.error('Failed to fetch visit counts:', err));
    }
  }, [selectedCity, selectedPlace]);

  // Cities in the list: hidden ones stay in the data but aren't shown; "more"
  // ones wait behind "Mostra altro"
  const shownCities = cityPantries.filter((c) => !c.hidden);
  const listedCities = showAllCities ? shownCities : shownCities.filter((c) => !c.more);

  // Region (or state) shown under the city name, from the city's data
  const getRegion = (cityId: string) => cityPantries.find((c) => c.id === cityId)?.region ?? '';

  // Show conversation if place selected
  if (selectedPlace && selectedCity) {
    const cityData = cityPantries.find((c) => c.id === selectedCity);
    const place = cityData?.places.find((p) => p.id === selectedPlace);

    // Anchors (Giulia, Rita) or the city file's character for this place
    let characterSheet: CharacterSheet | undefined =
      cityData && place ? characterForPlace(cityData, place) : undefined;

    // At the station with a trip chosen: the ticket seller knows where you're going
    const destination = trip ? cityPantries.find((c) => c.id === trip.to) : undefined;
    if (characterSheet && trip && destination) {
      characterSheet = {
        ...characterSheet,
        appearance: {
          ...characterSheet.appearance,
          setting: `${characterSheet.appearance?.setting ?? ''}. The person is buying a ticket to ${destination.name}; the next departure leaves at ${trip.time} from platform ${trip.platform}.`,
        },
      } as CharacterSheet;
    }

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
        neighbourhood={place?.neighbourhood}
        onBack={() => {
          setSelectedPlace(null);
          setTrip(null);
        }}
        ticket={
          trip && destination && cityData
            ? {
                from: cityData.name,
                to: destination.name,
                platform: trip.platform,
                time: trip.time,
                // Board: arrive at the destination's city screen (the conversation
                // screen saves on the way out, like the back link)
                onBoard: () => {
                  setSelectedPlace(null);
                  setTrip(null);
                  setSelectedCity(destination.id);
                },
              }
            : undefined
        }
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
        {/* Back to the city list, styled like the person screen's back link */}
        <button type="button" onClick={() => setSelectedCity(null)} className={styles.backLink}>
          <span className={styles.backArrow} aria-hidden="true">←</span>
          <span>{language.appName}</span>
        </button>
        <h1 className={styles.cityTitle}>{cityData.name}</h1>

        {/* Scrolling place cards */}
        <div>
          {(() => {
            // Mixed across neighbourhoods and kinds (lib/places/feed-order.ts)
            const ordered = feedOrder({ ...cityData, places: cityData.places.filter((p) => !p.hidden) });
            return (
              <>
                {ordered.map((place) => {
                  const character = cityData.characters?.find((ch) => ch.id === place.characterId);
                  return (
                    <PlaceCard
                      key={place.id}
                      placeId={place.id}
                      placeName={place.name}
                      characterName={character?.name || ''}
                      neighborhood={place.neighbourhood}
                      imageUrl={`${pack.images}/places/${place.id}.jpg`}
                      visitCount={visitCounts[place.id] || 0}
                      onTap={() => {
                        // Station: departures board first; picking a city opens the
                        // ticket seller with your ticket (docs/station-feature-decision.md)
                        if (place.id.startsWith('stazione-') || place.id.startsWith('terminal-')) {
                          setStationPlace(place.id);
                          setShowCityPicker(true);
                        } else {
                          setSelectedPlace(place.id);
                        }
                      }}
                    />
                  );
                })}
              </>
            );
          })()}
        </div>
        {/* Departures board, opened by tapping the station */}
        {showCityPicker && selectedCity && (
          <CityPicker
            currentCityId={selectedCity}
            onSelectCity={(cityId) => {
              // Your ticket: departure fixed now; then the ticket seller's screen
              setTrip({ to: cityId, ...departureFor(selectedCity, cityId) });
              setSelectedPlace(stationPlace);
              setShowCityPicker(false);
            }}
            onClose={() => {
              // Cancelled - stay in current city
              setShowCityPicker(false);
              setStationPlace(null);
            }}
          />
        )}
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
        {listedCities.map((city) => (
          <PlaceCard
            key={city.id}
            placeId={city.id}
            placeName={city.name}
            characterName=""
            neighborhood={getRegion(city.id)}
            imageUrl={`${pack.images}/cities/${city.id}.jpg`}
            visitCount={0} // Cities don't show stamps
            onTap={() => {
              setSelectedCity(city.id);
            }}
          />
        ))}
      </div>
      {listedCities.length < shownCities.length && (
        <ShowMore label={language.ui.showMore} onClick={() => setShowAllCities(true)} />
      )}

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
