const 
	request = require("request"),
	rx = require("rx"),
	status = require("http-status-codes"),
	WPAPI = require("wpapi"),
	baseDir = "../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	sharedWordpressDir = sharedHandlerDir + "/wordpress",
	sharedLocalizationDir = sharedPublicDir + "/localization",
	localizer = require(sharedHandlerDir + "/localizer.js"),
	localizable = require(sharedLocalizationDir + "/localizable.js"),
	utils = require(sharedHandlerDir + "/util/common.js"),
	WordpressPost = require(sharedWordpressDir + "/post.js"),
	WordpressTag = require(sharedWordpressDir + "/tag.js");

const main = this;

exports.api = {
	checkAvailability : request.head,
	getAllPostInformation : WPAPI,
	getPagePosts : WPAPI,
	getPost : WPAPI,
	getTag : WPAPI
};

exports.fullUrlFromUrl = function(url) {
	return [url, "wp-json"].join("/");
};

///////////////////////////
// General Wordpress API //
///////////////////////////

/**
 * Check whether Wordpress API is available on a website, by sending a HEAD
 * request to wp-json endpoint.
 * @param  {object} args This parameter must contain the url key, which
 * represents the website's url address.
 * @return {rx.Observable} An Observable object.
 */
exports.checkAvailabilityObservable = function(args) {
	if (args && args.url && String.isInstance(args.url)) {
		return rx.Observable.just(args)
			.flatMap(args => rx.Observable
				.just(main.fullUrlFromUrl(args.url))
				.create(function(path, observer) {
					const api = main.api.checkAvailability;

					api({url : path}, function(err, res, body) {
						if (err) {
							observer.onError(Error.networkError(err));
							return;
						} else if (res.statusCode === status.NOT_FOUND) {
							observer.onNext(false);
						} else {
							observer.onNext(true);
						}

						observer.onCompleted();
					});
				})
				.timeout(10000, false)
				.flatMapIfSatisfied(
					val => Boolean.cast(
						utils.concreteValue(args.raiseException, true)
					),

					function(val, obs) {
						const 
							message = localizable.wordpressErrorNotAvailable,
							error = Error.networkError(message);

						return obs
							.filter(available => available)
							.throwIfEmpty(error);
					}
			));
	}

	Error.debugException();
	return rx.Observable.just(false);
};

/**
 * We can stub this method to provide a mock client implementation.
 * @param  {object} args This can be either a String, which will be used
 * as the client's endpoint, or an object with a url parameter.
 * @return {WPAPI} A WPAPI object.
 */
exports.client = function(args) {
	if (String.isInstance(args)) {
		return new WPAPI({endpoint : args});
	} else if (Object.isInstance(args)) {
		return new WPAPI({
			endpoint : main.fullUrlFromUrl(args.url)
		});
	}

	return new WPAPI({});
};

////////////////////////
// Wordpress Post API //
////////////////////////

/**
 * Get all posts from a WPAPI-enabled website. This method loops and emits
 * items periodically until either there are no more results to be fetched,
 * or the post limit is reached.
 * @param  {object} args This parameter must contain the url key, which
 * represents the website's url. It can optionally specify a limit on the
 * number of posts to be fetched, and whether the responses should be
 * aggregated into one.
 * @return {rx.Observable} An Observable object.
 */
exports.getPagePostsObservable = function(args) {
	var postCount = 0, pageNumber = 1;

	const getUntilDone = function(args) {
		const limit = parseInt(args.limit || Number.MAX_SAFE_INTEGER);

		var path;

		if (args.url && String.isInstance(args.url) && postCount < limit) {
			path = main.fullUrlFromUrl(args.url);
		} else {
			/* In this case, we have reached the last page and thus there 
			 * are no more results to be fetched.
			 */
			return rx.Observable.empty();
		}

		return rx.Observable.just(path)
			.flatMap(path => main.api.getPagePosts({endpoint : path})
				.posts()
				/**
				 * The maximum result per page is 100. Any larger than that
				 * and WPAPI will throw an error.
				 */
				.perPage(Math.min(limit, 100))
				/**
				 * Pagination is achieved by incrementing a pageNumber 
				 * variable, since the response does not include a next link.
				 */
				.page(pageNumber)
			)
			/**
			 * The result should be an array of posts.
			 */
			.filter(data => data && data.length && Array.isInstance(data))
			.map(function(data) {
				/**
				 * We need to replace the data in the response with a 
				 * slice copy whose length equals the min between 
				 * (limit - postCount) and original length.
				 */
				return data.slice(0, Math.min(limit - postCount, data.length));
			})
			.map(function(data) {
				return {data : data};
			})
			/**
			 * Retry twice with the same page number if there's an error.
			 */
			.retry(2)
			/**
			 * If after all retries and there's still an error, return an
			 * empty array and continue with the next loop.
			 */
			.catchThenReturn(function(err) {
				/**
				 * The error key is used to alert users of thrown
				 * exceptions. However, since paging.next is not available,
				 * this is where the stream terminates.
				 */
				return {data : [], error : [err]};
			})
			.emitThenResume(function(val) {
				postCount += val.data.length;
				pageNumber += 1;
				return getUntilDone(args);
			});
	};

	var source = rx.Observable.just(args)
		.flatMap(args => getUntilDone(args)
			.map(function(res) {
				return {data : res.data, error : res.error || []};
			})
			.map(function(res) {
				const data = res.data
					.map(args => WordpressPost
						.newBuilder()
						.withPostData(args)
						.build())
					.filter(post => post.hasAllRequiredInformation());

				res.data = data;
				return res;
			})
		);

	if (utils.concreteValue(args.aggregate, false)) {
		source = source
			.toArray()
			.map(arrays => arrays.reduce(function(a, b) {
				if (Array.isInstance(a.data, b.data)) {
					a.data = a.data.concat(b.data);
				}

				if (Array.isInstance(a.error, b.error)) {
					a.error = a.error.concat(b.error);
				}

				return a;
			}, {data : [], error : []}));
	}

	return main.checkAvailabilityObservable(args).flatMap(val => source);
};

