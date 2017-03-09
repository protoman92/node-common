const baseDir = '../../..';
const sharedDir = `${baseDir}/node-common`;
const utils = require(`${sharedDir}/handlers/util/common.js`);

const main = exports;

exports.isInstance = function (args, fcn) {
  let condition;

  if (typeof (fcn) === 'function') {
    condition = fcn;
  } else {
    condition = val => typeof (val) === fcn;
  }

  if (args instanceof Array) {
    return args.every(condition);
  }

  return utils.getValues(args).every(condition);
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
