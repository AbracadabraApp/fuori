'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  placeName: string;
  characterName: string;
  neighborhood: string;
  imageUrl?: string;
  onTap: () => void;
}

export function PlaceCard({ placeName, neighborhood, imageUrl, onTap }: PlaceCardProps) {
  // If the image file is missing, show the sand placeholder instead of a broken icon
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && !failed;

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
      </div>

      {/* Caption below like Polaroid - white space with black text */}
      <div className={styles.caption}>
        <div className={`${styles.name} ${neighborhood ? styles.withSubtitle : ''}`}>{placeName}</div>
        {neighborhood && <div className={styles.subtitle}>{neighborhood}</div>}
      </div>
    </div>
  );
}
