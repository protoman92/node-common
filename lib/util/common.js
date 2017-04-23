const fs = require('fs');
const rx = require('rx');

const main = exports;

/**
 * Clone an {@link Object}.
 * @param {Array} args This rest parameters should contain a list of objects
 * to be cloned from. At the end of the process, this function will return
 * an object with properties of all original object.
 * @return {object} A cloned object.
 */
exports.clone = function clone(...args) {
  return args.reduce(main.unify);
};

/**
 * Get all keys of an {@link Object}.
 * @param {object} object The object to be inspected.
 * @return {Array} An Array of object keys.
 */
exports.getKeys = function getKeys(object) {
  return Object.keys(object);
};

/**
 * Get all values of an {@link Object}. We need to implement this differently
 * depending on ES version.
 * @param {object} object The object to be inspected.
 * @return {Array} An Array of object values.
 */
exports.getValues = function getValues(object) {
  return Object.values(object);
};

/**
 * Get all entries of an {@link Object}. We need to implement this differently,
 * depending on ES version.
 * @param {object} object The object to be inspected.
 * @return {Array} An Array of object entries.
 */
exports.getEntries = function getEntries(object) {
  return Object.entries(object);
};

/**
 * Get the first key in an {@link Object}.
 * @param {object} object The object to be inspected.
 * @return {String} A String value.
 */
exports.firstKey = function firstKey(object) {
  return main.getKeys(object)[0];
};

/**
 * Get the first value in an {@link Object}.
 * @param {object} object The object to be inspected.
 * @return {object} An nullable object.
 */
exports.firstValue = function firstValue(object) {
  const key = main.firstKey(object);

  if (key) {
    return object[key];
  }

  return undefined;
};

/**
 * Get all values of a that satisfies a certain condition.
 * @param  {object} object The object to be inspected.
 * @param  {object} cond The boolean-producing condition.
 * @return {Array} An array of objects that satisfies the condition.
 */
exports.findObjectsWithCondition = function findObjects(object, cond) {
  return main.getValues(object)
    .map((inner) => {
      if (Function.isInstance(cond) && cond(inner)) {
        return [inner];
      }

      return main.findObjectsWithCondition(inner, cond);
    })
    .reduce((a, b) => main.unify(a, b), []);
};

/**
 * Get all values of a certain type from an Object. This can be useful in
 * tests where we need to recursively check an object for methods to restore
 * from stubs.
 * @param  {object} object The object to be inspected.
 * @param  {object} type The type to be checked against.
 * @return {Array} An array of objects that are of a particular type.
 */
exports.findObjectsOfType = function findObjects(object, type) {
  return main.findObjectsWithCondition(object, value => value instanceof type);
};

/**
 * Check if an {@link Object} is empty.
 * @param {object} object The object to be inspected.
 * @return {Boolean} A boolean value.
 */
exports.isEmpty = function isEmpty(object) {
  if (main.hasConcreteValue(object) && main.hasConcreteValue(object.length)) {
    return object.length === 0;
  }

  return main.getKeys(object).length === 0;
};

/**
 * Check if an {@link Object} is not empty.
 * @param {object} object The object to be inspected.
 * @return {Boolean} A boolean value.
 */
exports.isNotEmpty = function isNotEmpty(object) {
  return !main.isEmpty(object);
};

/**
 * Find all files with a certain name and emit then sequentially.
 * @param  {object} args This parameter must contain the filename key, and
 * optionally an array of filenames to skip.
 * @return {rx.Observable} An Observable object.
 */
