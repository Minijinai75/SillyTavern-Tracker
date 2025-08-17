import { debug } from "../utils/LogUtils.js";

export function renderField(fieldDefinition, value) {
	// TODO: interpolate fieldDefinition.fieldTemplate with "value", maybe more
	return `<div class="stt-field" data-field="${fieldDefinition?.id || "unknown"}">${escapeHtml(String(value ?? ""))}</div>`;
}

export function renderPresetPreview({ preset, fields, state }) {
	// TODO: combine fields -> HTML and wrap with preset.presetTemplate
	const inner = fields.map((fd) => renderField(fd, state?.[fd.id])).join("");
	const outer = preset?.presetTemplate || '<div class="stt-preview">{{content}}</div>';
	const html = outer.replace("{{content}}", inner);
	debug("[TemplateRenderer] renderPresetPreview() OK");
	return html;
}

export function escapeHtml(s) {
	return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
