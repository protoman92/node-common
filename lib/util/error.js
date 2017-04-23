const environment = require('./environment.js');

/**
 * Throw an {@link Error} if currently debugging.
 * @param {object} args This parameter should supply information for the
 * Error message.
 */
Error.debugException = function debugException(args) {
  if (environment.isDebugging()) {
    let message;

    if (String.isInstance(args)) {
      message = args;
    } else if (Object.isInstance(args)) {
      message = JSON.stringify(args);
    } else {
      message = '';
    }

    throw Error(message);
  }
};
