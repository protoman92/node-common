const rx = require("rx");

/**
 * Generate JWT token to access Google APIs.
 * @param  {object} args This parameter must contain clientId, clientSecret and scope keys,
 * among others. These values will be passed to the OAuth2 client to verify with Google's
 * services.
 * @return {rx.Observable} An Observable object.
 */
exports.generateJwtTokenObservable = function(args) {
	if (args) {
		const
			scopes = args.scopes || "",
			keyFile = args.keyFile || {},
			google = require("googleapis"),
			jwtClient = new google.auth.JWT(
			  	keyFile.client_email,
			  	null,
			  	keyFile.private_key,
			  	scopes,
			  	null
			);
		
		return rx.Observable.create(observer => {
			jwtClient.authorize((err, tokens) => {
				if (err) {
					observer.onError(Error.networkError(err));
				} else {
					const
						accessToken = tokens["access_token"],
						tokenType = tokens["token_type"],
						expiryDate = parseInt(tokens["expiry_date"]) || 0,
						args = {
							accessToken : accessToken,
							tokenType : tokenType,
							expiryDate : expiryDate
						};

					observer.onNext(args);
					observer.onCompleted();
				}
			})
		})
	} else {
		Error.debugException();
	}

	return rx.Observable.empty();
};