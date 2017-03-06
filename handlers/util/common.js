const
	baseDir = "../../..",
	sharedDir = baseDir + "/nodecommon",
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

	files.forEach((file, index) => {
		require(utilsDir + "/" + file);
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