import { debug } from "../utils/LogUtils.js";

export async function generateTrackerUpdate({ fieldsToGenerate, promptBundle, mode = "single-stage" }) {
	// TODO: integrate with SillyTavern's LLM call surface (or your own abstraction).
	// Return object like { updates: { fieldPath: value, ... }, rawText }.
	debug("[GenerationEngine] TODO: integrate with LLM. Returning placeholder.");
	return { updates: {}, rawText: "" };
}