/**
 * Get a post based on its Wordpress id.
 * @param  {object} args This parameter must contain the id key, which
 * represents the post's WP id, as well as the website's url.
 * @return {rx.Observable} An Observable object.
 */
exports.getPostObservable = function(args) {
	if (args && args.id && args.url && String.isInstance(args.id, args.url)) {
		return rx.Observable.just(args)
			.flatMap(args => main
				.checkAvailabilityObservable(args)
				.flatMap(val => main.api.getPost(args).posts().id(args.id))
				.map(data => WordpressPost
					.newBuilder()
					.withPostData(data)
					.build())
				.flatMap(function(post) {
					var newArgs = {url : args.url, post : post};
					return main.getAllPostInformationObservable(newArgs);
				})
			);
	}

	Error.debugException(args);
	return rx.Observable.just(WordpressPost.BLANK);
};

/**
 * Some information, such as author and tags, are in id form. Therefore, if
 * required, we pull these data from Wordpress and add to the posts as well.
 * @param  {object} args This parameter must contain the id and post keys.
 * @return {rx.Observable} An Observable object.
 */
exports.getAllPostInformationObservable = function(args) {
	if 
		(args && args.url && args.post && 
		(String.isInstance(args.url)) && 
		(WordpressPost.isInstance(args.post))) 
	{
		var obs = [];

		const 
			client = main.api.getAllPostInformation(args),
			post = args.post, 
			fields = WordpressPost.Fields;

		var newArgs = utils.clone(args);
		newArgs.client = client;

		if (utils.concreteValue(newArgs.getTags, false)) {
			const nameField = WordpressTag.Fields.NAME.value;

			obs.push(main.getTagsForPostObservable(newArgs)
				.map(tags => tags.map(tag => tag[nameField]))
				.doOnNext(function(tags) {
					post[fields.TAGS.value] = tags;
				}));
		}

		/**
		 * At the end of the retrieval process, we emit back the amended
		 * post.
		 */
		return rx.Observable.concat(obs).toArray().map(val => post);
	}

	Error.debugException(args);
	return rx.Observable.empty();
};

///////////////////////
// Wordpress Tag API //
///////////////////////

/**
 * Get a Tag object based on an id.
 * @param  {object} args This parameter must contain the id and url keys,
 * which represent the tag's id and the website's address, respectively.
 * @return {rx.Observable} An Observable object.
 */
exports.getTagObservable = function(args) {
	if (args && (args.url && String.isInstance(args.url)) || args.client) {
		return rx.Observable.just(args)
			.flatMap(function(args) {
				var source;

				if (args.id && String.isInstance(args.id)) {
					source = rx.Observable.just(args.id);
				} else if (args.tags && Array.isInstance(args.tags)) {
					source = rx.Observable.from(args.tags);
				} else {
					const error = localizable.wordpressErrorTagNotFound;
					return rx.Observable.throw(Error.networkError(error));
				}

				const wp = args.client || main.api.getTag(args);

				return source
					.flatMap(id => wp.tags().id(id))
					.map(data => WordpressTag
						.newBuilder()
						.withTagData(data)
						.build())
					.filter(tag => tag.hasAllRequiredInformation())
					.onErrorSwitchToEmpty();
			});
	}

	Error.debugException(args);
	return rx.Observable.empty();
};

/**
 * Get a list of tags for a post.
 * @param  {object} args This parameter must contain the url and post keys.
 * The url key represents the website's address, and the post identifies a
 * WordpressPost object from which we get a list of tag ids.
 * @return {rx.Observable} An Observable object.
 */
exports.getTagsForPostObservable = function(args) {
	var newArgs = utils.clone(args);
	newArgs.tags = args.post[WordpressPost.Fields.TAGS.value];
	return main.getTagObservable(newArgs).toArray();
};