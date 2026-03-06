/**
 * Normalize API error message (string or array of strings) to a single string.
 */
export function normalizeApiMessage(message: unknown): string {
  if (Array.isArray(message)) {
    return message.length ? String(message[0]) : 'An error occurred';
  }
  if (typeof message === 'string') return message;
  return 'An error occurred';
}
