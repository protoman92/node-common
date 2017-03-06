const
	rx = require("rx"),
	baseDir = "../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

function DatabaseEvent() {};

DatabaseEvent.Type = {
	allChildEvents : function() {
		const type = DatabaseEvent.Type;

		return [
			type.CHILD_ADDED,
			type.CHILD_CHANGED,
			type.CHILD_REMOVED,
		]
	},

	allEvents : function() {
		const type = DatabaseEvent.Type;
		var events = type.allChildEvents();
		events.push(type.VALUE);
		return events;
	},

	fromValue : function(value) {
		const types = DatabaseEvent.Type.allEvents();
		return types.filter(event => event.value == value)[0];
	},

	CHILD_ADDED : {
		value : "child_added",
		childAdded : true
	},

	CHILD_CHANGED : {
		value : "child_changed",
		childChanged : true
	},

	CHILD_REMOVED : {
		value : "child_removed",
		childRemoved : true
	},

	VALUE : {
		value : "value"
	}
};

exports.DatabaseEvent = DatabaseEvent;

/**
 * Register event listener for a path.
 * @param  {object} args This parameter must contain the path key.
 * @return {rx.Observable} an Observable object.
 */
exports.registerEventListenerObservable = function(args) {
	if 
		(args && 
		(args.path) && 
		(args.events) &&
		(String.isInstance(args.path)) &&
		(Array.isInstance(args.events)))
	{
		const 
			path = args.path, events = args.events,
			database = require("firebase-admin").database(),
			ref = database.ref(path);

		return rx.Observable.create(observer => {
			const createListener = function(type) {
				return {
					type : type.value,

					listener : ref.on(type.value, function(snap) {
						const newArgs = {
							id : snap.key,
							data : snap.val(),
							type : type.value,
							path : path,
							childAdded : type.childAdded || false,
							childChanged : type.childChanged || false,
							childRemoved : type.childRemoved || false
						};

						observer.onNext(newArgs);
					})
				}
			};
			
			const listeners = events.map(event => createListener(event));

			return () => {
				listeners.forEach(args => ref.off(args.type, args.listener));
			}
		});
	}

	Error.debugException();
	return rx.Observable.empty();
};

/**
 * Convenience method to initialize Firebase. This method depends on the existence
 * of a credential.js that holds API keys.
 * @param  {object} args Placeholder parameter.
 */
exports.initializeFirebase = function(args) {
	const 
		admin = require("firebase-admin"),
		firebase = require("firebase"),
		credentialPath = baseDir + "/credentials/credential.js",
		credentials = (args || {}).credentials || require(credentialPath);

	admin.initializeApp({
		credential: admin.credential.cert(credentials.serviceAccount),

	  	databaseURL: credentials.firebase.databaseURL,

	  	databaseAuthVariableOverride: {
	  		uid: credentials.firebaseUid
	  	}
	});	

	firebase.initializeApp(credentials.firebase);
};