const { utils } = require('../../../lib/util');

describe('Utitlity tests', () => {
  it(
    'OneForEach test',
    () => {
      const a = [1, 2, 3];
      const b = Number.range(a.last() + 1, a.last() + a.length + 2);
      const c = Number.range(b.last() + 1, b.last() + b.length + 2);
      const args = { a, b, c };
      const obj = utils.oneFromEach(args);

      const totalLength = utils
        .getValues(args)
        .reduce((i, j) => i * j.length, 1);

      expect(obj.length).toBe(totalLength);
    });

  it(
    'RangeRandomBetweenTest',
    () => {
      const count = 1000;
      const from = 1000;
      const to = 5000;
      const numbers = Number.rangeRandomBetween(count, from, to);
      expect(numbers.length).toBe(count);
      expect(numbers.every(val => val >= from && val <= to)).toBe(true);
    },
  );
});

/**
 * Run with Mocha.
 */
describe('Backward compatibility tests', () => {
  it(
    'Destructuring test',
    () => {
      const args = { a: 1, b: 2 };
      const { a, b } = args;
      console.log(a, b);
    });
});