exports.findFilesWithName = function findFiles(args) {
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

    const readFilesUntilDone = function readFilesUntilDone(path, fileArgs) {
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
exports.includeLocalizables = function includeLocalizables(args) {
  return main.findFilesWithName({
    filename: 'localizable.js',
    filesToSkip: ['handlers', 'models', 'routes'],
  });
};

/**
 * forEach for {@link Object}.
 * @param {object} object The object to be inspected.
 * @param {Function} callback A Function that will be called for each entry
 * in the object.
 */
exports.forEach = function forEach(object, callback) {
  if (object && Object.isInstance(object) && Function.isInstance(callback)) {
    const keys = main.getKeys(object);
    keys.forEach(key => callback(key, object[key]));
  }
};

/**
 * deepForEach for {@link Object}. Basically, {@link #forEach} will be called
 * recursively on the main {@link Object}, and then subsequently on all
 * its values.
 * @param {object} object The object to be inspected.
 * @param {Function} callback A Function that will be called for each entry
 * in the object.
 */
exports.deepForEach = function deepForEach(object, callback) {
  main.forEach(object, (key, value) => {
    if (Function.isInstance(callback)) {
      callback(key, value);
    }

    main.deepForEach(value, callback);
  });
};

/**
 * Check whether an {@link Object} is not null/undefined.
 * @param {object} val The object to be inspected.
 * @return {Boolean} A Boolean value.
 */
exports.hasConcreteValue = function hasConcreteValue(val) {
  return val !== undefined && val != null;
};

/**
 * Check whether an {@link Object} is null/undefined.
 * @param {object} val THe object to be inspected.
 * @return {Boolean} A Boolean value.
 */
exports.hasNoConcreteValue = function hasNoConcreteValue(val) {
  return !main.hasConcreteValue(val);
};

/**
 * Check whether an {@link Object} to truthy. This is different from
 * {@link #hasConcreteValue} - a {@link Number} variable with value 0 passes
 * {@link #hasConcreteValue}, but is not truthy. This is, therefore, a more
 * restrictive version of {@link #hasConcreteValue}.
 * @param {object} object The object to be inspected.
 * @return {Boolean} A Boolean value.
 */
exports.isTruthy = function isTruthy(object) {
  return object ? true : false;
};

/**
 * Check whether an {@link Object} to false.
 * @param {object} object The object to be inspected.
 * @return {Boolean} A Boolean value.
 */
exports.isFalsy = function isFalsy(object) {
  return !main.isTruthy(object);
};

/**
 * Return a default value if an {@link Object} does not have concrete value
 * (e.g. null or undefined).
 * @param {object} val The object to be inspected.
 * @param {object} def The default value that will be returned if the object
 * is null or undefined.
 * @return A nullable object.
 */
exports.concreteValue = function concreteValue(val, def) {
  return main.hasConcreteValue(val) ? val : def;
};

/**
 * Return a clone with only concrete values. Substitute a default value, if
 * present, whenever a null/undefined value is encountered.
 * @param {object} obj The object being cloned. If this is a key-value Object,
 * discard all entries whose values are null/undefined. If this is an Array,
 * discard null/undefined entries.
 * @return {object} A clone of the original object, with only concrete values.
 */
exports.concreteValues = function concreteValues(obj, def) {
  if (Array.isInstance(obj)) {
    return obj
      .map(a => main.concreteValue(a, def))
      .filter(main.hasConcreteValue);
  } else if (Object.isInstance(obj)) {
    return main.getEntries(obj)
      .map(entry => [entry[0], main.concreteValue(entry[1], def)])
      .filter(entry => main.hasConcreteValue(entry[1]))
      .map(entry => main.objectFromEntry(entry[0], entry[1]))
      .reduce(main.unify);
  }

  return {};
};

/**
 * Create an {@link Array} from another object, each of whose keys represents
 * an {@link Array} of values.
 * @param  {object} args This parameter must contain a list of keys, each of
 * which represents an {@link Array} of values.
 * @return {Array} An Array of objects.
 */
exports.oneFromEach = function oneFromEach(args) {
  const entries = main.getEntries(args);

  const iterateUntilDone = function (index) {
    const entry = entries[index];

    if (entry && entry.length === 2) {
      const key = entry[0];
      const value = entry[1];

      if (String.isInstance(key) && Array.isInstance(value)) {
        const nextItem = iterateUntilDone(index + 1);

        const currentItem = value.map((item) => {
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

/**
 * Convenience log function.
 * @param {Array} args An Array of objects.
 */
exports.log = function log(...args) {
  console.log(...args);
};

/**
 * Unify two objects with an appropriate union method. This method checks the
 * type of the parameters being unified, and then decide how best to unify
 * them. We can append new types as needed.
 * This can be used with {@link Array#reduce} to avoid code repetition.
 * @param {object} a The first item in the union.
 * @param {object} b The second item in the union.
 * @return {object} This depends on the type of the union items.
 */
exports.unify = function unify(a, b) {
  switch (true) {
    case Array.isInstance(a, b):
      return a.concat(b);

    case Number.isInstance(a, b):
      return a + b;

    case Object.isInstance(a, b):
      return Object.assign(a, b);

    default:
      break;
  }

  return {};
};

/**
 * Create a key-value {@link Object} from a key and a value. This allows for
 * convenient creation of object from a set of key-value without having to
 * declare an empty object and manually inserting the entry.
 * @param {String} key A String value.
 * @param {object} value This can be anything.
 * @return {object} A key-value object.
 */
exports.objectFromEntry = function objectFromEntry(key, value) {
  const object = {};

  if (key && String.isInstance(key)) {
    object[key] = value;
  }

  return object;
};
