const 
	status = require("http-status-codes"),
	njwt = require("njwt"),
	rx = require("rx"),
	baseDir = "../..";

const generateToken = function() {
	const
		credentials = require(baseDir + "/credentials/credential.js"),
		jwt = njwt.create({}, credentials.jwtSecret);

	return {
		"accessToken" : jwt.compact(),
		"expiry" : jwt.body.exp || 0
	};
}

exports.setAccessTokenHeader = function(res) {
	res.set(generateToken());
}

exports.verifyAccessToken = function(req) {
	return rx.Observable.just("");
	// return rx.Observable.create(function(observer) {
	// 	const 
	// 		credentials = require(baseDir + "/credentials.js"),
	// 		secret = credentials.jwtSecret || "",
	// 		token = req.headers["accessToken"] || "";

	// 	njwt.verify(token, secret, function(err, token) {
	// 		if (err) {
	// 			observer.onError(Error.networkError(err, status.UNAUTHORIZED));
	// 		} else {
	// 			observer.onNext(token);
	// 			observer.onCompleted();
	// 		}
	// 	})
	// });
};