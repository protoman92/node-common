const { utils } = require('../../../lib/util');

function MockObject() {
  this.x = 1;
  this.y = 2;
}

MockObject.staticA = function () {
  return new MockObject().a();
};

MockObject.staticB = function () {
  return new MockObject().b();
};

MockObject.prototype.a = function () {
  return this.x - this.y;
};

MockObject.prototype.b = function () {
  return this.x + this.y;
};

describe('Utitlity tests', () => {
  it(
    'OneFromEach Test',
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
    'RangeRandomBetween Test',
    () => {
      const count = 1000;
      const from = 1000;
      const to = 5000;
      const numbers = Number.rangeRandomBetween(count, from, to);
      expect(numbers.length).toBe(count);
      expect(numbers.every(val => val >= from && val <= to)).toBe(true);
    });

  it(
    'Unify Test',
    () => {
      const testUnify = (a) => {
        const unified = a.reduce(utils.unify);
        console.log(unified);
        expect(unified).toBeTruthy();
      };

      /**
       * Unified numbers.
       */
      testUnify([1, 2, 3, 4]);

      /**
       * Unified arrays.
       */
      testUnify([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

      /**
       * Unified objects.
       */
      testUnify([{ a: 1, b: 2 }, { c: 3, d: 4 }, { e: 5, f: 6 }]);
    });

  it(
    'Prototype Test',
    () => {
      const obj = new MockObject();
      obj.b();
    });

  it.only(
    'Prototype Test with indirect method access',
    () => {
      const api = {
        staticA: MockObject.staticA.bind(MockObject),
        staticB: MockObject.staticB.bind(MockObject),
        a: obj => obj.a.bind(obj),
        b: obj => obj.b.bind(obj),
      };

      console.log(api.staticA());
      console.log(api.staticB());
      console.log(api.a(new MockObject())());
      console.log(api.b(new MockObject())());
    });
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
