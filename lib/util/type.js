const { utils } = require('.');

const main = exports;

exports.isInstance = function (args, fcn) {
  let condition;

  if (typeof (fcn) === 'function') {
    condition = fcn;
  } else {
    condition = val => typeof (val) === fcn;
  }

  if (args instanceof Array) {
    /**
     * With rest parameters (e.g. ...args), the passed parameter is an Array.
     */
    return args.every(condition);
  } else if (utils.getKeys(args).includes('0')) {
    /**
     * Backward-compatible case whereby the passed arguments parameter
     * contains stringified integer keys.
     */
    return utils.getValues(args).every(condition);
  }

  return condition(args);
};

/**
 * Check if an {@link Object} is an instance of some classes.
 * @type {object} obj The object to be checked.
 * @type {Array} classes An Array of classes to check.
 * @return {Boolean} A Boolean value.s
 */
exports.isInstanceOfClasses = function (obj, ...classes) {
  return classes.some((cls) => {
    if (cls.isInstance instanceof Function) {
      return cls.isInstance(obj);
    }

    Error.debugException(cls);
    return false;
  });
};

Boolean.isInstance = function (...args) {
  return main.isInstance(args, 'boolean');
};

Boolean.cast = function (value) {
  if (Boolean.isInstance(value)) {
    return value;
  } else if (String.isInstance(value)) {
    return value === 'true' || !(value === 'false');
  }

  return false;
};

Error.isInstance = function (...args) {
  return main.isInstance(args, value => value instanceof Error);
};

Function.isInstance = function (...args) {
  return main.isInstance(args, 'function');
};

Number.isInstance = function (...args) {
  return main.isInstance(args, 'number');
};

Object.isInstance = function (...args) {
  return main.isInstance(args, 'object');
};

String.isInstance = function (...args) {
  return main.isInstance(args, 'string');
};

Array.isInstance = function (...args) {
  return main.isInstance(args, value => value instanceof Array);
};
