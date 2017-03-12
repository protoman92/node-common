const utils = require('../../../handlers/util/common.js');

utils.includeUtils();

describe('Utitlity tests', () => {
  it(
    'OneForEach test',
    () => {
      const a = [1, 2, 3];
      const b = Number.range(a.last() + 1, a.last() + a.length + 2);
      const c = Number.range(b.last() + 1, b.last() + b.length + 2);
      const args = { a, b, c };
      const obj = utils.oneForEach(args);

      const totalLength = utils
        .getValues(args)
        .reduce((i, j) => i * j.length, 1);

      expect(obj.length).toBe(totalLength);
    });
});

/**
 * Run with Mocha.
 */
describe('Backward compatibility tests', () => {
  it.only(
    'Destructuring test',
    () => {
      const args = { a: 1, b: 2 };
      const { a, b } = args;
      console.log(a, b);
    });
});
