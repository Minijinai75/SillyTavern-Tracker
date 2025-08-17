import { debug } from "../utils/LogUtils.js";

export default class TrackerPreset {
	constructor(data) {
		this.id = data.id;
		this.fields = data.fields ?? [];
		this.includes = data.includes ?? [];
		this.overrides = data.overrides ?? {};

		// Prompt templates
		this.generationMode = data.generationMode ?? "inline";
		this.generateContextTemplate = data.generateContextTemplate ?? "";
		this.generateSystemPrompt = data.generateSystemPrompt ?? "";
		this.generateRequestPrompt = data.generateRequestPrompt ?? "";
		this.generateRecentMessagesTemplate = data.generateRecentMessagesTemplate ?? "";
		this.characterDescriptionTemplate = data.characterDescriptionTemplate ?? "";
		this.mesTrackerTemplate = data.mesTrackerTemplate ?? "";

		// Rendering
		this.presetTemplate = data.presetTemplate ?? "";
		this.presetJavaScript = data.presetJavaScript ?? {};
	}

	// TODO: Expand includes, apply overrides, return FieldDefinition[]
	resolveActiveFields(fieldRegistry) {
		debug(`[Preset:${this.id}] resolveActiveFields() TODO`);
		return [];
	}
}
