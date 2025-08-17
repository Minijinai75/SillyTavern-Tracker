import PresetManager from "../data/PresetManager.js";
import { debug } from "../utils/LogUtils.js";

export function buildPromptBundle({ presetId, currentState, recentMessages, characterDescription }) {
	const preset = PresetManager.get(presetId);
	if (!preset) return null;

	// TODO: template expansion (use your chosen templating approach)
	const context = preset.generateContextTemplate; // fill with {currentState, recentMessages, ...}
	const system = preset.generateSystemPrompt;
	const request = preset.generateRequestPrompt;
	const recent = preset.generateRecentMessagesTemplate;
	const char = preset.characterDescriptionTemplate;

	debug(`[PromptBuilder] Built bundle for preset=${presetId}`);
	return {
		presetId,
		system,
		context,
		request,
		recent,
		character: char,
	};
}
