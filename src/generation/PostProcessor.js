import { debug } from "../utils/LogUtils.js";

export function parseTrackerResponse(rawText) {
	// TODO: implement robust parser:
	// 1) Try JSON.parse
	// 2) Try YAML (if you ship a parser)
	// 3) Fallback regex extraction / heuristic parsing
	debug("[PostProcessor] parseTrackerResponse() TODO");
	return {};
}
