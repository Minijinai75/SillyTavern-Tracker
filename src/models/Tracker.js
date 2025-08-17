import ST, { STEvents } from "../stBridge.js";
import TrackerStore from "../store/TrackerStore.js";
import { getEntityIdForMessage } from "../utils/MessageUtils.js";
import { debug } from "../utils/LogUtils.js";
import { getNestedValue, setNestedValue, deleteNestedKey, deepMerge } from "../utils/ObjectUtils.js";

export default class Tracker {
	constructor(messageIndex) {
		this.messageIndex = messageIndex;
		this.entityId = getEntityIdForMessage(messageIndex);
		this.presetId = TrackerStore.getEntityPreset(this.entityId); // cached per-entity

		// If chat[i] exists, use its stored diffs; otherwise stage locally until message renders
		const msg = ST.getMessage(messageIndex);
		const existing = msg?.tracker?.changes ?? null;

		this._storage = existing || {}; // what’s actually persisted (if msg exists)
		this._pendingChanges = existing ? {} : {}; // staged diffs when msg not yet created
		this._prevTrackerCache = null;
		this.previewElement = null;

		// Self-register in the store
		TrackerStore.registerTracker(this);

		// Listen for events (invalidation + deferred write)
		ST.on(STEvents.TRACKER_CHANGED, ({ messageIndex: idx }) => this._onTrackerChanged(idx));
		ST.on(STEvents.MESSAGE_RENDERED, ({ index }) => this._onMessageRendered(index));
	}

	/**
	 * Return merged full tracker quickly:
	 * prevCache (computed from previous tracker’s current) + local diffs (storage/pending)
	 */
	current() {
		if (!this._prevTrackerCache) {
			// TODO: locate previous tracker for same entity; use its .current()
			// e.g. walk backwards until a tracker exists in TrackerStore or ST chat,
			// then materialize and cache it.
			debug(`[Tracker:${this.messageIndex}/${this.entityId}] current() prevCache TODO`);
			this._prevTrackerCache = {};
		}

		// Shallow overlay: previous merged state + our diffs (pending before persisted)
		return {
			...this._prevTrackerCache,
			...this._storage,
			...this._pendingChanges,
		};
	}

	/**
	 * Set nested value by path; store only diffs vs current()
	 */
	set(fieldPath, value) {
		const cur = this.current();
		const prevValue = getNestedValue(cur, fieldPath);
		const changed = JSON.stringify(prevValue) !== JSON.stringify(value);

		if (!changed) {
			// Remove any staged/persisted redundant value
			deleteNestedKey(this._pendingChanges, fieldPath);
			deleteNestedKey(this._storage, fieldPath);
			debug(`[Tracker:${this.messageIndex}] set() no-op (unchanged) for ${fieldPath}`);
			return;
		}

		const msgExists = !!ST.getMessage(this.messageIndex);
		if (msgExists) {
			setNestedValue(this._storage, fieldPath, value);
		} else {
			setNestedValue(this._pendingChanges, fieldPath, value);
		}

		// Invalidate downstream trackers and persist (if message exists)
		this.invalidateCache();
		ST.emitTrackerChanged(this.messageIndex);
		ST.saveChatDebounced();
	}

	delete(fieldPath) {
		const msgExists = !!ST.getMessage(this.messageIndex);
		if (msgExists) {
			deleteNestedKey(this._storage, fieldPath);
		} else {
			deleteNestedKey(this._pendingChanges, fieldPath);
		}

		this.invalidateCache();
		ST.emitTrackerChanged(this.messageIndex);
		ST.saveChatDebounced();
	}

	/**
	 * Apply a full/partial object of updates; only diffs are stored.
	 * TODO: Use FieldDefinition tree when available to control traversal.
	 */
	applyUpdateObject(updateObj) {
		const cur = this.current();
		// TODO: Efficient deep diff of updateObj vs cur → set/delete only changed keys.
		// (For now you might deepMerge, but only storing changes is the goal.)
		debug(`[Tracker:${this.messageIndex}] applyUpdateObject() TODO diff & store`);
		ST.emitTrackerChanged(this.messageIndex);
		ST.saveChatDebounced();
	}

	/**
	 * Generation gating: tracker-level (generationTarget) plus per-field (generateEvery).
	 * Implement after FieldDefinition/Presets are wired.
	 */
	shouldGenerate(force = false) {
		// TODO: Implement generationTarget + field-level checks w/ overrides.
		return !!force;
	}

	invalidateCache() {
		this._prevTrackerCache = null;
	}

	/**
	 * If message now exists, write pending diffs to chat[i].tracker.changes.
	 */
	writeToChat() {
		if (!ST.getMessage(this.messageIndex)) return;

		const msg = ST.ensureMessage(this.messageIndex);
		msg.tracker = msg.tracker || {};
		msg.tracker.changes = msg.tracker.changes || {};

		// Persist pending into storage, then clear pending
		deepMerge(this._pendingChanges, msg.tracker.changes);
		deepMerge(this._pendingChanges, this._storage); // keep local cache consistent
		this._pendingChanges = {};

		ST.saveChatDebounced();
		this.updatePreview();
	}

	updatePreview() {
		// TODO: render using preset.presetTemplate + each field’s fieldTemplate against this.current()
		debug(`[Tracker:${this.messageIndex}] updatePreview() TODO`);
	}

	// --- event handlers ---

	// When any earlier tracker changes, invalidate our prev cache
	_onTrackerChanged(changedIndex) {
		if (changedIndex < this.messageIndex) {
			this.invalidateCache();
		}
	}

	// When our message renders, move _pendingChanges → chat[i].tracker.changes
	_onMessageRendered(index) {
		if (index === this.messageIndex) {
			this.writeToChat();
		}
	}
}
