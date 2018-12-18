/**
 * Debugger
 */
const PREFIX = '[MiniApp IDE]';

/**
 * Log level log, warn, fatal
 * 0: only show fatal
 * 1: warn and fatal
 * 2: all
 * @type {Number} logLevel
 */
let logLevel = 0;

// Debug mode
if (process.env.NODE_ENV === 'development') {
  logLevel = 2;
}

export function fatal(...args) {
  console.error(PREFIX, ...args);
}

export function warn(...args) {
  if (logLevel < 1) return;
  console.warn(PREFIX, ...args);
}

export function log(...args) {
  if (logLevel < 2) return;
  console.log(PREFIX, ...args);
}

/**
 * Set log level.
 * @param {logLevel} level
 */
export function setLogLevel(level) {
  logLevel = level;
}
