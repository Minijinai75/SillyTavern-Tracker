export default class FieldDefinition {
	constructor(data) {
		this.id = data.id;
		this.type = data.type;
		this.presence = data.presence;

		// Generation settings
		this.generateEvery = data.generateEvery ?? 1;
		this.schedule = data.schedule ?? "char";
		this.foreachScope = data.foreachScope ?? null;
		this.foreachGenerateOnlyCurrent = data.foreachGenerateOnlyCurrent ?? false;

		// Prompt & defaults
		this.fieldPrompt = data.fieldPrompt ?? "";
		this.structurePrompt = data.structurePrompt ?? "";
		this.placeholder = data.placeholder ?? null;
		this.initialValue = data.initialValue ?? null;
		this.exampleValues = data.exampleValues ?? [];

		// UI rendering
		this.fieldTemplate = data.fieldTemplate ?? "";
	}
}
