'use client';

/**
 * The ticket on a station screen (Josh, 2026-10-14): above the talking
 * controls, printed like a real rail or bus ticket, with the board button.
 * Words and colours come from the country pack (train in Italy, bus in
 * Mexico); no departure time, so it can't contradict the ticket seller.
 * Boarding goes through the conversation screen's leave step, which saves.
 */
import { language, pack } from '@/content';
import styles from './Ticket.module.css';

interface TicketProps {
  from: string;
  to: string;
  platform: number;
  seat: number;
  onBoard: () => void;
}

/** A plain pictogram of the vehicle, drawn here so no real company's logo is used */
function Vehicle({ kind }: { kind: 'train' | 'bus' }) {
  return kind === 'train' ? (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="5" y="3" width="14" height="14" rx="3" fill="currentColor" />
      <rect x="7.5" y="5.5" width="9" height="5" rx="1" fill="var(--band-ink)" />
      <circle cx="9" cy="14" r="1.2" fill="var(--band-ink)" />
      <circle cx="15" cy="14" r="1.2" fill="var(--band-ink)" />
      <path d="M8 18l-2 3M16 18l2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="3" fill="currentColor" />
      <rect x="5" y="6" width="14" height="5" rx="1" fill="var(--band-ink)" />
      <circle cx="7.5" cy="18.5" r="2" fill="currentColor" />
      <circle cx="16.5" cy="18.5" r="2" fill="currentColor" />
    </svg>
  );
}

export function Ticket({ from, to, platform, seat, onBoard }: TicketProps) {
  const t = language.ui.ticket;
  const theme = pack.ticketTheme;
  return (
    <div
      className={styles.ticket}
      style={{ '--band': theme.band, '--band-ink': theme.bandInk, '--stripe': theme.stripe, '--accent': theme.accent } as React.CSSProperties}
    >
      <div className={styles.band}>
        <span className={styles.carrier}>
          <span className={styles.mark}>
            <Vehicle kind={t.vehicle} />
          </span>
          {t.carrier}
        </span>
        <span className={styles.service}>{t.service}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.route}>
          <span>{from}</span>
          {/* the arrow stays with the destination when a long name wraps */}
          <span className={styles.to}>
            <span className={styles.arrow} aria-hidden="true">→</span> {to}
          </span>
        </div>

        <div className={styles.fields}>
          <div><span className={styles.label}>{t.platform}</span><b>{platform}</b></div>
          <div><span className={styles.label}>{t.seat}</span><b>{seat}</b></div>
          <div><span className={styles.label}>{t.fareLabel}</span><b>{t.fare}</b></div>
        </div>

        <div className={styles.foot}>
          <span className={styles.barcode} aria-hidden="true" />
          <button type="button" onClick={onBoard} className={styles.board}>
            {t.board}
          </button>
        </div>
      </div>
    </div>
  );
}
