// @flow

const fs = require('fs');
const rx = require('rx');

const main = exports;

/**
 * Clone an {@link Object}.
 * @type {Array} args This rest parameters should contain a list of objects
 * to be cloned from. At the end of the process, this function will return
 * an object with properties of all original object.
 * @return {object} A cloned object.
 */
exports.clone = function (...args) {
  let cloned;

  function clone(from) {
    if (Array.isInstance(from)) {
      cloned = (cloned || []).concat(from);
    } else if (Object.isInstance(from)) {
      cloned = Object.assign((cloned || {}), from);
    }
  }

  args.forEach(clone);
  return cloned;
};

/**
 * Get all keys of an {@link Object}.
 * @type {object} object The object to be inspected.
 * @return {Array} An Array of object keys.
 */
exports.getKeys = function (object) {
  return Object.keys(object);
};

/**
 * Get all values of an {@link Object}. We need to implement this differently,
 * depending on ES version.
 * @type {object} object The object to be inspected.
 * @return {Array} An Array of object values.
 */
exports.getValues = function (object) {
  return Object.values(object);
};

/**
 * Get all entries of an {@link Object}. We need to implement this differently,
 * depending on ES version.
 * @type {object} object The object to be inspected.
 * @return {Array} An Array of object entries.
 */
exports.getEntries = function (object) {
  return Object.entries(object);
};

/**
 * Get all values of a that satisfies a certain condition.
 * @param  {object} object The object to be inspected.
 * @param  {object} cond The boolean-producing condition.
 * @return {Array} An array of objects that satisfies the condition.
 */
exports.findObjectsWithCondition = function (object, cond) {
  return main.getValues(object)
    .map((inner) => {
      if (Function.isInstance(cond) && cond(inner)) {
        return [inner];
      }

      return main.findObjectsWithCondition(inner, cond);
    })
    .reduce((a, b) => a.concat(b), []);
};

/**
 * Get all values of a certain type from an Object. This can be useful in
 * tests where we need to recursively check an object for methods to restore
 * from stubs.
 * @param  {object} object The object to be inspected.
 * @param  {object} type The type to be checked against.
 * @return {Array} An array of objects that are of a particular type.
 */
exports.findObjectsOfType = function (object, type) {
  return main.findObjectsWithCondition(object, value => value instanceof type);
};

/**
 * Check if an {@link Object} is empty.
 * @type {object} object The object to be inspected.
 * @return {Boolean} A boolean value.
 */
exports.isEmpty = function (object) {
  if (main.hasConcreteValue(object) && main.hasConcreteValue(object.length)) {
    return object.length > 0;
  }

  return main.getKeys(object).length === 0;
};

/**
 * Check if an {@link Object} is not empty.
 * @type {object} object The object to be inspected.
 * @return {Boolean} A boolean value.
 */
exports.isNotEmpty = function (object) {
  return !main.isEmpty(object);
};

/**
 * Find all files with a certain name and emit then sequentially.
 * @param  {object} args This parameter must contain the filename key, and
 * optionally an array of filenames to skip.
 * @return {rx.Observable} An Observable object.
 */
exports.findFilesWithName = function (args) {
  if (args && args.filename && String.isInstance(args.filename)) {
    const baseDir = process.env.PWD;

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

    const skipFcn = val => filesToSkip
      .every(file => !new RegExp(`\w*${file}\w*`)
      .exec(val));

    const readFilesUntilDone = function (path, fileArgs) {
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
      .catchSwitchToEmpty()
      .flatMapIfSatisfied(
        val => val === fileArgs.filename,

        (val) => {
          const filePath = [baseDir, path, val].join('/');

          try {
            const file = require(filePath);
            return rx.Observable.just(file);
          } catch (e) {
            return rx.Observable.empty();
          }
        },

        val => readFilesUntilDone(`${path}/${val}`, fileArgs))
      .catchSwitchToEmpty();
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
    filesToSkip: ['handlers', 'models', 'routes'],
  });
};

exports.firstKey = function (object) {
  return main.getKeys(object)[0];
};

exports.firstValue = function (object) {
  const key = main.firstKey(object);

  if (key) {
    return object[key];
  }

  return undefined;
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

/**
 * Create an {@link Array} from another object, each of whose keys represents
 * an {@link Array} of values.
 * @param  {object} args This parameter must contain a list of keys, each of
 * which represents an {@link Array} of values.
 * @return {Array} An Array of objects.
 */
exports.oneFromEach = function (args) {
  const entries = main.getEntries(args);

  const iterateUntilDone = function (index) {
    const entry = entries[index];

    if (entry && entry.length === 2) {
      const key = entry[0];
      const value = entry[1];

      if (String.isInstance(key) && Array.isInstance(value)) {
        const nextItem = iterateUntilDone(index + 1);

        const currentItem = value
          .map((item) => {
            const obj = {};
            obj[key] = item;

            if (nextItem && nextItem.map) {
              return nextItem
                /**
                 * We must not use Object.assign(nItem, obj) or else the
                 * assigned object carry over to the next iteration (since
                 * object are by reference)
                 */
                .map(nItem => Object.assign({}, nItem, obj));
            }

            return obj;
          })
          .reduce((a, b) => a.concat(b), []);

        return currentItem;
      }
    }

    return {};
  };

  return iterateUntilDone(0);
};

exports.log = function (...args) {
  console.log(args);
};

/**
 * Unify two objects with an appropriate union method. This method checks the
 * type of the parameters being unified, and then decide how best to unify
 * them. We can append new types as needed.
 * This can be used with {@link Array#reduce} to avoid code repetition.
 * @type {object} a The first item in the union.
 * @type {object} b The second item in the union.
 * @return {object} This depends on the type of the union items.
 */
exports.unify = function (a, b) {
  if (Array.isInstance(a, b)) {
    return a.concat(b);
  } else if (Number.isInstance(a, b)) {
    return a + b;
  } else if (Object.isInstance(a, b)) {
    return Object.assign(a, b);
  }

  return {};
};