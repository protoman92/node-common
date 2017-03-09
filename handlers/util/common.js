const rx = require('rx');

const baseDir = '../../..';
const sharedDir = `${baseDir}/node-common`;
const sharedPublicDir = `${sharedDir}/public`;
const sharedLocalizationDir = `${sharedPublicDir}/localization`;

const main = exports;

exports.clone = function (from) {
  if (Array.isInstance(from)) {
    return [].concat(from);
  } else if (Object.isInstance(from)) {
    return Object.assign({}, from);
  }

  return {};
};

exports.getKeys = function (object) {
  return Object.keys(object);
};

exports.getValues = function (object) {
  return Object.values(object);
};

exports.isEmpty = function (object) {
  return main.getKeys(object).length === 0;
};

exports.isNotEmpty = function (object) {
  return !main.isEmpty(object);
};

exports.getLanguage = function (req) {
  const languages = require(`${sharedLocalizationDir}/languages.js`);
  const defValue = languages.EN_US.value;

  if (req && req.headers) {
    return req.headers['accept-language'] || defValue;
  } else {
    return defValue;
  }
};

exports.getVersionNumber = function (text) {
  const regex = /(\d+)$/.exec(text);
  return parseInt(regex[0], 10);
};

exports.includeUtils = function (args) {
  const fs = require('fs');
  const utilsDir = (args || {}).directory || __dirname;

  fs.readdirSync(utilsDir).forEach((file) => {
    try {
      require(`${(args || {}).prepend || utilsDir}/${file}`);
    } catch (e) {
      main.log(e);
    }
  });
};

/**
 * Find all files with a certain name and emit then sequentially.
 * @param  {object} args This parameter must contain the filename key, and
 * optionally an array of filenames to skip.
 * @return {rx.Observable} An Observable object.
 */
exports.findFilesWithName = function (args) {
  if (args && args.filename && String.isInstance(args.filename)) {
    let filesToSkip = [
      'DS_Store',
      'env',
      'git',
      'node_modules',
      'Procfile',
    ];

    if (Array.isInstance(args.filesToSkip)) {
      filesToSkip = filesToSkip.concat(args.filesToSkip);
    }

    const fs = require('fs');

    const skipFcn = val => filesToSkip
      .every(file => !new RegExp(`\w*${file}\w*`)
      .exec(val));

    const readFilesUntilDone = function (path, args) {
      return rx.Observable.create((observer) => {
        fs.readdir(path, (err, files) => {
          if (err) {
            observer.onError(err);
          } else {
            observer.onNext(files);
            observer.onCompleted();
          }
        });
      })
      .filter(files => Array.isInstance(files) && files.length)
      .flatMap(files => rx.Observable.from(files))
      .filter(skipFcn)
      .retry(2)
      .onErrorSwitchToEmpty()
      .flatMapIfSatisfied(
        val => val === args.filename,

        (val, obs) => {
          const file = [baseDir, path, val].join('/');
          return rx.Observable.just(require(file));
        },

        (val, obs) => readFilesUntilDone(`${path}/${val}`, args));
    };

    return readFilesUntilDone('.', args);
  }

  Error.debugException(args);
  return rx.Observable.empty();
};

/**
 * Compound all files named localizable.js
 * @return {rx.Observable} An Observable object.
 */
exports.includeLocalizables = function (args) {
  return main.findFilesWithName({
    filename: 'localizable.js',

    filesToSkip: [
      'handlers',
      'models',
      'routes',
    ],
  });
};

exports.firstKey = function (object) {
  return main.getKeys(object)[0];
};

exports.firstValue = function (object) {
  const key = main.firstKey(object);

  if (key) {
    return object[key];
  } else {
    return undefined;
  }
};

exports.forEach = function (object, callback) {
  if (object && Object.isInstance(object) && Function.isInstance(callback)) {
    const keys = main.getKeys(object);
    keys.forEach(key => callback(key, object[key]));
  }
};

exports.deepForEach = function (object, callback) {
  main.forEach(object, (key, value) => {
    if (Function.isInstance(callback)) {
      callback(key, value);
    }

    main.deepForEach(value, callback);
  });
};

exports.hasConcreteValue = function (val) {
  return val !== undefined && val != null;
};

exports.concreteValue = function (val, def) {
  return main.hasConcreteValue(val) ? val : def;
};

exports.log = function (...args) {
  console.log(args);
};
