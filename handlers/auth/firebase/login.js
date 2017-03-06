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
			.flatMap(args => rx.Observable.fromPromise(task()))
			.map(val => AuthData.newBuilder()
				.withFirebaseUser(val)
				.build())
			.map(function(authData) {
				return {authData : authData};
			});
	}

	Error.debugException();
	const error = localizer.localize(req, localizable.authErrorUnauthorized);
	return rx.Observable.throw(error);
};

/**
 * Manual login with Firebase Authentication.
 * @param  {object} args This parameter must contain the username and password keys.
 * @return {rx.Observable} an Observable object.
 */
exports.manualLogInObservable = function(args) {
	if 
		(args && 
		(args.username) && 
		(args.password) &&
		(String.isInstance(args.username, args.password)))
	{
		const 
			username = args.username, 
			password = args.password;

			/**
			 * Here we can have the caller pass an Authenticator object to this function
			 * or directly request for one from Firebase. This helps with mock testing.
			 * @type {object} A Firebase Authenticator object.
			 */
			auth = args.authenticator || require("firebase").auth(),
			task = () => auth.signInWithEmailAndPassword(username, password);

		return main.postAuthenticationHandler({task : task});
	} else {
		Error.debugException();
	}

	const error = localizer.localize(req, localizable.authErrorUnauthorized);
	return rx.Observable.throw(error);
};

exports.logOutObservable = function(args) {
	const auth = (args || {}).authenticator || require("firebase").auth();
	return rx.Observable.fromPromise(auth.signOut());
};

exports.authenticationObserver = common.authenticationObserver;