const
	baseDir = "../../../..",
	shareDir = baseDir + "/node-common",
	sharedHandlerDir = shareDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

const main = this;

exports.includeUtils = function() {
	utils.includeUtils({
		directory : __dirname,
		prepend : ""
	})
};