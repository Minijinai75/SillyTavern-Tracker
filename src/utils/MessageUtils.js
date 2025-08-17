import ST from '../stBridge.js';
import { debug, warn } from './LogUtils.js';

/**
 * Return the SillyTavern chat array.
 */
export function getChat() {
  return ST.getChat();
}

/**
 * Safe getter for a chat message.
 */
export function getMessage(index) {
  return ST.getMessage(index) ?? null;
}

/**
 * Determine the entityId (speaker) for a given message index.
 * This is a critical seam: update it if ST’s message schema changes.
 *
 * Expected shape (EXAMPLE ONLY):
 *   msg.is_user === true         -> 'user'
 *   msg.extra?.characterId       -> 'char:Alice'
 *   msg.role === 'system'        -> 'system'
 */
export function getEntityIdForMessage(index) {
  const msg = getMessage(index);
  if (!msg) {
    warn(`[MessageUtils] getEntityIdForMessage: missing message at index ${index}`);
    return null;
  }

  // TODO: Adjust to your real schema. This is a stub.
  if (msg.is_user) return 'user';

  // Prefer explicit character id if available
  if (msg?.extra?.characterId) return `char:${msg.extra.characterId}`;

  // Fallbacks – adapt as needed
  if (typeof msg?.name === 'string' && msg.name.length) return `char:${msg.name}`;

  // As a last resort, treat as user to avoid nulls in early scaffolding
  debug('[MessageUtils] Fallback entityId used for message index', index);
  return 'user';
}

/**
 * Utility: find the previous message index with a tracker for the same entity.
 * Returns -1 if none found.
 */
export function findPreviousTrackerIndexForEntity(startIndex, entityId) {
  for (let i = startIndex - 1; i >= 0; i--) {
    const msg = getMessage(i);
    if (!msg?.tracker) continue;

    // If the message’s speaker matches the requested entity
    // NOTE: If you later store entityId in msg.tracker.meta, prefer that.
    const ent = getEntityIdForMessage(i);
    if (ent === entityId) return i;
  }
  return -1;
}
