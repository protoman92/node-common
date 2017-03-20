// @flow

const status = require('http-status-codes');
const environment = require('./environment.js');

Error.networkError = function (err, code) {
  const error = new Error();
  let statusCode = code || status.NOT_FOUND;

  if (err) {
    let message = '';

    if (String.isInstance(err)) {
      message = err;
    } else {
      message = err.message || '';
      statusCode = err.status || status.NOT_FOUND;
    }

    error.message = message;
  }

  error.status = statusCode;
  return error;
};

Error.debugException = function (args) {
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
