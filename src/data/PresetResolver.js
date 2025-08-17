import FieldRegistry from "./FieldRegistryManager.js";
import PresetManager from "./PresetManager.js";
import { debug } from "../utils/LogUtils.js";

export function resolveActiveFields(presetId) {
	const preset = PresetManager.get(presetId);
	if (!preset) return [];

	const visited = new Set();
	const fieldIds = [];

	function collect(p) {
		if (visited.has(p.id)) return;
		visited.add(p.id);

		(p.includes || []).forEach((id) => {
			const child = PresetManager.get(id);
			if (child) collect(child);
		});

		(p.fields || []).forEach((fid) => fieldIds.push(fid));
	}

	collect(preset);

	// De-dup while preserving order (closest includes later fields)
	const seen = new Set();
	const orderedUnique = fieldIds.filter((fid) => (seen.has(fid) ? false : (seen.add(fid), true)));

	// Map to definitions and apply overrides (TODO as needed)
	const defs = orderedUnique
		.map((id) => {
			const def = FieldRegistry.get(id);
			// TODO: apply preset.overrides[id] to clone of def if needed.
			return def;
		})
		.filter(Boolean);

	debug(`[PresetResolver] ${presetId} → ${defs.length} active fields`);
	return defs;
}
