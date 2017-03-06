const 
	graph = require("fbgraph"),
	request = require("request"),
	rx = require("rx"),
	status = require("http-status-codes"),
	baseDir = "../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js"),
	FacebookPost = require(sharedHandlerDir + "/facebook/post.js");

const main = this;

exports.api = {
	getAccessToken : graph.getAccessToken,
	getPagePosts : graph.get,
	getPicture : graph.get,
	getPostObjectId : graph.get,
	getPostWithFields : graph.get,
	getPostSummary : graph.get,
	getUserProfile : graph.get,
	handleToken : request.get,
	setAccessToken : graph.setAccessToken
};

///////////////////////////
// General Facebook APIs //
///////////////////////////

/**
 * Acquire a new token from Graph API, or reuse an existing one.
 * @param  {object} args This parameter may optionally contain the credentials
 * key, which represents a json object with facebookId and facebookSecret.
 * @return {rx.Observable} An Observable object.
 */
exports.handleTokenObservable = function(args) {
	const existingToken = main.api.getAccessToken();
	
	if (existingToken) {
		return rx.Observable.just(existingToken);
	} else {
		const 
			credentialPath = baseDir + "/credentials/credential.js",
			credentials = (args || {}).credentials || require(credentialPath),
			facebookId = credentials.facebook.id,
			facebookSecret = credentials.facebook.secret;

		if 
			(facebookId && facebookSecret && 
			(String.isInstance(facebookId, facebookSecret))) 
		{
			return rx.Observable.create(function(observer) {
				const
					api = main.api.handleToken,

					urlParams = {
						url : "https://graph.facebook.com/oauth/access_token",

						qs : {
							client_id : facebookId,
							client_secret : facebookSecret,
							grant_type : "client_credentials"
						}
					};

				api(urlParams, function(err, res, body) {
					if (err) {
						observer.onError(Error.networkError(err));
					} else {
						const token = /\={1}(\w+\|\w+)/.exec(body)[1];
						main.api.setAccessToken(token);
						observer.onNext(token);
						observer.onCompleted();
					}
				});
			});
		}
	}

	Error.debugException(args);
	return rx.Observable.empty();
};

/**
 * Get the picture urls from /picture endpoint for profiles/pages.
 * @param  {object} args This parameter must contain the id of the target.
 * @return {rx.Observable} An Observable object.
 */
exports.getPictureObservable = function(args) {
	if (args && args.id && String.isInstance(args.id)) {
		return rx.Observable.just(args)
			.flatMap(args => main
				.handleTokenObservable(args)
				.map(val => ["", args.id, "picture"].join("/")))
			.create(function(path, observer) {
				const api = main.api.getPicture;

				api(path, function(err, res) {
					if (err) {
						observer.onError(err);
					} else {
						observer.onNext(res);
						observer.onCompleted();
					}
				});
			})
			.filter(res => res && res.image && res.location)
			.map(res => res.location)
			.onErrorSwitchToEmpty()
			.defaultIfEmpty("");
	}

	Error.debugException(args)
	return rx.Observable.just("");
};

////////////////////////////
// Facebook Page handling //
////////////////////////////

/**
 * Get all posts by a page.
 * @param  {object} args This parameter must contain the pageId key, which 
 * identifies a Facebook page. Optionally, it can specify whether to aggregate 
 * the results or continually emit result sets one by one via the aggregate 
 * key. The limit key can be used to control the number of posts being pulled.
 * @return {rx.Observable} An Observable object.
 */
exports.getPagePostsObservable = function(args) {
	if (args && args.pageId && String.isInstance(args.pageId)) {
		var postCount = 0;

		const getUntilDone = function(args, res) {
			const limit = parseInt(args.limit || Number.MAX_SAFE_INTEGER);

			var path;

			if (!res) {
				path = ["", args.pageId, "posts"].join("/");
			} else if (res && res.paging && res.paging.next) {
				path = res.paging.next;
			} else {
				/**
				 * In this case, we have reached the last page and thus 
				 * there are no more results to be fetched.
				 */
				return rx.Observable.empty();
			}

			return rx.Observable
				.create(function(observer) {
					if (postCount < limit) {
						/**
						 * The maximum limit for a Graph request is 100.
						 */
						const 
							params = {limit : Math.min(limit, 100)},
							api = main.api.getPagePosts;

						api(path, params, function(err, res) {
							if (err) {
								observer.onError(err);
							} else {
								observer.onNext(res);
								observer.onCompleted();
							}
						});
					} else {
						observer.onCompleted();
					}
				})
				.filter(res => res && res.data && res.data.length)
				.map(function(res) {
					/**
					 * We need to replace the data in the response with a
					 * slice copy whose length equals the min between 
					 * (limit - postCount) and original length.
					 */
					const data = res.data, min = limit - postCount;
					res.data = data.slice(0, Math.min(min, data.length));
					return res;
				})
				/**
				 * Retry twice, and then after all retries have been 
				 * exhausted, return a default object.
				 */
				.retry(2)
				.catchThenReturn(function(err) {
					/**
					 * The error key is used to alert users of thrown
					 * exceptions. However, since paging.next is not available,
					 * this is where the stream terminates.
					 */
					return {data : [], error : [err.message]};
				})
				.emitThenResume(function(val) {
					postCount += val.data.length;
					return getUntilDone(args, val);
				});
		};

		var source = getUntilDone(args, null)
			.filter(res => res && res.data)
			.map(function(res) {
				return {data : res.data, error : res.error || []};
			})
			.map(function(res) {
				const data = res.data
					.map(args => FacebookPost
						.newBuilder()
						.withPostData(args)
						.build())
					.filter(post => post.hasAllRequiredInformation());

				res.data = data;
				return res;
			});

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

		return main.handleTokenObservable(args).flatMap(val => source);
	}

	Error.debugException(args);
	return rx.Observable.just(undefined);
};

