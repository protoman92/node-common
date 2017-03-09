const main = this;

exports.isInstance = function (args, fcn) {
  let condition;

  if (typeof (fcn) === 'function') {
    condition = fcn;
  } else {
    condition = val => typeof (val) === fcn;
  }

  for (const i in args) {
    if (condition(args[i]) !== true) {
      return false;
    }
  }

  return true;
};

Boolean.isInstance = function () {
  return main.isInstance(arguments, 'boolean');
};

Boolean.cast = function (value) {
  if (Boolean.isInstance(value)) {
    return value;
  } else if (String.isInstance(value)) {
    return value == 'true' || !(value == 'false');
  }

  return false;
};

Error.isInstance = function () {
  return main.isInstance(arguments, value => value instanceof Error);
};

Function.isInstance = function () {
  return main.isInstance(arguments, 'function');
};

Number.isInstance = function () {
  return main.isInstance(arguments, 'number');
};

Object.isInstance = function () {
  return main.isInstance(arguments, 'object');
};

String.isInstance = function () {
  return main.isInstance(arguments, 'string');
};

Array.isInstance = function () {
  return main.isInstance(arguments, value => value instanceof Array);
};
