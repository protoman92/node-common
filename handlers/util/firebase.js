const request = require('request');
const rx = require('rx');

const { google, utils } = require('.');
const jwtTokenPath = '/googleJwt';

let jwtAuthToken = '';
let jwtTokenExpiry = 0;

exports.getGlobalJwtToken = function () {
  return {
    accessToken: jwtAuthToken,
    expiryDate: jwtTokenExpiry,
  };
};

/**
 * From a dictionary of key-value pairs that contains the data to update, we
 * need to construct a new dictionary with the keys appended by the rootPath,
 * in order to update certain data without overriding the whole node.
 * @param  {String} rootPath The root path to prepend all keys.
 * @param  {object} update   The object parameter contains the data to update.
 * @return {object}          A new object with prepended keys.
 */
exports.prepareUpdateData = function (rootPath, update) {
  const newUpdate = {};

  if (update) {
    for (const key in update) {
      const value = update[key];

      if (value) {
        newUpdate[`${rootPath}/${key}`] = value;
      }
    }
  }

  return newUpdate;
};

/**
 * Get the JWT token that is stored in the database.
 * @return {rx.Observable} an Observable object.
 */
const getStoredJwtTokenObservable = function () {
  const database = require('firebase-admin').database();

  return rx.Observable
    .fromPromise(database.ref(jwtTokenPath).once('value'))
    .map(data => data.val());
};

/**
 * Update the JWT token stored in the database.
 * @param  {object} args This parameter must contain accessToken key at minimum.
 * @return {rx.Observable} An Observable object
 */
const updateGoogleJwtTokenObservable = function (args) {
  const update = {};
  const database = require('firebase-admin').database();

  if (args) {
    update[jwtTokenPath] = args;
  } else {
    Error.debugException();
  }

  return rx.Observable
    .fromPromise(database.ref().update(update))
    .map(value => args);
};

/**
 * Generate a JWT token to authorize REST API calls.
 * @return {rx.Observable} An Observable object.
 */
const generateJwtTokenForFirebaseObservable = function () {
  const currentTime = new Date().getTime();

  if (!jwtAuthToken || jwtTokenExpiry < currentTime) {
    const credentials = require(`${baseDir}/credentials/credential.js`);

    const scopes = [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const args = { keyFile: credentials.serviceAccount, scopes };

    return google.generateJwtTokenObservable(args)
      // .flatMap(tokens => updateGoogleJwtTokenObservable(tokens))
      .doOnNext((args) => {
        jwtAuthToken = args.accessToken;
        jwtTokenExpiry = args.expiryDate;
      })
      .map(args => args.accessToken);
  }

  return rx.Observable.just(jwtAuthToken);
};

/**
 * Basically a combination of checking the validity of the stored token, and if it is
 * no longer valid (i.e. expired), get a new one and upload it.
 * @return {rx.Observable} An Observable object.
 */
const generateAndStoreJwtTokenForFirebaseObservable = function () {
  return getStoredJwtTokenObservable()
    .flatMap((args) => {
      if (args) {
        const accessToken = args.accessToken || '';
        const currentTime = new Date().getTime();
        const expiry = args.expiryDate || 0;

        if (accessToken && expiry >= currentTime) {
          return rx.Observable.just(accessToken);
        }
      }

      return generateJwtTokenForFirebaseObservable();
    });
};

const getAuthorizationHeaders = function (token) {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Convenience function to request data from Firebase REST API. Combines
 * authorization with code to pull data.
 * @param  {object} args This parameter must contain the path key, which
 * represents the database path to pull data from. It will be appended
 * with '.json'.
 * @return {rx.Observable} An Observable object.
 */
const requestRESTDataObservable = function (args) {
  if (args) {
    const credentials = require(`${baseDir}/credentials/credential.js`);
    const databaseUrl = credentials.firebase.databaseURL;
    const path = args.path || '';
    const fullPath = `${databaseUrl + path}.json`;
    const qs = args.qs || {};

    return generateJwtTokenForFirebaseObservable()
      .flatMap((token) => {
        const urlParams = {
          url: fullPath,
          qs,
          headers: getAuthorizationHeaders(token),
        };

        return rx.Observable.create((observer) => {
          request.get(urlParams, (err, res) => {
            if (err) {
              observer.onError(Error.networkError(err));
            } else {
              observer.onNext(res);
              observer.onCompleted();
            }
          });
        });
      })
      .filter(data => data)
      .map(data => data.body || '')
      .map(json => JSON.parse(json));
  }

  Error.debugException(args);
  return rx.Observable.empty();
};

exports.requestRESTDataObservable = requestRESTDataObservable;

/**
 * Request REST data with shallow=true.
 * @param  {object} args This Parameter must contain the path key.
 * @return {rx.Observable} an Observable object.
 */
exports.requestShallowRESTDataObservable = function (args) {
  if (args) {
    const newArgs = args;
    newArgs.qs = { shallow: true };
    return requestRESTDataObservable(newArgs);
  }

  Error.debugException(args);
  return rx.Observable.empty();
};
