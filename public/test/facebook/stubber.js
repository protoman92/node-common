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
	utils = require(sharedHandlerDir + "/util/common.js"),
	FacebookPost = require(sharedHandlerDir + "/facebook/post.js");

utils.includeUtils();

module.exports = {
	stub : function(args) {
		const api = facebook.api;

		api.getPagePosts = sinon.spy(function(path, params, callback) {
			const 
				posts = Number.range(25)
					.map(val => FacebookPost.newBuilder()
						.withId(faker.id())
						.withObjectId(faker.id())
						.withCreatedTime(String(new Date().getTime()))
						.withMessage("")
						.withStory("")
						.build()),

				res = {
					data : posts,

					paging : {
						previous : "Previous",
						next : "Next"
					}
				},

				throwError = Boolean.random();

			if (throwError) {
				callback(new Error("Failed to fetch data"), null);
			} else {
				callback(null, res);
			}
		});
	},

	restore : function(args) {
		utils.getValues(facebook.api).forEach(function(method) {
			if (method && Function.isInstance(method.restore)) {
				method.restore();
			}
		});
	}
};