'use client';

import { cities, pack, language } from '@/content';
import type { CityPantry } from '@/lib/types';
import styles from './CityPicker.module.css';

interface CityPickerProps {
  currentCityId: string;
  onSelectCity: (cityId: string) => void;
  onClose: () => void;
}

export function CityPicker({ currentCityId, onSelectCity, onClose }: CityPickerProps) {
  // Every city, including the ones after "Mostra altro" on the home list (Josh, 2026-10-14)
  const availableCities = cities.filter((c) => !c.hidden);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{language.ui.whereTo}</h2>
          <button onClick={onClose} className={styles.close}>
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

        <div className={styles.cities}>
          {availableCities.map((city) => {
            const isCurrent = city.id === currentCityId;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                className={`${styles.cityCard} ${isCurrent ? styles.current : ''}`}
                disabled={isCurrent}
              >
                <div className={styles.cityImage}>
                  <img
                    src={`${pack.images}/cities/${city.id}.jpg`}
                    alt={city.name}
                  />
                </div>
                <div className={styles.cityInfo}>
                  <div className={styles.cityName}>{city.name}</div>
                  <div className={styles.cityRegion}>{city.region || ''}</div>
                  {isCurrent && <div className={styles.currentLabel}>{language.ui.youAreHere}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
