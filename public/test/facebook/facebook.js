const
	assert = require("chai").assert,
	graph = require("fbgraph"),
	rx = require("rx"),
	sinon = require("sinon"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	facebook = require(sharedHandlerDir + "/facebook/facebook.js"),
	faker = require(sharedPublicDir + "/test/util/faker.js"),
	stubber = require(sharedPublicDir + "/test/facebook/stubber.js"),
	utils = require(sharedHandlerDir + "/util/common.js"),
	FacebookPost = require(sharedHandlerDir + "/facebook/post.js");

utils.includeUtils();

const stubClient = true;

describe("Function Tests", function() {
	this.timeout(100000);

	beforeEach(function(done) {
		if (stubClient) {
			stubber.stub({});
		}

		done();
	});

	afterEach(function(done) {
		if (stubClient) {
			stubber.restore({});
		}
		
		done();
	});

	it(
		"Get posts should emit the correct number of posts",
		function(done) {
			rx.Observable.range(1, 10)
				/**
				 * Randomize the result limit to test that the total number of 
				 * results should not exceed a certain threshold.
				 */
				.map(number => Number.randomBetween(1, 100))
				.flatMap(function(limit) {
					const aggregate = Boolean.random();

					return facebook
						.getPagePostsObservable({
							aggregate : aggregate,
							pageId : faker.id(),
							limit : limit
						})
						.doOnNext(function(val) {
							const data = val.data, error = val.error;

							if (error.isEmpty()) {
								/**
								 * If aggregate is set to true, we expect all 
								 * results to be delivered after all posts 
								 * have been fetched.
								 */
								if (aggregate) {
									assert.equal(data.length, limit);
								} else {
									/**
									 * Otherwise, if aggregate is false, we 
									 * expect results to be emitted 
									 * periodically, and the length of the 
									 * post array should be less than or equal 
									 * to the specified resultPerPage.
									 */
									assert.isTrue(data.length <= limit);
								}
							} else {
								assert.isTrue(data.length < limit);
							}
						})
				})
				.subscribe(
					function(val) {},

					function(err) {
						throw err;
					},

					function() {
						done();
					}
				);
		}
	)
});