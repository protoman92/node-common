const
	baseDir = "../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	localizer = require(sharedHandlerDir + "/localizer.js"),
	localizable = require(sharedPublicDir + "/localization/localizable.js");

exports.register = function(app) {
	/**
	 * Intercept the response and wrap any error with a network error, with
	 * localized error message and status code.
	 */
	app.use(function(req, res, next) {
		var oldSend = res.send;

		res.send = function(data) {
			var newData = data;

			if (Error.isInstance(data)) {
				const message = localizer.localize(req, data.message);
				newData = Error.networkError(message, data.status);
			}

			arguments[0] = newData;
			oldSend.apply(res, arguments);
		};

		next();
	});

	app.use((req, res, next) => {
		const language = req.headers["accept-language"];

		if (String.isInstance(language)) {
			req.headers["accept-language"] = language.toLowerCase();
		}

		next();
	});
};