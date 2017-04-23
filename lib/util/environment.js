/**
 * Check if currently in debug mode.
 */
exports.isDebugging = function isDebugging() {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development';
};
