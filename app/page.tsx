'use client';

import { useState } from 'react';
import { PlaceCard } from './components/PlaceCard';
import { ConversationScreen } from './components/ConversationScreen';
import { cities as cityPantries } from '@/content/it/cities';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get region from first neighbourhood for display
  const getRegion = (cityId: string) => {
    const regions: Record<string, string> = {
      roma: 'Lazio',
      firenze: 'Toscana',
      venezia: 'Veneto',
      milano: 'Lombardia',
      napoli: 'Campania',
      bologna: 'Emilia-Romagna',
      torino: 'Piemonte',
      palermo: 'Sicilia',
      genova: 'Liguria',
      siena: 'Toscana',
      lucca: 'Toscana',
      verona: 'Veneto',
      bergamo: 'Lombardia',
      mantova: 'Lombardia',
      matera: 'Basilicata',
      lecce: 'Puglia',
      orvieto: 'Umbria',
      assisi: 'Umbria',
      siracusa: 'Sicilia',
      taormina: 'Sicilia',
    };
    return regions[cityId] || '';
  };

  // Show conversation if place selected
  if (selectedPlace && selectedCity) {
    const cityData = cityPantries.find((c) => c.id === selectedCity);
    const place = cityData?.places.find((p) => p.id === selectedPlace);
    const character = cityData?.characters?.find((ch) => ch.id === place?.characterId);
    return (
      <ConversationScreen
        characterName={character?.name || ''}
        characterRole={character?.role}
        characterPortrait={character?.id ? `/images/portraits/${character.id}.jpg` : undefined}
        cityName={cityData?.name || ''}
        onBack={() => setSelectedPlace(null)}
      />
    );
  }

  // Show places if city selected
  if (selectedCity) {
    const cityData = cityPantries.find((c) => c.id === selectedCity);
    if (!cityData) return null;

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f1ed',
          padding: '20px',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '500',
            color: '#2c5f4f',
            margin: 0,
            marginBottom: '24px',
          }}
        >
          {cityData.name}
        </h1>

        {/* Scrolling place cards */}
        <div>
          {cityData.neighbourhoods.flatMap((neighbourhood) =>
            cityData.places
              .filter((place) => place.neighbourhood === neighbourhood)
              .map((place) => {
                const character = cityData.characters?.find((ch) => ch.id === place.characterId);
                return (
                  <PlaceCard
                    key={place.id}
                    placeName={place.name}
                    characterName={character?.name || ''}
                    neighborhood={place.neighbourhood}
                    imageUrl={`/images/places/${place.id}.jpg`}
                    onTap={() => setSelectedPlace(place.id)}
                  />
                );
              })
          )}
        </div>
      </div>
    );
  }

  // Show cities (entry screen)
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f1ed',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '500',
            color: '#2c5f4f',
            margin: 0,
          }}
        >
          Fuori
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: '1.5px solid #2c5f4f',
            borderRadius: '20px',
            cursor: 'pointer',
            color: '#2c5f4f',
            padding: '8px 14px',
          }}
        >
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
          <span style={{ fontSize: '15px', fontWeight: '600' }}>Settings</span>
        </button>
      </div>

      {/* City cards */}
      <div>
        {cityPantries.map((city) => (
          <PlaceCard
            key={city.id}
            placeName={city.name}
            characterName=""
            neighborhood={getRegion(city.id)}
            imageUrl={`/images/cities/${city.id}.jpg`}
            onTap={() => setSelectedCity(city.id)}
          />
        ))}
      </div>

      {/* Settings sheet overlay */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0 0 16px 16px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#2c5f4f',
                  margin: 0,
                }}
              >
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666',
                }}
              >
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

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '16px',
                  cursor: 'pointer',
                  accentColor: '#2c5f4f',
                }}
              />
              Show transcripts
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '32px',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '16px',
                  cursor: 'pointer',
                  accentColor: '#2c5f4f',
                }}
              />
              Allow dialect
            </label>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                backgroundColor: '#2c5f4f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
