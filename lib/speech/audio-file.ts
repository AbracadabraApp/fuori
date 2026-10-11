/**
 * Groq/Whisper decides the audio format from the file name's extension.
 * Browsers upload a Blob in FormData as a file named "blob" (no extension),
 * which Groq rejects, so every recording failed. These helpers give the file
 * a name that matches its type, on the phone and again on the server.
 */

const EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a', // iPhone Safari records AAC in an MP4 container
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/aac': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
};

const KNOWN = new Set(Object.values(EXTENSIONS).concat(['mp4', 'mpga', 'opus']));

/** "audio/mp4;codecs=mp4a.40.2" → "m4a" */
export function extensionFor(mimeType: string): string {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  return EXTENSIONS[base] ?? 'webm';
}

/** Keep a name that already has a usable extension; otherwise build one from the type. */
export function audioFileName(mimeType: string, currentName?: string): string {
  const ext = currentName?.split('.').pop()?.toLowerCase();
  if (currentName && currentName.includes('.') && ext && KNOWN.has(ext)) return currentName;
  return `speech.${extensionFor(mimeType)}`;
}
