interface PlaceCardProps {
  placeName: string;
  characterName: string;
  neighborhood: string;
  imageUrl?: string;
  onTap: () => void;
}

export function PlaceCard({
  placeName,
  characterName,
  neighborhood,
  imageUrl,
  onTap,
}: PlaceCardProps) {
  return (
    <div
      onClick={onTap}
      style={{
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Image area - square like Polaroid/Instagram */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: imageUrl ? 'transparent' : '#e8d5c4',
          overflow: 'hidden',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={placeName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Caption below like Polaroid - white space with black text */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#000',
            marginBottom: characterName ? '4px' : 0,
          }}
        >
          {placeName}
        </div>
        {(characterName || neighborhood) && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            {[characterName, neighborhood].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}
