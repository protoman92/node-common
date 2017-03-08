const 
	assert = require("chai").assert,
	rx = require("rx"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/node-common",
	sharedHandlerDir = sharedDir + "/handlers",
	sharePublicDir = sharedDir + "/public",
	faker = require(sharePublicDir + "/test/util/faker.js"),
	utils = require(sharedHandlerDir + "/util/common.js");

utils.includeUtils({});

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
		"Emit-Resume Test",
		function(done) {
			const loop = function(val) {
				return rx.Observable.just(++val)
					.filter(val => val <= 10)
					.emitThenResume(val => loop(val))
					.delay(10);
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

	it(
		"SwitchMap test",
		function(done) {
			const start = 1, end = 10;

			rx.Observable
				.range(start, end)
				.flatMapLatest(function(val) {
					return rx.Observable.range(0, val);
				})
				.toArray()
				.subscribe(
					function(val) {
						/**
						 * The last observable to emit value will be mirrored,
						 * while all older ones are stopped halfway.
						 */
						assert.equal(val.length, 2 * end - start)
					},

					function(err) {},

					function() {
						done();
					}
				);
		}
	);

	it.only(
		"SwitchMap test for autocomplete search",
		function(done) {
			const 
				totalCount = 1000,
				documents = Number.range(totalCount).map(_ => faker.word()),

				searchDocuments = query => rx.Observable
					.just(query)
					.map(query => documents.find(a => a.includes(query)))
					.filter(item => item)
					/**
					 * Even with a very small delay in subscription, we can
					 * treat this as an async operation on a database. If we
					 * use flatMap, we can expect all queries to be executed
					 * and the end results will contain stale documents.
					 * Therefore, we must use flatMapLatest to mirror only the
					 * latest Observable.
					 */
					.delay(1);

			rx.Observable
				.from(documents)
				.map(item => item.split(""))
				.concatMap(chars => rx.Observable
					.from(chars)
					.scan((a, b) => a + b, "")
					.flatMapLatest(query => searchDocuments(query)
						.doOnNext(function(result) {
							// console.log({
							// 	result : result, 
							// 	query : query
							// });
						})
					)
				)
				.toArray()
				.doOnNext(function(val) {
					/**
					 * Since we are only mirroring the latest Observable,
					 * we can expect the length of the result array is
					 * exactly equal to the total number of documents. This
					 * is because only the last item for each set of queries
					 * is executed. For example, if the word 'cat' can be
					 * processed into ['c', 'ca', 'cat'], only 'cat' will be
					 * executed - because we placed a delay on the search
					 * engine.
					 */
					assert.equal(val.length, totalCount);
				})
				.subscribe(
					function(val) {
						console.log(val.length);
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