const
	baseDir = "../../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedPublicDir = sharedDir + "/public",
	sharedTestDir = sharedPublicDir + "/test",
	MockDatabase = require(sharedTestDir + "/firebase/mockDatabase.js");

function MockFirebase() {
	this.databaseUrl = "";
}

MockFirebase.prototype.initializeApp = function(args) {
	this.databaseUrl = args.databaseUrl;
};

MockFirebase.prototype.database = function() {
	return MockDatabase.newBuilder()
		.withDatabaseUrl(this.databaseUrl)
		.build();
};