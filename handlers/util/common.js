const
	rx = require("rx"),
	baseDir = "../../..",
	sharedDir = baseDir + "/node-common",
	sharedPublicDir = sharedDir + "/public",
	sharedLocalizationDir = sharedPublicDir + "/localization";

const main = this;

exports.clone = function(from) {
	if (Array.isInstance(from)) {
		return [].concat(from);
	} else if (Object.isInstance(from)) {
		return Object.assign({}, from);
	} else {
		return {};
	}
};

exports.getKeys = function(object) {
	var keys = [];

	if (object && Object.isInstance(object)) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				keys.push(key);
			}
		}
	}

	return keys;
};

exports.getValues = function(object) {
	if (object) {
		return main.getKeys(object).map(key => object[key]);
	} else {
		return [];
	}
};

exports.isEmpty = function(object) {
	return main.getKeys(object).length == 0;
};

exports.isNotEmpty = function(object) {
	return !main.isEmpty(object);
};

exports.getLanguage = function(req) {
	const 
		languages = require(sharedLocalizationDir + "/languages.js"),
		defValue = languages.EN_US.value;

	if (req && req.headers) {
		return req.headers["accept-language"] || defValue;
	} else {
		return defValue;
	}
};

exports.getVersionNumber = function(text) {
	const regex = /(\d+)$/.exec(text);
	return parseInt(regex[0]);
};

exports.includeUtils = function() {
	const
		fs = require("fs"),
		utilsDir = __dirname,
		files = fs.readdirSync(utilsDir);

	files.forEach(function(file, index) {
		require(utilsDir + "/" + file);
	});
};

/**
 * Find all files with a certain name and emit then sequentially.
 * @param  {object} args This parameter must contain the filename key, and
 * optionally an array of filenames to skip.
 * @return {rx.Observable} An Observable object.
 */
exports.findFilesWithName = function(args) {
	if (args && args.filename && String.isInstance(args.filename)) {
		var filesToSkip = [
			"DS_Store",
			"env",
			"git",
			"node_modules",
			"Procfile"
		];

		if (Array.isInstance(args.filesToSkip)) {
			filesToSkip = filesToSkip.concat(args.filesToSkip);
		}

		const 
			fs = require("fs"),

			skipFcn = val => filesToSkip.every(function(file) {
				return !new RegExp("\w*" + file + "\w*").exec(val);
			});

		const readFilesUntilDone = function(path, args) {
			return rx.Observable.create(function(observer) {
				fs.readdir(path, function(err, files) {
					if (err) {
						observer.onError(err);
					} else {
						observer.onNext(files);
						observer.onCompleted();
					}
				})
			})
			.filter(files => Array.isInstance(files) && files.length)
			.flatMap(files => rx.Observable.from(files))
			.filter(skipFcn)
			.retry(2)
			.onErrorSwitchToEmpty()
			.flatMapIfSatisfied(
				val => val == args.filename,

				function(val, obs) {
					const file = [baseDir, path, val].join("/");
					return rx.Observable.just(require(file));
				},

				(val, obs) => readFilesUntilDone(path + "/" + val, args)
			);
		};

		return readFilesUntilDone(".", args);
	}

	Error.debugException(args);
	return rx.Observable.empty();
};

/**
 * Compound all files named localizable.js
 * @return {rx.Observable} An Observable object.
 */
exports.includeLocalizables = function(args) {
	return main.findFilesWithName({
		filename : "localizable.js",

		filesToSkip : [
			"handlers",
			"models",
			"routes"
		]
	});
};

exports.firstKey = function(object) {
	return main.getKeys(object)[0];
};

exports.firstValue = function(object) {
	const key = main.firstKey(object);

	if (key) {
		return object[key];
	} else {
		return undefined;
	}
};

exports.forEach = function(object, callback) {
	if (object && Object.isInstance(object) && Function.isInstance(callback)) {
		const keys = getKeys(object);
		keys.forEach(key => callback(key, object[key]));
	}
};

exports.deepForEach = function(object, callback) {
	main.forEach(object, (key, value) => {
		if (Function.isInstance(callback)) {
			callback(key, value);
		}

		main.deepForEach(value, callback);
	});
};

exports.hasConcreteValue = function(val) {
	return val != undefined && val != null;
};

exports.concreteValue = function(val, def) {
	return main.hasConcreteValue(val) ? val : def;
};

exports.log = function() {
	console.log(arguments);
};