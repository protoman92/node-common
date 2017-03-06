const
	baseDir = "../../../..",
	sharedDir = baseDir + "/node-common",
	sharedHandlerDir = sharedDir + "/handlers",
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