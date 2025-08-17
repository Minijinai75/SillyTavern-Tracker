import { updatePreview } from "../preview/TrackerPreviewManager.js";

export function openTrackerPanel(tracker) {
	// TODO: create/mount panel DOM, bind buttons to regenerate/edit
	updatePreview(tracker);
}
