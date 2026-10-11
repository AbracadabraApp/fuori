import styles from './ShowMore.module.css';

interface ShowMoreProps {
  label: string;
  onClick: () => void;
}

/** A small olive sprig, drawn facing right; mirrored on the right side. */
function Sprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`${styles.sprig} ${flip ? styles.flip : ''}`}
      width="40"
      height="18"
      viewBox="0 0 40 18"
      fill="none"
      aria-hidden="true"
    >
      {/* gently curving stem */}
      <path d="M2 11 Q 18 8, 38 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {/* slender olive leaves, alternating above and below, pointing along the stem */}
      <path d="M8 10.2 Q 11 4.5, 16 5.2 Q 12.5 8.5, 8 10.2 Z" fill="currentColor" />
      <path d="M14 9.4 Q 18 15.5, 23 14.2 Q 18.8 11, 14 9.4 Z" fill="currentColor" />
      <path d="M21 9 Q 24.5 3.2, 29.5 4 Q 25.8 7.5, 21 9 Z" fill="currentColor" />
      <path d="M27 9 Q 30.5 14, 34.5 12.8 Q 31 10.2, 27 9 Z" fill="currentColor" />
      {/* olive at the tip */}
      <ellipse cx="36.6" cy="8.6" rx="1.7" ry="1.3" fill="currentColor" />
    </svg>
  );
}

/** "Show more" link for the city and place feeds: centred, with decoration on each side. */
export function ShowMore({ label, onClick }: ShowMoreProps) {
  return (
    <div className={styles.row}>
      <span className={styles.rule} aria-hidden="true" />
      <Sprig />
      <button type="button" onClick={onClick} className={styles.link}>
        {label}
      </button>
      <Sprig flip />
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
