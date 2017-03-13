const rx = require('rx');

/**
 * Generate JWT token to access Google APIs.
 * @param  {object} args This parameter must contain clientId, clientSecret and scope keys,
 * among others. These values will be passed to the OAuth2 client to verify with Google's
 * services.
 * @return {rx.Observable} An Observable object.
 */
exports.generateJwtTokenObservable = function (args) {
  if (args) {
    const scopes = args.scopes || '';
    const keyFile = args.keyFile || {};
    const google = require('googleapis');
    const jwtClient = new google.auth.JWT(
      keyFile.client_email,
      null,
      keyFile.private_key,
      scopes,
      null,
    );

    return rx.Observable.create((observer) => {
      jwtClient.authorize((err, tokens) => {
        if (err) {
          observer.onError(Error.networkError(err));
        } else {
          const accessToken = tokens.access_token;
          const tokenType = tokens.token_type;
          const expiryDate = parseInt(tokens.expiry_date) || 0;

          const args = {
            accessToken,
            tokenType,
            expiryDate,
          };

          observer.onNext(args);
          observer.onCompleted();
        }
      });
    });
  }

  Error.debugException(args);
  return rx.Observable.empty();
};
