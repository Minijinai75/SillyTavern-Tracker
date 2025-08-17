const STATE = {
	level: "debug", // 'silent' | 'error' | 'warn' | 'info' | 'debug'
	prefix: "ST-Tracker",
	showTimestamp: true,
};

const LEVELS = ["silent", "error", "warn", "info", "debug"];
const shouldLog = (level) => LEVELS.indexOf(level) <= LEVELS.indexOf(STATE.level) && STATE.level !== "silent";

const ts = () => (STATE.showTimestamp ? new Date().toISOString() + " " : "");
const tag = () => (STATE.prefix ? `[${STATE.prefix}] ` : "");

export function configureLogger(opts = {}) {
	if (opts.level && LEVELS.includes(opts.level)) STATE.level = opts.level;
	if (typeof opts.prefix === "string") STATE.prefix = opts.prefix;
	if (typeof opts.showTimestamp === "boolean") STATE.showTimestamp = opts.showTimestamp;
}

export function log(...args) {
	// Convenience alias of info
	if (!shouldLog("info")) return;
	console.log(ts() + tag(), ...args);
}

export function info(...args) {
	if (!shouldLog("info")) return;
	console.info(ts() + tag(), ...args);
}

export function debug(...args) {
	if (!shouldLog("debug")) return;
	console.debug(ts() + tag(), ...args);
}

export function warn(...args) {
	if (!shouldLog("warn")) return;
	console.warn(ts() + tag(), ...args);
}

export function error(...args) {
	if (!shouldLog("error")) return;
	console.error(ts() + tag(), ...args);
}

// Optional: expose current settings (read-only)
export function getLoggerState() {
	return { ...STATE };
}
