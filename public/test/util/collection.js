const
	baseDir = "../../../..",
	shareDir = baseDir + "/node-common",
	sharedHandlerDir = shareDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

utils.includeUtils();

Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }

	return this;
};

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