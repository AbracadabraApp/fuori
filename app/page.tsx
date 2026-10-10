'use client';

import { useState } from 'react';
import { PlaceCard } from './components/PlaceCard';
import { ConversationScreen } from './components/ConversationScreen';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const cities = [
    // Big cities
    { id: 'roma', name: 'Roma', region: 'Lazio', image: '/images/cities/roma.jpg' },
    { id: 'firenze', name: 'Firenze', region: 'Toscana', image: '/images/cities/firenze.jpg' },
    { id: 'venezia', name: 'Venezia', region: 'Veneto', image: '/images/cities/venezia.jpg' },
    { id: 'milano', name: 'Milano', region: 'Lombardia', image: '/images/cities/milano.jpg' },
    { id: 'napoli', name: 'Napoli', region: 'Campania', image: '/images/cities/napoli.jpg' },
    { id: 'bologna', name: 'Bologna', region: 'Emilia-Romagna', image: '/images/cities/bologna.jpg' },
    { id: 'torino', name: 'Torino', region: 'Piemonte', image: '/images/cities/torino.jpg' },
    { id: 'palermo', name: 'Palermo', region: 'Sicilia', image: '/images/cities/palermo.jpg' },
    { id: 'genova', name: 'Genova', region: 'Liguria', image: '/images/cities/genova.jpg' },

    // Smaller cities and towns
    { id: 'siena', name: 'Siena', region: 'Toscana', image: '/images/cities/siena.jpg' },
    { id: 'lucca', name: 'Lucca', region: 'Toscana', image: '/images/cities/lucca.jpg' },
    { id: 'verona', name: 'Verona', region: 'Veneto', image: '/images/cities/verona.jpg' },
    { id: 'bergamo', name: 'Bergamo', region: 'Lombardia', image: '/images/cities/bergamo.jpg' },
    { id: 'mantova', name: 'Mantova', region: 'Lombardia', image: '/images/cities/mantova.jpg' },
    { id: 'matera', name: 'Matera', region: 'Basilicata', image: '/images/cities/matera.jpg' },
    { id: 'lecce', name: 'Lecce', region: 'Puglia', image: '/images/cities/lecce.jpg' },
    { id: 'orvieto', name: 'Orvieto', region: 'Umbria', image: '/images/cities/orvieto.jpg' },
    { id: 'assisi', name: 'Assisi', region: 'Umbria', image: '/images/cities/assisi.jpg' },
    { id: 'siracusa', name: 'Siracusa', region: 'Sicilia', image: '/images/cities/siracusa.jpg' },
    { id: 'taormina', name: 'Taormina', region: 'Sicilia', image: '/images/cities/taormina.jpg' },
  ];

  // Places in selected city (mock for now)
  const places = {
    roma: [
      {
        id: 'bar-giulia',
        placeName: 'Il bar di Giulia',
        characterName: 'Giulia',
        neighborhood: 'Trastevere',
      },
      {
        id: 'mercato',
        placeName: 'Mercato di San Cosimato',
        characterName: 'Enzo',
        neighborhood: 'Trastevere',
      },
      {
        id: 'colosseo',
        placeName: 'Colosseo',
        characterName: '',
        neighborhood: 'Centro Storico',
      },
    ],
  } as Record<string, typeof places.roma>;

  // Show conversation if place selected
  if (selectedPlace && selectedCity) {
    const cityPlaces = places[selectedCity] || [];
    const place = cityPlaces.find((p) => p.id === selectedPlace);
    return (
      <ConversationScreen
        characterName={place?.characterName || ''}
        onBack={() => setSelectedPlace(null)}
      />
    );
  }

  // Show places if city selected
  if (selectedCity) {
    const cityPlaces = places[selectedCity] || [];
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
            {cities.find((c) => c.id === selectedCity)?.name}
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

        {/* Scrolling place cards */}
        <div>
          {cityPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              placeName={place.placeName}
              characterName={place.characterName}
              neighborhood={place.neighborhood}
              onTap={() => setSelectedPlace(place.id)}
            />
          ))}
        </div>

        {/* Change city card */}
        <button
          onClick={() => setSelectedCity(null)}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            backgroundColor: 'white',
            color: '#2c5f4f',
            border: '2px solid #2c5f4f',
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          🚂 Cambia città
        </button>

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
        {cities.map((city) => (
          <PlaceCard
            key={city.id}
            placeName={city.name}
            characterName=""
            neighborhood={city.region}
            imageUrl={city.image}
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
