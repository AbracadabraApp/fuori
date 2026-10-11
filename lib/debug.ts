/**
 * Phone debug mode. Open the app once with ?debug=1 to turn it on (remembered
 * on this device), ?debug=0 to turn it off. Shows what Whisper heard, which
 * voice played, timings and full error details on the conversation screen.
 */
const KEY = 'fuori-debug';

export function isDebugMode(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('debug');
    if (param === '1') localStorage.setItem(KEY, '1');
    if (param === '0') localStorage.removeItem(KEY);
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
