'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  placeName: string;
  characterName: string;
  neighborhood: string;
  imageUrl?: string;
  placeId: string; // M2: for stamp variant
  visitCount?: number; // M2: show stamp if > 0
  onTap: () => void;
}

/**
 * Hash place ID to pick stamp variant (deterministic)
 */
function hashPlaceId(placeId: string): number {
  let hash = 0;
  for (let i = 0; i < placeId.length; i++) {
    hash = ((hash << 5) - hash) + placeId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Pick stamp variant based on place ID
 */
function getStampVariant(placeId: string): string {
  const variants = ['terracotta', 'olive', 'blue', 'wine'];
  const index = hashPlaceId(placeId) % variants.length;
  return variants[index];
}

export function PlaceCard({ placeName, neighborhood, imageUrl, placeId, visitCount = 0, onTap }: PlaceCardProps) {
  // If the image file is missing, show the sand placeholder instead of a broken icon
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && !failed;

  // M2: Show stamp if visited
  const visited = visitCount > 0;
  const stampVariant = visited ? getStampVariant(placeId) : null;

  return (
    <div onClick={onTap} className={styles.card}>
      {/* Image area - square like Polaroid/Instagram */}
      <div className={`${styles.imageArea} ${showImage ? '' : styles.noImage}`}>
        {showImage && (
          // next/image serves a resized, modern-format copy sized to the card
          <Image
            src={imageUrl}
            alt={placeName}
            fill
            sizes="(max-width: 600px) 100vw, 600px"
            className={styles.image}
            onError={() => setFailed(true)}
          />
        )}

        {/* M2: Visit stamp overlay */}
        {visited && stampVariant && (
          <div
            className={styles.stamp}
            data-variant={stampVariant}
            aria-label="Visited"
          />
        )}
      </div>

      {/* Caption below like Polaroid - white space with black text */}
      <div className={styles.caption}>
        <div className={`${styles.name} ${neighborhood ? styles.withSubtitle : ''}`}>{placeName}</div>
        {neighborhood && <div className={styles.subtitle}>{neighborhood}</div>}
      </div>
    </div>
  );
}
