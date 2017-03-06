const
	request = require("request");

describe("Function Tests", function() {
	this.timeout(100000);

	it(
		"Head requests should return correct headers",
		function(done) {
			request.head(
				"https://techcrunch.com/wp-json/", 
				function(err, res, body) {
					console.log(err);
					console.log(res.headers, res.statusCode);
					done();
				}
			);
		}
	);
});