import API from "./TrackerPublicAPI.js";
import ST from "../stBridge.js";
import { debug } from "../utils/LogUtils.js";

function _parseArgs(input) {
	// Very simple parser: /tracker.set 12 char:Alice path=value
	// TODO: replace with real parser or ST’s built-in arg helpers
	return input.trim().split(/\s+/);
}

export default class CommandRegistrar {
	constructor() {
		this.prefix = "/tracker";
	}

	registerAll() {
		// TODO: Replace with ST’s true slash-command registration method.
		// For now, scaffold a simple handler-collection:
		// stCommands.register('/tracker.set', this.cmdSet.bind(this))
		// stCommands.register('/tracker.gen', this.cmdGenerate.bind(this))
		debug("[CommandRegistrar] TODO: wire into ST slash command API");
	}

	// Example commands (signatures can be adjusted to your taste)

	// /tracker.current <msgIndex> [entityId]
	cmdCurrent(raw) {
		const [_, msgStr, entityId] = _parseArgs(raw);
		const idx = Number(msgStr);
		const state = API.current(idx, entityId || null);
		debug("[cmd current]", state);
		return state;
	}

	// /tracker.set <msgIndex> <path> <jsonValue> [entityId]
	cmdSet(raw) {
		const [_, msgStr, path, json, entityId] = _parseArgs(raw);
		const idx = Number(msgStr);
		let val = json;
		try {
			val = JSON.parse(json);
		} catch {}
		API.set(idx, path, val, entityId || null);
		return "OK";
	}

	// /tracker.del <msgIndex> <path> [entityId]
	cmdDelete(raw) {
		const [_, msgStr, path, entityId] = _parseArgs(raw);
		const idx = Number(msgStr);
		API.delete(idx, path, entityId || null);
		return "OK";
	}

	// /tracker.apply <msgIndex> <jsonObject> [entityId]
	cmdApply(raw) {
		const [_, msgStr, json, entityId] = _parseArgs(raw);
		const idx = Number(msgStr);
		let obj = {};
		try {
			obj = JSON.parse(json);
		} catch {}
		API.applyObject(idx, obj, entityId || null);
		return "OK";
	}

	// /tracker.gen <msgIndex> [entityId] [--force] [--fields=field1,field2]
	cmdGenerate(raw) {
		const args = _parseArgs(raw);
		const idx = Number(args[1]);
		const force = args.includes("--force");
		const fieldsArg = args.find((a) => a.startsWith("--fields="));
		const fields = fieldsArg ? fieldsArg.split("=")[1].split(",") : null;
		const entityId = args[2] && !args[2].startsWith("--") ? args[2] : null;
		return API.generate({ messageIndex: idx, entityId, force, fieldsFilter: fields });
	}

	// /tracker.preset.set <entityId> <presetId>
	cmdPresetSet(raw) {
		const [_, entityId, presetId] = _parseArgs(raw);
		API.setPresetIdForEntity(entityId, presetId);
		return "OK";
	}
}
