const { utils } = require('.');

Array.prototype.first = function (args) {
  if (args && Function.isInstance(args.condition)) {
    const cond = args.condition;

    for (let i = 0, length = this.length; i < length; i++) {
      const value = this[i];

      if (value && cond(value) === true) {
        return value;
      }
    }

    return args.default;
  } else {
    return utils.concreteValue(this[0], (args || {}).default);
  }
};

Array.prototype.last = function (args) {
  const length = this.length;

  if (args && Function.isInstance(args.condition)) {
    const cond = args.condition;

    for (let i = length - 1; i >= 0; i--) {
      const value = this[i];

      if (value && cond(value) === true) {
        return value;
      }
    }

    return args.default;
  } else {
    return utils.concreteValue(this[length - 1], (args || {}).default);
  }
};

Array.prototype.contains = function (args) {
  let condition;

  if (Function.isInstance(args)) {
    condition = args;
  } else {
    condition = val => val === args;
  }

  for (let i = 0, length = this.length; i < length; i++) {
    if (condition(this[i]) === true) {
      return true;
    }
  }

  return false;
};

Array.prototype.addUnique = function (item) {
  if (!this.contains(item)) {
    return this.push(item);
  }

  return 0;
};

Array.prototype.concatUnique = function (items) {
  let added = 0;

  if (Array.isInstance(items)) {
    for (let i = 0, length = items.length; i < length; i++) {
      added += this.addUnique(items[i]);
    }
  }

  return added;
};

Array.prototype.clone = function () {
  return this.filter(() => true);
};

Array.prototype.randomIndex = function () {
  return Math.floor(Math.random() * this.length);
};

Array.prototype.randomValue = function () {
  return this[this.randomIndex()];
};

Array.prototype.isEmpty = function () {
  return this.length === 0;
};

Array.prototype.isNotEmpty = function () {
  return !this.isEmpty();
};

Array.prototype.partition = function (cond) {
  const instance = this.clone();

  if (Function.isInstance(cond)) {
    const satisfied = instance.filter(val => Boolean.cast(cond(val)));
    const remaining = instance.filter(val => !Boolean.cast(cond(val)));
    return [satisfied, remaining];
  }

  return [instance, instance];
};

Array.prototype.distinct = function () {
  return Array.from(new Set(this));
};
