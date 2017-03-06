const 
	rx = require("rx"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

utils.includeUtils();

describe("Functionality Tests", function() {
	this.timeout(100000);

	it(
		"Reduce Test",
		function(done) {
			const source = rx.Observable.just([1, 2, 3]);

			source.reduce((a, b) => a.concat(b), [])
				.subscribe(
					function(val) {
						console.log(val);
					},

					function(err) {
						console.log(err);
					},

					function() {
						done();
					}
				);
		}
	);

	it(
		"Retry Test",
		function(done) {
			rx.Observable.range(1, 5)
				.filter(a => Boolean.random() ? true : a % 2 == 0)
				.throwIfEmpty(new Error())
				.retry(0)
				.subscribe(
					function(val) {
						console.log(val);
					},

					function(err) {
						console.log(err.message);
					},

					function() {
						done();
					}
				);
		}
	);

	it(
		"Interval Test",
		function(done) {
			rx.Observable.interval(1000)
				.subscribe(
					function(val) {
						console.log(val);
					},

					function(err) {
						throw err;
					},

					function() {
						done();
					}
				);
		}
	);

	it.only(
		"Emit-Resume Test",
		function(done) {
			const loop = function(val) {
				return rx.Observable.just(++val)
					.filter(val => val <= 10)
					.emitThenResume(val => loop(val))
					.delay(1000);
			};

			loop(0).subscribe(
				function(val) {
					console.log(val);
				},

				function(err) {
					throw err;
				},

				function() {
					done();
				}
			);
		}
	);
});