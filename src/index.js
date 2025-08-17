import ST, { STEvents } from "./stBridge.js";
import TrackerStore from "./store/TrackerStore.js";
import FieldRegistry from "./data/FieldRegistryManager.js";
import PresetManager from "./data/PresetManager.js";
import { hydrateFromSettings } from "./utils/SettingsUtils.js";
import ScriptingBridge from "./api/ScriptingBridge.js";
import CommandRegistrar from "./api/CommandRegistrar.js";
import { debug } from "./utils/LogUtils.js";

export function initTrackerExtension(initialSettings) {
	// Hydrate caches from saved ST settings
	hydrateFromSettings(initialSettings);
	debug("[Init] Tracker extension initialized.");

	ScriptingBridge.register();
	new CommandRegistrar().registerAll();
}

// Example: react to chat lifecycle at top-level (store already listens internally)
ST.on(STEvents.CHAT_LOADED, () => {
	// e.g., could rebuild UI, refresh selectors, etc.
});

// Optional: expose a tiny API for other extensions
export const TrackerAPI = {
	getTracker: (msgIndex, entityId) => TrackerStore.getTracker(msgIndex, entityId),
	getPreset: (id) => PresetManager.get(id),
	getField: (id) => FieldRegistry.get(id),
};
