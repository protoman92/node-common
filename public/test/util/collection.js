/**
 * Shuffle the current {@link Array}.
 * @return {Array} A shuffled Array.
 */
Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }

  return this;
};

/**
 * Get a random {@link Array} index.
 * @return {Number} A random index number.
 */
Array.prototype.randomIndex = function () {
  return Math.floor(Math.random() * this.length);
};

/**
 * Get a random element from the current {@link Array}.
 * @param {object} args This parameter may contain the condition predicate,
 * and the default value. The predicate is used to filter out elements that
 * are not of interest.
 * @param {Array} rest An Array that contains arguments that could be used
 * if args is not a key-value object.
 * @return {object} A random element from the Array.
 */
Array.prototype.randomValue = function (args, ...rest) {
  const instance = this;

  const filter = (cond, def) => {
    const filtered = instance.filter(cond);
    return filtered[filtered.randomIndex()] || def;
  };

  if (args && Function.isInstance(args.condition)) {
    return filter(args.condition, args.default);
  } else if (Function.isInstance(args) && rest) {
    return filter(args, rest[0]);
  }

  return this[this.randomIndex()];
};

/**
 * Slice an {@link Array} based on start and end values. If end values is
 * less than 1, it will be converted to {@link Array#length} * end
 * (essentially a portion of the original {@link Array} length). Otherwise,
 * it is the same as {@link Array#slice}.
 * @param {Number} start The start index.
 * @param {Number} end The end index, or a fraction of the original Array
 * length.
 * @return {Array} A sliced Array.
 */
Array.prototype.slicePortion = function (start, end) {
  switch (true) {
    case end <= 1:
      return this.slice(start, parseInt(this.length * end, 10));

    default:
      return this.slice(start, end);
  }
};
