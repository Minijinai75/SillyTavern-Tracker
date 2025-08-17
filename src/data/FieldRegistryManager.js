import FieldDefinition from "../models/FieldDefinition.js";
import { getRawField, setRawField } from "../utils/SettingsUtils.js";
import { debug } from "../utils/LogUtils.js";

class FieldRegistryManager {
	constructor() {
		this.cache = new Map(); // id -> FieldDefinition
	}

	get(id) {
		if (this.cache.has(id)) return this.cache.get(id);
		const raw = getRawField(id);
		if (!raw) return null;
		const def = new FieldDefinition(raw);
		this.cache.set(id, def);
		return def;
	}

	upsert(id, raw) {
		setRawField(id, raw);
		const def = new FieldDefinition(raw);
		this.cache.set(id, def);
		debug(`[FieldRegistry] upsert ${id}`);
		return def;
	}

	clear() {
		this.cache.clear();
	}
}

const instance = new FieldRegistryManager();
export default instance;
