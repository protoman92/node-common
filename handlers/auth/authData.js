function AuthData() {
	this.id = "";
	this.email = "";
};

AuthData.prototype.setId = function(id) {
	if (id && String.isInstance(id)) {
		this.id = id;
	}

	return this;
};

AuthData.prototype.setEmail = function(email) {
	if (email && String.isInstance(email)) {
		this.email = email;
	}

	return this;
}

AuthData.prototype.getId = function() {
	return this.id || "";
};

AuthData.prototype.getEmail = function() {
	return this.email || "";
};

AuthData.isInstance = function(value) {
	return Function.isInstance(value.getId, value.getEmail);
};

AuthData.Builder = function() {
	var authData = new AuthData();

	return {
		withId : function(id) {
			authData.setId(id);
			return this;
		},

		withEmail : function(email) {
			authData.setEmail(email);
			return this;
		},

		withFirebaseUser : function(user) {
			if (user) {
				return this
					.withId(user.uid)
					.withEmail(user.email)
			} else {
				Error.debugException();
			}

			return this;
		},

		build : function() {
			return authData;
		}
	};
};

AuthData.newBuilder = function() {
	return AuthData.Builder();
};

module.exports = AuthData;