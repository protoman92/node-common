const
	baseDir = "../../../..",
	shareDir = baseDir + "/node-common",
	sharedHandlerDir = shareDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

utils.includeUtils();

describe("Function Tests", function() {
	it(
		"Array.last() function should work correctly",
		function(done) {
			const array = [1, 2, 3, 4];
			console.log(array.last());

			console.log(array.last({
				condition : val => val == 0,
				default : 10
			}));

			done();
		}
	);
});