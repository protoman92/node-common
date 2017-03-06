const
	assert = require("chai").assert,
	rx = require("rx"),
	sinon = require("sinon"),
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	sharedAuthDir = sharedHandlerDir + "/auth",
	sharedFirebaseAuthDir = sharedAuthDir + "/firebase",
	login = require(sharedFirebaseAuthDir + "/login.js"),
	signup = require(sharedFirebaseAuthDir + "/signup.js"),
	oauth = require(sharedFirebaseAuthDir + "/oauth.js"),
	utils = require(sharedHandlerDir + "/util/common.js"),
	AuthData = require(sharedAuthDir + "/authData.js");

const 
	correctPassword = "password",
	correctUsername = "username1@gmail.com",
	invalidUsername = "abc",
	wrongUsername = "username2@gmail.com",
	wrongPassword = "abc";

function MockAuthenticator() {
	return {
		signInWithEmailAndPassword : function(username, password) {
			return new Promise((resolve, reject) => {
				if (username.isEmail()) {
					resolve(sinon.stub(AuthData()));
				} else {
					reject(Error("Invalid email"));
				}
			});
		},

		createUserWithEmailAndPassword : function(username, password) {
			return new Promise((resolve, reject) => {
				if (username.isEmail()) {
					resolve(sinon.stub(AuthData()));
				} else {
					reject(Error("Invalid email"));
				}
			});
		},

		signOut : function() {
			return new Promise((resolve, reject) => {
				resolve("Signed out");
			});
		}
	};
};

const loginWithInvalidCredentials = function(args) {
	assert.isDefined(args);
	assert.isNotNull(args);

	const
		authDataHandler = sinon.spy((args) => {
			Error.debugException("Should not be called");
		}),
		newArgs = {
			authenticator : args.authenticator,
			authDataHandler : authDataHandler,
			username : args.username || invalidUsername,
			password : args.password || wrongPassword
		};

	login.manualLogInObservable(newArgs)
		.subscribe(
			function(val) {},

			function(err) {
				assert.isDefined(err);
				assert.isNotNull(err);
				assert.equal(authDataHandler.called, 0);
				args.done();
			}
		);
};

const loginWithValidCredentials = function(args) {
	assert.isDefined(args);
	assert.isNotNull(args);

	const newArgs = {
		authenticator : args.authenticator,
		data : {},
		username : args.username || correctUsername,
		password : args.password || correctPassword
	};

	signup.manualSignupObservable(newArgs)
		.flatMap(val => login.logOutObservable(newArgs))
		.flatMap(val => login.manualLogInObservable(newArgs))
		.doOnNext(function(val) {
			assert.isDefined(val);
			assert.isDefined(val.authData);
			assert.isNotNull(val.authData);
		})
		.subscribe(
			function(val) {},

			function(err) {
				console.log(err);
				throw err;
			},

			function() {
				args.done();
			}
		);
};

const signUpWithInvalidCredentials = function(args) {
	assert.isDefined(args);
	assert.isNotNull(args);

	const newArgs = {
		authenticator : args.authenticator,
		data : {},
		username : args.username || invalidUsername,
		password : args.password || wrongPassword
	};

	signup.manualSignupObservable(newArgs)
		.subscribe(
			function(val) {},

			function(err) {
				assert.isDefined(err);
				assert.isNotNull(err);
				args.done();
			}
		);
};

const signUpWithValidCredentialsAndNoData = function(args) {
	assert.isDefined(args);
	assert.isNotNull(args);

	const newArgs = {
		authenticator : args.authenticator,
		data : {},
		username : args.username || correctUsername,
		password : args.password || correctPassword
	};

	signup.manualSignupObservable(newArgs)
		.filter(args => args.data && utils.getKeys(args.data).length)
		.throwIfEmpty(Error("User data not present"))
		.subscribe(
			function(val) {},

			function(err) {
				assert.isDefined(err);
				assert.isNotNull(err);
				args.done();
			}
		);
};

const signUpWithValidCredentialsAndData = function(args) {
	assert.isDefined(args);
	assert.isNotNull(args);

	const newArgs = {
		authenticator : args.authenticator,
		data : args,
		username : args.username || correctUsername,
		password : args.password || correctPassword
	};

	signup.manualSignupObservable(newArgs)
		.filter(args => args.data && args.authData && utils.getKeys(args.data).length)
		.throwIfEmpty(Error("Missing data"))
		.subscribe(
			val => {},

			err => {
				console.log(err);
				throw err;
			},

			() => {
				args.done();
			}
		);
};

describe("Mock Auth", function() {
	before(() => {});
	after(() => {});

	const mockAuth = new MockAuthenticator();

	it(
		"Mock login with invalid credentials should throw an error", 
		function(done) {
			const args = {
				authenticator : mockAuth,
				done : done
			};

			loginWithInvalidCredentials(args);
		}
	);

	it(
		"Mock login with valid credentials should complete",
		function(done) {
			const args = {
				authenticator : mockAuth,
				done : done
			};

			loginWithValidCredentials(args);
		}
	);

	it(
		"Mock signup with invalid credentials should throw an error",
		function(done) {
			const args = {
				authenticator : mockAuth,
				done : done
			};

			signUpWithInvalidCredentials(args);
		}
	);

	it(
		"Mock signup with valid credentials but no user data should throw an error",
		function(done) {
			const args = {
				authenticator : mockAuth,
				done : done
			};

			signUpWithValidCredentialsAndNoData(args);
		}
	);

	it(
		"Mock signup with valid credentials and user data should complete",
		function(done) {
			const args = {
				authenticator : mockAuth,
				done : done
			};

			signUpWithValidCredentialsAndData(args);
		}
	);
});

describe("Actual Auth", function() {
	var auth;

	before(function(done) {
		const firebase = require("firebase");

		if (!firebase.apps.length) {
			const credentials = require(baseDir + "/credentials/credential.js");
			firebase.initializeApp(credentials.firebase);
		}

		auth = require("firebase").auth();
		done();
	});

	afterEach(function(done) {
		const args = {
			authenticator : auth,
			username : correctUsername,
			password : correctPassword
		};

		login.manualLogInObservable(args)
			.map(val => auth.currentUser)
			.filter(user => user && true)
			.defaultIfEmpty("")
			.flatMap(user => rx.Observable.fromPromise(user.delete()))
			.onErrorReturn(false)
			.subscribe(
				val => {
					console.log(val);
				},

				err => {
					console.log(err);
					throw err;
				},

				() => {
					done();
				}
			);
	});

	it(
		"Login with invalid credentials should throw an error", 
		function(done) {
			loginWithInvalidCredentials({
				authenticator : auth,
				done : done
			});
		}
	);

	it(
		"Login with valid credentials should complete",
		function(done) {
			loginWithValidCredentials({
				authenticator : auth, 
				done : done
			});
		}
	);

	it(
		"Signup with invalid credentials should throw an error",
		function(done) {
			signUpWithInvalidCredentials({
				authenticator : auth,
				done : done
			});
		}
	);

	it(
		"Signup with valid credentials but no user data should throw an error",
		function(done) {
			signUpWithValidCredentialsAndNoData({
				authenticator : auth,
				done : done
			});
		}
	);

	it(
		"Signup with valid credentials and user data should complete",
		function(done) {
			signUpWithValidCredentialsAndData({
				authenticator : auth,
				done : done
			});
		}
	);
});