const 
	rx = require("rx"),
	status = require("http-status-codes"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	utils = require(sharedHandlerDir + "/util/common.js"),
	localizer = require(sharedHandlerDir + "/localizer.js"),
	authData = require(sharedHandlerDir + "/auth/authData.js"),
	tokenHandler = require(sharedHandlerDir + "/accessToken.js"),
	localizable = require(sharedPublicDir + "/localization/localizable.js");

exports.authenticationObserver = function(res) {
	return rx.Observer.create(
		function(val) {
			tokenHandler.setAccessTokenHeader(res);
			res.send(val);
		},
		
		function(err) {
			utils.log(err);
			res.status(err.status || status.NOT_FOUND).send(err);
		}
	);
};