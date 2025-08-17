import { debug, warn } from "./LogUtils.js";
import TrackerStore from "../store/TrackerStore.js";

// These are in-memory caches you can hydrate from ST settings on boot.
const SETTINGS = {
	defaultPresetId: null,
	presets: {}, // id -> raw preset data
	fields: {}, // id -> raw field data
};

// ---- Preset lookup ----

export function getPresetForEntity(entityId) {
	// Prefer the store cache (populated by UI changes or on boot)
	const cached = TrackerStore.getEntityPreset(entityId);
	if (cached) return cached;

	// TODO: If you want fallback logic: read from character metadata or default preset.
	return SETTINGS.defaultPresetId || null;
}

export function setPresetForEntity(entityId, presetId) {
	TrackerStore.setEntityPreset(entityId, presetId);
}

// ---- Default preset ----
export function getDefaultPresetId() {
	return SETTINGS.defaultPresetId;
}
export function setDefaultPresetId(presetId) {
	SETTINGS.defaultPresetId = presetId;
}

// ---- Raw registries (Field/Preset Managers will use these) ----
export function getRawField(id) {
	return SETTINGS.fields[id] || null;
}
export function getRawPreset(id) {
	return SETTINGS.presets[id] || null;
}

export function setRawField(id, raw) {
	SETTINGS.fields[id] = raw;
}
export function setRawPreset(id, raw) {
	SETTINGS.presets[id] = raw;
}

// ---- Boot-time hydration from ST settings (UI will call these) ----
export function hydrateFromSettings({ fields, presets, defaultPresetId }) {
	SETTINGS.fields = fields || {};
	SETTINGS.presets = presets || {};
	SETTINGS.defaultPresetId = defaultPresetId || null;
	debug("[SettingsUtils] Hydrated from ST settings.");
}

// Optional: export everything in a single object for debugging
export function _dumpSettingsCache() {
	return JSON.parse(JSON.stringify(SETTINGS));
}
