const 
	status = require("http-status-codes"),
	baseDir = "../../..",
	sharedDir = baseDir + "/node-common",
	environment = require(sharedDir + "/handlers/util/environment.js");

Error.networkError = function(err, code) {
	var 
		error = new Error(),
		statusCode = code || status.NOT_FOUND;;

	if (err) {
		var message = "";

		if (String.isInstance(err)) {
			message = err;
		} else {
			message = err.message || "";
			statusCode = err.status || status.NOT_FOUND;
		}

		error.message = message;
	}

	error.status = statusCode;
	return error;
};

Error.debugException = function(args) {
	if (environment.isDebugging()) {
		var message;

		if (String.isInstance(args)) {
			message = args;
		} else if (Object.isInstance(args)) {
			message = JSON.stringify(args);
		} else {
			message = "";
		}

		throw Error(message);
	}
};