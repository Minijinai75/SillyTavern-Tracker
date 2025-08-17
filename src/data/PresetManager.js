import TrackerPreset from "../models/TrackerPreset.js";
import { getRawPreset, setRawPreset } from "../utils/SettingsUtils.js";
import { debug } from "../utils/LogUtils.js";

class PresetManager {
	constructor() {
		this.cache = new Map(); // id -> TrackerPreset
	}

	get(id) {
		if (this.cache.has(id)) return this.cache.get(id);
		const raw = getRawPreset(id);
		if (!raw) return null;
		const preset = new TrackerPreset(raw);
		this.cache.set(id, preset);
		return preset;
	}

	upsert(id, raw) {
		setRawPreset(id, raw);
		const preset = new TrackerPreset(raw);
		this.cache.set(id, preset);
		debug(`[PresetManager] upsert ${id}`);
		return preset;
	}

	clear() {
		this.cache.clear();
	}
}

const instance = new PresetManager();
export default instance;
