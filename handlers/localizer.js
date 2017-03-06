const 
	i18n = require('i18n'),
	baseDir = "..",
	localizable = require(baseDir + "/public/localization/localizable.js");

exports.localize = function(req, text) {
	if (localizable[text]) {
		return i18n.__(text);
	} else {
		return text;
	}
};