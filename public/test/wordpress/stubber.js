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
	utils = require(sharedHandlerDir + "/util/common.js"),
	wordpress = require(sharedHandlerDir + "/wordpress/wordpress.js"),
	WordpressPost = require(sharedHandlerDir + "/wordpress/post.js");

utils.includeUtils({});

module.exports = {
	stub : function(args) {
		const api = wordpress.api;

		api.checkAvailability = function(args, callback) {
			callback(null, true, null);
		};

		api.getPagePosts = function(args) {
			return {
				posts : function() {
					var promise = new Promise(function(resolve, reject) {
						const resolved = Boolean.random(0.1);

						if (resolved) {
							const posts = Number.range(100)
								.map(number => WordpressPost.newBuilder()
								.withId(faker.id())
								.withGuid(faker.id())
								.build());

							resolve(posts);
						} else {
							reject(new Error("Failed to fetch posts"));
						}
					});

					promise.postsPerPage = 100;
					promise.pageNumber = 1;

					promise.perPage = function(number) {
						promise.postsPerPage = number;
						return promise;
					};

					promise.page = function(number) {
						promise.pageNumber = number;
						return promise;
					};

					return promise;
				}
			};
		};
	},

	restore : function(args) {
		utils.getValues(wordpress.api).forEach(function(method) {
			if (Function.isInstance(method.restore)) {
				method.restore();
			}
		});
	}
};