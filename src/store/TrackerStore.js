import ST, { STEvents } from "../stBridge.js";
import { debug } from "../utils/LogUtils.js";

class TrackerStore {
	constructor() {
		this.trackers = new Map(); // Map<messageIndex, Map<entityId, Tracker>>
		this.entityPresets = {}; // entityId → presetId cache
		this.globalData = {}; // Optional shared runtime state

		this._setupEventHooks();
	}

	_setupEventHooks() {
		ST.on(STEvents.CHAT_LOADED, () => this._onChatLoaded());
		ST.on(STEvents.CHAT_CHANGED, () => this._onChatChanged());
		ST.on(STEvents.MESSAGE_DELETED, ({ index }) => this._onMessageDeleted(index));
	}

	registerTracker(tracker) {
		if (!this.trackers.has(tracker.messageIndex)) {
			this.trackers.set(tracker.messageIndex, new Map());
		}
		this.trackers.get(tracker.messageIndex).set(tracker.entityId, tracker);
		debug(`Tracker registered for message ${tracker.messageIndex}, entity ${tracker.entityId}`);
	}

	unregisterTracker(messageIndex, entityId) {
		this.trackers.get(messageIndex)?.delete(entityId);
		if (this.trackers.get(messageIndex)?.size === 0) {
			this.trackers.delete(messageIndex);
		}
	}

	getTracker(messageIndex, entityId) {
		return this.trackers.get(messageIndex)?.get(entityId) ?? null;
	}

	setEntityPreset(entityId, presetId) {
		this.entityPresets[entityId] = presetId;
	}

	getEntityPreset(entityId) {
		return this.entityPresets[entityId] ?? null;
	}

	// ---- chat lifecycle handlers ----
	_onChatLoaded() {
		debug("TrackerStore: Chat loaded → clearing store.");
		this.clear();
		// Optionally: re-scan chat to pre-create trackers if desired.
	}

	_onMessageDeleted(messageIndex) {
		debug(`TrackerStore: Message ${messageIndex} deleted → removing trackers there.`);
		this.trackers.delete(messageIndex);
	}

	_onChatChanged() {
		debug("TrackerStore: Chat changed → clearing store.");
		this.clear();
	}

	clear() {
		this.trackers.clear();
		this.entityPresets = {};
		this.globalData = {};
	}
}

const instance = new TrackerStore();
export default instance;
