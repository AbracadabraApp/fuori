import styles from './PlaceCard.module.css';

interface PlaceCardProps {
  placeName: string;
  characterName: string;
  neighborhood: string;
  imageUrl?: string;
  onTap: () => void;
}

export function PlaceCard({ placeName, neighborhood, imageUrl, onTap }: PlaceCardProps) {
  return (
    <div onClick={onTap} className={styles.card}>
      {/* Image area - square like Polaroid/Instagram */}
      <div className={`${styles.imageArea} ${imageUrl ? '' : styles.noImage}`}>
        {imageUrl && <img src={imageUrl} alt={placeName} className={styles.image} />}
      </div>

      {/* Caption below like Polaroid - white space with black text */}
      <div className={styles.caption}>
        <div className={`${styles.name} ${neighborhood ? styles.withSubtitle : ''}`}>{placeName}</div>
        {neighborhood && <div className={styles.subtitle}>{neighborhood}</div>}
      </div>
    </div>
  );
}
