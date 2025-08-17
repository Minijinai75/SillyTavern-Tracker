import API from "./TrackerPublicAPI.js";
import { debug } from "../utils/LogUtils.js";

class ScriptingBridge {
	constructor() {
		this.ns = "Tracker"; // namespace visible to scripts, e.g., Tracker.current(...)
	}

	register() {
		// TODO: Replace with SillyTavern’s official STScript registration if available.
		// Fallback: attach to global for now.
		if (!window.STT) window.STT = {};
		window.STT[this.ns] = {
			// Read
			current: (messageIndex, entityId = null) => API.current(messageIndex, entityId),
			getTracker: (messageIndex, entityId = null) => API.getTracker(messageIndex, entityId), // returns instance

			// Write
			set: (messageIndex, path, value, entityId = null) => API.set(messageIndex, path, value, entityId),
			delete: (messageIndex, path, entityId = null) => API.delete(messageIndex, path, entityId),
			applyObject: (messageIndex, obj, entityId = null) => API.applyObject(messageIndex, obj, entityId),

			// Generation
			generate: (opts) => API.generate(opts),

			// Presets
			getPresetIdForEntity: (entityId) => API.getPresetIdForEntity(entityId),
			setPresetIdForEntity: (entityId, presetId) => API.setPresetIdForEntity(entityId, presetId),

			// Preview
			refreshPreview: (messageIndex, entityId = null) => API.refreshPreview(messageIndex, entityId),

			// Admin
			clearStore: () => API.clearStore(),
		};

		debug("[ScriptingBridge] Registered STT.Tracker API on window.STT");
	}
}

const instance = new ScriptingBridge();
export default instance;
