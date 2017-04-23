/**
 * Create an {@link Array} of {@link Number} based on a lower bound and an
 * upper bound.
 * @param {Array} args This parameter should contain information such as the
 * lower bound (optional)/upper bound. If the lower bound is not specified, it
 * is assumed to be 0.
 * @return {Array} An Array of Number.
 */
Number.range = function range(...args) {
  let from;
  let to;

  if (Number.isInstance(args[0])) {
    if (Number.isInstance(args[1])) {
      from = parseInt(args[0], 10);
      to = parseInt(args[1], 10);
    } else {
      from = 0;
      to = parseInt(args[0], 10);
    }
  } else {
    from = 0;
    to = 0;
  }

  from = Math.max(0, from);
  to = Math.max(from + 1, to);
  const array = [];

  for (let i = 0; i < to - from; i += 1) {
    array.push(from + i);
  }

  return array;
};

/**
 * Add up a varargs, or an {@link Array} of {@link Number}. Since the main
 * sum method only takes varargs, we need to method to use with Arrays.
 * @param {Array} args This parameter should contain a varargs Array of
 * Number, or one Array of Number.
 * @return {Number} A Number value.
 */
Math.sum = function sum(...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];
    const summed = array.reduce((a, b) => a + b, 0);
    return Number.isInstance(summed) ? summed : 0;
  }

  return 0;
};

/**
 * Get the mean of a varargs, or an {@link Array} of {@link Number}.
 * @param {Array} args This parameter should contain a varargs Array of
 * Number, or one Array of Number.
 * @return {Number} A Number value.
 */
Math.mean = function mean(...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];

    if (array.length) {
      return Math.sum(array) / array.length;
    }
  }

  return 0;
};

/**
 * Get the median of a varargs, or an {@link Array} of {@link Number}.
 * @param {Array} args This parameter should contain a varargs Array of
 * Number, or one Array of Number.
 * @return {Number} A Number value.
 */
Math.median = function median(...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0].sort((a, b) => {
      if (Number.isInstance(a, b)) {
        return a - b;
      }

      return -1;
    });

    return array[Math.floor(array.length / 2)];
  }

  return 0;
};

/**
 * Get the minimum of a varargs, or an {@link Array} of {@link Number}.
 * @param {Array} args This parameter should contain a varargs Array of
 * Number, or one Array of Number.
 * @return {Number} A Number value.
 */
Math.minimum = function minimum(...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];

    let min = Infinity;

    for (let i = 0, length = array.length; i < length; i++) {
      const val = array[i];

      if (Number.isInstance(val) && val < min) {
        min = val;
      }
    }

    return min;
  }

  return Math.min(args);
};

/**
 * Get the maximum of a varargs, or an {@link Array} of {@link Number}.
 * @param {Array} args This parameter should contain a varargs Array of
 * Number, or one Array of Number.
 * @return {Number} A Number value.
 */
Math.maximum = function maximum(...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];

    let max = 0;

    for (let i = 0, length = array.length; i < length; i++) {
      const val = array[i];

      if (Number.isInstance(val) && val > max) {
        max = val;
      }
    }

    return max;
  }

  return Math.max(args);
};
