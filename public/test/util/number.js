// @flow

/**
 * Produce a {@link Number} that lies between two specific
 * values.
 * @param  {Array} ...args This parameter should contain from-to integers.
 * @return {Number} An Integer.
 */
Number.randomBetween = function (...args) {
  let from;
  let to;

  if (args.length >= 2) {
    from = parseInt(args[0], 10);
    to = parseInt(args[1], 10);
  } else if (args.length === 1) {
    from = 0;
    to = parseInt(args[0], 10);
  } else {
    return 0;
  }

  from = Math.max(0, from);
  to = Math.max(from + 1, to);
  return Math.floor(Math.random() * (to - from)) + from;
};

/**
 * Produce an {@link Array} of {@link Number}, each of which lies between
 * two specific values.
 * @param  {Number} count
 * @param  {Array} ...args This parameter should contain from-to integers.
 * @return {Array} An Array of Integers.
 */
Number.rangeRandomBetween = function (count, ...args) {
  return Number.range(count).map(() => Number.randomBetween(...args));
};
