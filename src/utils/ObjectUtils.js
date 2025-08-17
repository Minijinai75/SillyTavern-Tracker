/**
 * Convert a dot/bracket path string to an array of keys.
 * Supports: "a.b.c", "a[0].b", "a['weird.key']"
 */
export function toPath(path) {
	if (Array.isArray(path)) return path.slice();
	if (typeof path !== "string" || path.length === 0) return [];

	const re = /[^.[\]]+|\[(?:([0-9]+)|"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\]/g;
	const out = [];
	path.replace(re, (match, index, dblQ, sglQ) => {
		if (index !== undefined) {
			out.push(Number(index));
		} else if (dblQ !== undefined) {
			out.push(dblQ.replace(/\\"/g, '"'));
		} else if (sglQ !== undefined) {
			out.push(sglQ.replace(/\\'/g, "'"));
		} else {
			out.push(match);
		}
		return "";
	});
	return out;
}

export function isPlainObject(val) {
	return Object.prototype.toString.call(val) === "[object Object]";
}

/**
 * Get a nested value. Returns undefined if not found.
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
	if (!obj) return defaultValue;
	const keys = toPath(path);
	let cur = obj;
	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];
		if (cur == null) return defaultValue;
		cur = cur[k];
	}
	return cur === undefined ? defaultValue : cur;
}

/**
 * Set a nested value, creating intermediate objects/arrays as needed.
 * Returns the mutated root object.
 */
export function setNestedValue(obj, path, value) {
	const keys = toPath(path);
	if (keys.length === 0) return obj;

	let cur = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i];
		const nextK = keys[i + 1];

		if (cur[k] == null) {
			cur[k] = typeof nextK === "number" ? [] : {};
		} else if (!isPlainObject(cur[k]) && !Array.isArray(cur[k])) {
			// Overwrite non-container nodes to make way
			cur[k] = typeof nextK === "number" ? [] : {};
		}
		cur = cur[k];
	}
	cur[keys[keys.length - 1]] = value;
	return obj;
}

/**
 * Delete a nested key. If pruneEmpty is true, removes empty parent objects/arrays.
 * Returns true if something was deleted.
 */
export function deleteNestedKey(obj, path, pruneEmpty = true) {
	const keys = toPath(path);
	if (keys.length === 0) return false;

	const stack = [];
	let cur = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i];
		if (cur == null || !(k in cur)) return false;
		stack.push({ parent: cur, key: k });
		cur = cur[k];
	}

	const leafKey = keys[keys.length - 1];
	if (cur == null || !(leafKey in cur)) return false;

	// Delete leaf
	if (Array.isArray(cur) && typeof leafKey === "number") {
		// Remove by index & compact array end if needed
		cur.splice(leafKey, 1);
	} else {
		delete cur[leafKey];
	}

	if (!pruneEmpty) return true;

	// Walk back up pruning empties
	for (let i = stack.length - 1; i >= 0; i--) {
		const { parent, key } = stack[i];
		const node = parent[key];

		if (isPlainObject(node) && Object.keys(node).length === 0) {
			delete parent[key];
			continue;
		}
		if (Array.isArray(node) && node.length === 0) {
			delete parent[key];
			continue;
		}
		// Stop if parent still has content
		break;
	}

	return true;
}

/**
 * Deep merge: merges source into target (mutates target).
 * - Plain objects are merged recursively.
 * - Arrays are REPLACED by source arrays.
 * - Primitives are overwritten by source.
 *
 * @returns target
 */
export function deepMerge(source, target) {
	if (source === target) return target;
	if (!isPlainObject(source) && !Array.isArray(source)) return target;

	if (Array.isArray(source)) {
		// Replace arrays
		return source.slice(); // caller should assign result to a property
	}

	// source is a plain object
	for (const key of Object.keys(source)) {
		const sVal = source[key];
		const tVal = target[key];

		if (Array.isArray(sVal)) {
			target[key] = sVal.slice();
		} else if (isPlainObject(sVal)) {
			if (!isPlainObject(tVal)) target[key] = {};
			deepMerge(sVal, target[key]);
		} else {
			target[key] = sVal;
		}
	}
	return target;
}

/**
 * Shallow object diff: returns {added, changed, removed} key sets comparing a->b.
 * Useful if you want a quick diff at a single depth.
 */
export function shallowDiff(a = {}, b = {}) {
	const added = [];
	const changed = [];
	const removed = [];

	const aKeys = new Set(Object.keys(a));
	const bKeys = new Set(Object.keys(b));

	for (const k of bKeys) {
		if (!aKeys.has(k)) {
			added.push(k);
		} else if (a[k] !== b[k]) {
			changed.push(k);
		}
	}
	for (const k of aKeys) {
		if (!bKeys.has(k)) removed.push(k);
	}
	return { added, changed, removed };
}