////////////////////////////
// Facebook Post handling //
////////////////////////////

/**
 * Usually the Post's id we get from other requests is a concatenation of the
 * page's id and another uuid. Therefore, we need to fetch the post's object_id
 * before we can access its available endpoints.
 * @param  {object} args This parameter must contain the post's concatenated 
 * id.
 * @return {rx.Observable} An Observable object.
 */
exports.getPostObjectIdObservable = function(args) {
	if (args && args.id && String.isInstance(args.id)) {
		return rx.Observable.just(args)
			.flatMap(args => main
				.handleTokenObservable(args)
				.map(val => ["", args.id].join("/"))
				.create(function(path, observer) {
					const 
						params = {fields : "object_id"},
						api = main.api.getPostObjectId;

					api(path, params, function(err, res) {
						if (err) {
							observer.onError(err);
						} else {
							observer.onNext(res);
							observer.onCompleted();
						}
					});
				})
				.filter(res => res && res.object_id)
				.onErrorSwitchToEmpty()
				.defaultIfEmpty({id : "", object_id : ""})
				.map(function(res) {
					if (Boolean.cast(args.keepBothIds)) {
						return res;
					} else {
						return res.object_id
					}
				}));
	}

	Error.debugException();
	return rx.Observable.just("");
};

/**
 * Get a Facebook post by id.
 * @param  {object} args This parameter must contain the post's Facebook id.
 * @return {rx.Observable} An Observable object.
 */
exports.getPostSummaryObservable = function(args) {
	if (args && args.id && String.isInstance(args.id)) {
		return rx.Observable.just(args)
			.flatMap(args => main.handleTokenObservable(args))
			.map(val => ["", args.id].join("/"))
			.create(function(path, observer) {
				const api = main.api.getPostSummary;

				api(path, function(err, res) {
					if (err) {
						observer.onError(err);
					} else {
						observer.onNext(res);
						observer.onCompleted();
					}
				});
			});
	}

	Error.debugException(args);
	return rx.Observable.just(undefined);
};

/**
 * Get a Facebook Post with the specified field values.
 * @param  {object} args This parameter must contain the fields key, which
 * represents an Array of Post fields to be fetched.
 * @return {rx.Observable} An Observable object.
 */
exports.getPostWithFieldsObservable = function(args) {
	if (args && Array.isInstance(args.fields) && args.fields.length) {
		var newArgs = utils.clone(args);
		newArgs.keepBothIds = true;

		return rx.Observable.just(newArgs)
			.flatMap(args => main
				.getPostObjectIdObservable(args)
				.flatMap(function(idArgs) {
					const 
						fields = FacebookPost.Fields.fromValues(args.fields),
						id = idArgs.id || "",
						objectId = idArgs.object_id || "",

						/**
						 * For this node, some fields require the object_id
						 * while some others just need regular id. Therefore,
						 * we need to partition the fields into two sets of
						 * fields: one set comprises fields which require
						 * object_id, while the other consists of those that
						 * do not. Later we will need to merge the responses
						 * into a single FacebookPost object.
						 */
						parts = fields.partition(function(val) {
							return val && val.requiresObjectId == true;
						});

					return rx.Observable.from(parts)
						.create(function(part, observer) {
							var postId;

							if ((part[0] || {}).requiresObjectId) {
								postId = objectId;
							} else {
								postId = id; 
							}

							const
								api = main.api.getPostWithFields,
								fields = part.map(field => field.value), 
								path = ["", postId].join("/"),
								params = {fields : fields.join(",")};

							api(path, params, function(err, res) {
								if (err) {
									observer.onError(err);
								} else {
									observer.onNext(res);
									observer.onCompleted();
								}
							});
						})
						.reduce((a, b, idx, obs) => Object.assign(a, b), {})
						.map(args => FacebookPost
							.newBuilder()
							.withId(id)
							.withObjectId(objectId)
							.withPostData(args)
							.build()
						);
				})
			)
	}
};

////////////////////////////
// Facebook User handling //
////////////////////////////

/**
 * Get a user's profile with an Access Token.
 * @param  {object} args This parameter must contain the access token that will be
 * used to access the user's Facebook profile. This token should be acquired via 
 * Oauth and is different from the global App Access Token.
 * @return {rx.Observable} An Observable object.
 */
exports.getUserProfileObservable = function(args) {
	if (args && args.token && String.isInstance(args.token)) {
		return rx.Observable.just(args)
			.flatMap(args => main
				.handleTokenObservable()
				.map(args => "/me?access_token=" + args.token))
			.create(function(path, observer) {
				const api = main.api.getUserProfile;

				api(path, function(err, res) {
					if (err) {
						observer.onError(err);
					} else {
						observer.onNext(res);
						observer.onCompleted();
					}
				});
			});
	}

	Error.debugException(args);
	return rx.Observable.just(undefined);
};