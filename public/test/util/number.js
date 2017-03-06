const
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	facebook = require(sharedHandlerDir + "/facebook/facebook.js"),
	faker = require(sharedPublicDir + "/test/util/faker.js"),
	utils = require(sharedHandlerDir + "/util/common.js");

utils.includeUtils();

describe("Function Tests", function() {
	it(
		"Number.range() should work as intended",
		function() {
			console.log(Number.range(8, 1));
		}
	);
});