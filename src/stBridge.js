import { chat as _chat, saveChatDebounced as _saveChatDebounced } from "../../../../../script.js";
import { debug, warn } from "./utils/LogUtils.js";

// Simple internal emitter so we can normalize events even if ST’s API shifts.
class Emitter {
	constructor() {
		this.map = new Map();
	}
	on(name, fn) {
		if (!this.map.has(name)) this.map.set(name, new Set());
		this.map.get(name).add(fn);
	}
	off(name, fn) {
		this.map.get(name)?.delete(fn);
	}
	emit(name, payload) {
		this.map.get(name)?.forEach((fn) => fn(payload));
	}
}

export const STEvents = {
	CHAT_LOADED: "platform.chatLoaded",
	CHAT_CHANGED: "platform.chatChanged",
	MESSAGE_DELETED: "platform.messageDeleted",
	MESSAGE_RENDERED: "platform.messageRendered",
	// App-level:
	TRACKER_CHANGED: "platform.trackerChanged",
};

class STBridge {
	constructor() {
		this.emitter = new Emitter();
		this._wireSillyTavernEvents();
	}

	_wireSillyTavernEvents() {
		// TODO: Hook SillyTavern’s real event hub here.
		// Example pseudocode:
		// stEventHub.on('chatLoaded',      () => this.emit(STEvents.CHAT_LOADED));
		// stEventHub.on('chatChanged',     () => this.emit(STEvents.CHAT_CHANGED));
		// stEventHub.on('messageRendered', (idx) => this.emit(STEvents.MESSAGE_RENDERED, { index: idx }));
		// stEventHub.on('messageDeleted',  (idx) => this.emit(STEvents.MESSAGE_DELETED,  { index: idx }));

		debug("[stBridge] Event wiring complete (stub).");
	}

	// --- Event API ---
	on(eventName, handler) {
		this.emitter.on(eventName, handler);
	}
	off(eventName, handler) {
		this.emitter.off(eventName, handler);
	}
	emit(eventName, payload) {
		this.emitter.emit(eventName, payload);
	}

	// Your trackers will call this so others can invalidate
	emitTrackerChanged(messageIndex) {
		this.emit(STEvents.TRACKER_CHANGED, { messageIndex });
	}

	// --- Chat & Persistence API ---
	getChat() {
		return _chat;
	}
	getMessage(i) {
		return _chat?.[i];
	}
	ensureMessage(i) {
		if (!_chat[i]) _chat[i] = {};
		return _chat[i];
	}

	saveChatDebounced() {
		_saveChatDebounced();
	}

	// Version helper (optional)
	getVersion() {
		return "ST-unknown";
	}
}

const ST = new STBridge();
export default ST;
