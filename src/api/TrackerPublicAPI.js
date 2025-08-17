import ST from "../stBridge.js";
import TrackerStore from "../store/TrackerStore.js";
import { getEntityIdForMessage } from "../utils/MessageUtils.js";
import { resolveActiveFields } from "../data/PresetResolver.js";
import PresetManager from "../data/PresetManager.js";
import { buildPromptBundle } from "../generation/PromptBuilder.js";
import { generateTrackerUpdate } from "../generation/GenerationEngine.js";
import { parseTrackerResponse } from "../generation/PostProcessor.js";
import { debug, warn, error } from "../utils/LogUtils.js";

// Helper: fetch or create tracker for a message
function _getOrCreateTracker(messageIndex, entityId = null) {
	const eid = entityId ?? getEntityIdForMessage(messageIndex);
	let tracker = TrackerStore.getTracker(messageIndex, eid);
	if (!tracker) {
		const { default: Tracker } = require("../models/Tracker.js"); // avoid circular imports at load time
		tracker = new Tracker(messageIndex); // Tracker constructor derives entityId itself
	}
	return tracker;
}

const TrackerPublicAPI = {
	// ----- Core access -----
	getTracker(messageIndex, entityId = null) {
		return _getOrCreateTracker(messageIndex, entityId);
	},

	current(messageIndex, entityId = null) {
		return _getOrCreateTracker(messageIndex, entityId).current();
	},

	set(messageIndex, fieldPath, value, entityId = null) {
		_getOrCreateTracker(messageIndex, entityId).set(fieldPath, value);
		return true;
	},

	delete(messageIndex, fieldPath, entityId = null) {
		_getOrCreateTracker(messageIndex, entityId).delete(fieldPath);
		return true;
	},

	applyObject(messageIndex, updateObject, entityId = null) {
		_getOrCreateTracker(messageIndex, entityId).applyUpdateObject(updateObject);
		return true;
	},

	// ----- Presets -----
	getPresetIdForEntity(entityId) {
		return TrackerStore.getEntityPreset(entityId);
	},

	setPresetIdForEntity(entityId, presetId) {
		TrackerStore.setEntityPreset(entityId, presetId);
		ST.saveChatDebounced();
		return true;
	},

	// ----- Generation pipeline (single-stage / inline) -----
	async generate({ messageIndex, entityId = null, force = false, fieldsFilter = null }) {
		const tracker = _getOrCreateTracker(messageIndex, entityId);
		if (!tracker.shouldGenerate(force)) {
			debug("[API] generate() skipped by shouldGenerate.");
			return { skipped: true, updates: {} };
		}

		const presetId = tracker.presetId;
		const activeFields = resolveActiveFields(presetId);
		const filteredFields = Array.isArray(fieldsFilter) ? activeFields.filter((fd) => fieldsFilter.includes(fd?.id)) : activeFields;

		const currentState = tracker.current();
		const promptBundle = buildPromptBundle({
			presetId,
			currentState,
			recentMessages: [], // TODO: supply recent messages
			characterDescription: "", // TODO: supply char desc if needed
		});

		const { rawText, updates } = await generateTrackerUpdate({
			fieldsToGenerate: filteredFields,
			promptBundle,
			mode: "single-stage", // inline vs single-stage decided per preset later
		});

		const structured = updates && Object.keys(updates).length ? updates : parseTrackerResponse(rawText);
		if (structured && typeof structured === "object") {
			tracker.applyUpdateObject(structured);
		}
		return { updates: structured || {}, skipped: false };
	},

	// ----- Previews -----
	refreshPreview(messageIndex, entityId = null) {
		const tracker = _getOrCreateTracker(messageIndex, entityId);
		tracker.updatePreview();
		return true;
	},

	// ----- Maintenance / admin -----
	clearStore() {
		TrackerStore.clear();
	},
};

export default TrackerPublicAPI;
