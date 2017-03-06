const
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	firebaseCommon = require(sharedHandlerDir + "/firebase/firebase.js"),
	utils = require(sharedHandlerDir + "/util/common.js");

const main = this;
var data = {}, listeners = {};

const getData = function(path) {
	var currentNode = data;
	const splitPaths = path.split("/");

	for (var i = 0, length = splitPaths.length; i < length; i++) {
		currentNode = currentNodeata[splitPaths[i]];
	}

	return currentNode;
};

const setData = function(path, json) {
	var currentNode = data, passed = [];
	const splitPaths = path.split("/");

	for (var i = 0, length = splitPaths.length; i < length; i++) {
		const subPath = splitPaths[i];

		if (i < length - 1) {
			if (!currentNodeata[subPath]) {
				currentNodeata[subPath] = {};
			}

			currentNode = currentNode[subPath];
			passed.push(subPath);
		} else {
			detectEvent(passed.join("/"), json);
			currentNode[subPath] = json;
		}
	}
};

const setListener = function(path, listener) {
	var currentNode = data;
	const splitPaths = path.split("/");

	for (var i = 0, length = splitPaths.length; i < length; i++) {
		const subPath = splitPaths[i];

		if (i < length - 1) {
			if (!currentNode[subPath]) {
				currentNode[subPath] = {};
			}
			
			currentNode = currentNode[subPath];
		} else {
			currentNode[subPath] = listener;
		}
	}
};

const detectEvent = function(path, json) {
	var currentNode = listeners;
	const splitPaths = path.split("/");

	for (var i = 0, length = splitPaths.length; i < length; i++) {
		const subPath = splitPaths[i];
	}
};

function MockDatabase() {
	this.databaseUrl = "";
};

MockDatabase.prototype.ref = function(path) {
	var basePath = this.databaseUrl;

	if (path) {
		basePath += path;
	}

	return MockReference.newBuilder()
		.withPath(basePath)
		.build();
};

function MockReference() {
	this.path = "";
};

MockReference.prototype.on = function(event, callback) {
	var listener = {};
	listener[event] = callback;
	main.listeners[this.path] = listener;
};

MockReference.prototype.off = function(event, callback) {
	main.listeners[this.path][event] = null;
};

MockReference.prototype.set = function(json) {
	const path = this.path;

	return new Promise(function(resolve, reject) {
		setData(path, json);
		resolve();
	});
};

MockReference.prototype.update = function(args) {
	const instance = this;

	return new Promise(function(resolve, reject) {
		const keys = utils.getKeys(args), rootPath = instance.path;

		for (var i = 0, length = keys.length; i < length; i++) {
			const 
				key = keys[i], 
				path = rootPath + key, 
				json = args[key];

			setData(path, json);
		}

		resolve();
	});
};

MockDatabase.Builder = function() {
	var database = new MockDatabase();

	return {
		withDatabaseUrl : function(url) {
			database.databaseUrl = url;
			return this;
		},

		build : function() {
			return database;
		}
	};
};

MockDatabase.newBuilder = function() {
	return MockDatabase.Builder();
};

MockReference.Builder = function() {
	var reference = new MockReference();

	return {
		withPath : function(path) {
			reference.path = path;
			return this;
		},

		build : function() {
			return reference;
		}
	}
};

MockReference.newBuilder = function() {
	return MockReference.Builder();
};