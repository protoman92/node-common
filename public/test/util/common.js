const sinon = require('sinon');
const { utils } = require('../../../lib/util');

/**
 * Restore stubbed methods using {@link #restore}. This method recursively
 * iterates through a key-value {@link Object}, producing an {@link Array}
 * of {@link Function}. Some of these {@link Function} may have a
 * {@link #restore} method, which indicates they have been stubbed.
 * @param {Array} args An Array of key-value objects.
 */
exports.restoreAll = (...args) => {
  args.map(obj => utils.findObjectsOfType(obj, Function))
    .reduce(utils.unify)
    .forEach((method) => {
      if (Function.isInstance(method.restore)) {
        method.restore();
      }
    });
};

/**
 * Reset stubbed methods using {@link #reset}. This method recursively
 * iterates through a key-value {@link Object}, producing an {@link Array}
 * of {@link Function}. Some of these {@link Function} may have a
 * {@link #reset} method - calling this method will restore all call counts
 * to 0.
 * @param {Array} args An Array of key-value objects.
 */
exports.resetAll = (...args) => {
  args.map(obj => utils.findObjectsOfType(obj, Function))
    .reduce(utils.unify)
    .forEach((method) => {
      if (Function.isInstance(method.reset)) {
        method.reset();
      }
    });
};

/**
 * Spy all methods within an object.
 * @param {Array} args An Array of key-value objects.
 */
exports.spyAll = (...args) => {
  args.forEach((obj) => {
    const entries = utils.getEntries(obj);

    entries.map(([key, value]) => {
      if (Function.isInstance(value)) {
        sinon.spy(obj, key);
      }
    });
  });
};
