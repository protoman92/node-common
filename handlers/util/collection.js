const
	baseDir = "../../..",
	shareDir = baseDir + "/node-common",
	sharedHandlerDir = shareDir + "/handlers",
	utils = require(sharedHandlerDir + "/util/common.js");

Array.prototype.first = function(args) {
	if (args && Function.isInstance(args.condition)) {
		const cond = args.condition;

		for (var i = 0, length = this.length; i < length; i++) {
			const value = this[i];

			if (value && cond(value) == true) {
				return value;
			}
		}

		return args.default;
	} else {
		return utils.concreteValue(this[0], (args || {}).default);
	}
};

Array.prototype.last = function(args) {
	const length = this.length;

	if (args && Function.isInstance(args.condition)) {
		const cond = args.condition;

		for (var i = length - 1; i >= 0; i--) {
			const value = this[i];

			if (value && cond(value) == true) {
				return value;
			} 
		}

		return args.default;
	} else {
		return utils.concreteValue(this[length - 1], (args || {}).default);
	}
};

Array.prototype.contains = function(args) {
	var condition;

	if (Function.isInstance(args)) {
		condition = args;
	} else {
		condition = val => val == args;
	}

	for (var i = 0, length = this.length; i < length; i++) {
		if (condition(this[i]) == true) {
			return true;
		}
	}

	return false;
};

Array.prototype.addUnique = function(item) {
	if (!this.contains(item)) {
		return this.push(item);
	} else {
		return 0;
	}
};

Array.prototype.concatUnique = function(items) {
	var added = 0;

	if (Array.isInstance(items)) {
		for (var i = 0, length = items.length; i < length; i++) {
			added += this.addUnique(items[i]);
		}
	}

	return added;
};

Array.prototype.clone = function() {
	return this.filter(val => true);
};

Array.prototype.randomIndex = function() {
	return Math.floor(Math.random() * this.length);
};

Array.prototype.randomValue = function() {
	return this[this.randomIndex()];
};

Array.prototype.isEmpty = function() {
	return this.length == 0;
};

Array.prototype.isNotEmpty = function() {
	return !this.isEmpty();
};

Array.prototype.partition = function(cond) {
	const instance = this.clone();

	if (Function.isInstance(cond)) {
		const 
			satisfied = instance.filter(val => Boolean.cast(cond(val))),
			remaining = instance.filter(val => !Boolean.cast(cond(val)));

		return [satisfied, remaining];
	}

	return [instance, instance];
};