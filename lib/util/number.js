// @flow

Number.range = function (...args) {
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

  for (let i = 0; i < to - from; i++) {
    array.push(from + i);
  }

  return array;
};

Math.sum = function (...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];
    const sum = array.reduce((a, b) => a + b, 0);
    return Number.isInstance(sum) ? sum : 0;
  }

  return 0;
};

Math.mean = function (...args) {
  if (Array.isInstance(args[0])) {
    const array = args[0];

    if (array.length) {
      return Math.sum(array) / array.length;
    }
  }

  return 0;
};

Math.median = function (...args) {
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

Math.minimum = function (...args) {
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

Math.maximum = function (...args) {
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
