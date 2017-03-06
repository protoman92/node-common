const 
	rx = require("rx"),
	status = require("http-status-codes"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedPublicDir = sharedDir + "/public",
	common = require(sharedHandlerDir + "/auth/firebase/common.js"),
	localizer = require(sharedHandlerDir + "/localizer.js"),
	localizable = require(sharedPublicDir + "/localization/localizable.js"),
	AuthData = require(sharedHandlerDir + "/auth/authData.js");

const main = this;

/**
 * Handle post authentication. Create an AuthData object from the returned credentials, and
 * pass it to the handler specified in the args parameter.
 * @param  {object} args This parameter must contain the task and authDataHandler keys. The task
 * key represents a Promise object that was created by Firebase Authentication. The authDataHandler
 * identifies a function that handles the returned AuthData and returns an Observable object.
 * @return {rx.Observable} an Observable object.
 */
exports.postAuthenticationHandler = function(args) {
	if (args && Function.isInstance(args.task)) {
		return rx.Observable.just(args)
			.flatMap(args => rx.Observable
				.fromPromise(task())
				.map(val => AuthData.newBuilder()
					.withFirebaseUser(val)
					.build())
				.map(function(authData) {
					return {
						authData : authData,
						token : args.token
					};
				}));
	}

	Error.debugException();
	const error = localizer.localize(req, localizable.authErrorUnauthorized);
	return rx.Observable.throw(error);
};

exports.facebookLoginObservable = function(args) {
	if (args && args.token && String.isInstance(args.token)) {
		const
			/**
			 * Here we can have the caller pass an Authenticator object to this function
			 * or directly request for one from Firebase. This helps with mock testing.
			 * @type {object} A Firebase Authenticator object.
			 */
			auth = args.authenticator || require("firebase").auth(),
			credential = firebase.auth.FacebookAuthProvider.credential(token),
			task = () => auth.signInWithCredential(credential);

		return main.postAuthenticationHandler({task : task, token : args.token});
	}

	Error.debugException();
	const error = localizer.localize(req, localizable.authErrorUnauthorized);
	return rx.Observable.throw(error);
};

exports.authenticationObserver = common.authenticationObserver;