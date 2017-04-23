const utils = require('./common.js');

/**
 * Create an {@link Array} of one item. This can be convenient for map
 * operations that create an Array from an item.
 * @return {Array} An Array of one item.
 */
Array.ofOne = function ofOne(item) {
  return [item];
};

/**
 * Get the first element that satisfies a condition in an {@link Array}.
 * @param {object} args This parameter may contain the condition predicate,
 * and the default value. The predicate is used to filter out elements that
 * are not of interest.
 * @param {Array} rest An Array that contains arguments that could be used
 * if args is not a key-value object.
 * @return {object} The first element that satisfies a condition.
 */
Array.prototype.first = function first(args, ...rest) {
  const filter = (cond, def) => {
    for (let i = 0, length = this.length; i < length; i += 1) {
      const value = this[i];
      if (value && cond(value) === true) return value;
    }

    return def;
  };

  if (args && Function.isInstance(args.condition)) {
    return filter(args.condition, args.default);
  } else if (Function.isInstance(args) && rest) {
    return filter(args, rest[0]);
  }

  return utils.concreteValue(this[0], (args || {}).default);
};

/**
 * Get the last element that satisfies a condition in an {@link Array}.
 * @param {object} args This parameter may contain the condition predicate,
 * and the default value. The predicate is used to filter out elements that
 * are not of interest.
 * @param {Array} rest An Array that contains arguments that could be used
 * if args is not a key-value object.
 * @return {object} The last element that satisfies a condition.
 */
Array.prototype.last = function last(args, ...rest) {
  const length = this.length;

  const filter = (cond, def) => {
    for (let i = length - 1; i >= 0; i -= 1) {
      const value = this[i];
      if (value && cond(value) === true) return value;
    }

    return def;
  };

  if (args && Function.isInstance(args.condition)) {
    return filter(args.condition, args.default);
  } else if (Function.isInstance(args) && rest) {
    return filter(args, rest[0]);
  }

  return utils.concreteValue(this[length - 1], (args || {}).default);
};

/**
 * Check if the current {@link Array} contains an {@link Object}.
 * @param {object} args This can either be a Function or an Object. If it
 * is a Function, it is used as a predicate. Otherwise, the Array will be
 * checked if it contains the object.
 * @return {Boolean} A Boolean value.
 */
Array.prototype.contains = function contains(args) {
  const instance = this;
  let condition;

  if (Function.isInstance(args)) {
    condition = args;
  } else {
    // return args in instance;
    condition = element => element === args;
  }

  for (let i = 0, length = instance.length; i < length; i += 1) {
    if (condition(instance[i]) === true) {
      return true;
    }
  }

  return false;
};

/**
 * Append an element to the current {@link Array} if it does not contain the
 * element yet.
 * @param {object} item The object to be added.
 * @return {Number} The number of items added to the Array.
 * @see Array.prototype.contains.
 */
Array.prototype.addUnique = function addUnique(item) {
  if (!this.contains(item)) {
    return this.push(item);
  }

  return 0;
};

/**
 * Concatenating an {@link Array} with another {@link Array}, taking only
 * unique elements.
 * @param {Array} items The Array to be added.
 * @return {Number} The number of items added to the original Array.
 * @see Array.prototype.addUnique.
 */
Array.prototype.concatUnique = function concatUnique(items) {
  let added = 0;

  if (Array.isInstance(items)) {
    for (let i = 0, length = items.length; i < length; i += 1) {
      added += this.addUnique(items[i]);
    }
  }

  return added;
};

/**
 * Clone the current {@link Array}.
 * @return {Array} A cloned Array.
 */
Array.prototype.clone = function clone() {
  return this.filter(() => true);
};

/**
 * Check if the current {@link Array} is empty.
 * @return {Boolean} A Boolean value.
 */
Array.prototype.isEmpty = function isEmpty() {
  return this.length === 0;
};

/**
 * Check if the current {@link Array} is not empty.
 * @return {Boolean} A Boolean value.
 */
Array.prototype.isNotEmpty = function isNotEmpty() {
  return !this.isEmpty();
};

/**
 * Partition the current {@link Array} into an {@link Array} of {@link Array},
 * the first of which satisfies a condition, while the second does not.
 * @param {Function} cond The predicate to process the Array.
 * @return {Array} An Array of two Arrays.
 */
Array.prototype.partition = function partition(cond) {
  const instance = this.clone();

  if (Function.isInstance(cond)) {
    const satisfied = instance.filter(val => Boolean.cast(cond(val)));
    const remaining = instance.filter(val => !Boolean.cast(cond(val)));
    return [satisfied, remaining];
  }

  return [instance, instance];
};

/**
 * Filter out non-unique value from the current {@link Array}.
 * @return {Array} An Array of distinct values.
 */
Array.prototype.distinct = function distinct() {
  return Array.from(new Set(this));
};
