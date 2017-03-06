const
	assert = require("chai").assert,
	rx = require("rx"),
	sinon = require("sinon"),
	WPAPI = require("wpapi"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	nodeModuleDir = baseDir + "/node_modules",
	faker = require(sharedPublicDir + "/test/util/faker.js"),
	stubber = require(sharedPublicDir + "/test/wordpress/stubber.js"),
	utils = require(sharedHandlerDir + "/util/common.js"),
	wordpress = require(sharedHandlerDir + "/wordpress/wordpress.js"),
	WordpressPost = require(sharedHandlerDir + "/wordpress/post.js"),
	WPRequest = require(nodeModuleDir + "/wpapi/lib/constructors/wp-request");

utils.includeUtils({});

const 
	url = "https://blog.mozilla.org/",
	totalPostCount = 1000,
	stubClient = true;

describe("Function Tests", function() {
	this.timeout(1000000);

	before(function(done) {
		if (stubClient) {
			stubber.stub();
		}

		done();
	});

	after(function(done) {
		if (stubClient) {
			stubber.restore();
		}

		done();
	});

	it(
		"WP Posts should be correctly fetched",
		function(done) {
			var postCount = 0;

			rx.Observable.range(1, 1)
				.map(number => 5)
				.flatMap(function(limit) {
					const 
						aggregate = Boolean.random(),

						args = {
							url : url,
							aggregate : aggregate,
							limit : limit
						};

					return wordpress
						.getPagePostsObservable(args)
						.doOnNext(function(val) {
							const data = val.data, error = val.error;
							postCount += data.length;

							if (error.isEmpty()) {
								if (aggregate) {
									/**
									 * If we aggregate the results, there will
									 * only be one emission, so we need to 
									 * check whether the item length equals 
									 * the limit.
									 */
									const min = Math.min(limit, postCount);
									assert.equal(data.length, min);
								} else {
									/**
									 * If aggregate is false, there will be 
									 * more than one emission, so we need to 
									 * check if the item length is less than/
									 * equal to the limit.
									 */
									assert.isTrue(data.length <= limit);
								}
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
	);
});