// The settings button, top right on every screen (Josh, 2026-10-15). The sheet
// it opens lives in app/page.tsx, so the settings are the same everywhere.
import styles from './SettingsButton.module.css';

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={styles.settingsButton}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
      </svg>
      <span>Settings</span>
    </button>
  );
}
