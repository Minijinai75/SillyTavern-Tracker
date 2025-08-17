import { renderPresetPreview } from "../../render/TemplateRenderer.js";
import PresetManager from "../../data/PresetManager.js";
import { resolveActiveFields } from "../../data/PresetResolver.js";

export function mountPreview(tracker, containerEl) {
	tracker.previewElement = containerEl;
	updatePreview(tracker);
}

export function updatePreview(tracker) {
	if (!tracker.previewElement) return;
	const preset = PresetManager.get(tracker.presetId);
	const fields = resolveActiveFields(tracker.presetId);
	const html = renderPresetPreview({ preset, fields, state: tracker.current() });
	tracker.previewElement.innerHTML = html;
}
