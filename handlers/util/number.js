Number.randomBetween = function(from, to) {
	return Math.floor(Math.random() * to) + from;
};

Number.range = function() {
	var from, to;

	if (Number.isInstance(arguments[0])) {
		if (Number.isInstance(arguments[1])) {
			from = parseInt(arguments[0]);
			to = parseInt(arguments[1]);
		} else {
			from = 0;
			to = parseInt(arguments[0]);
		}
	} else {
		from = 0;
		to = 0;
	}

	from = Math.max(0, from);
	to = Math.max(from + 1, to);
	var array = [];

	for (var i = 0; i < to - from; i++) {
		array.push(from + i);
	}

	return array;
};

Math.sum = function() {
	if (Array.isInstance(arguments[0])) {
		const 
			array = arguments[0],
			sum = array.reduce((a, b) => a + b, 0);

		return Number.isInstance(sum) ? sum : 0;
	}

	return 0;
};

Math.mean = function() {
	if (Array.isInstance(arguments[0])) {
		const array = arguments[0];

		if (array.length) {
			return Math.sum(array) / array.length;
		}
	}

	return 0;
};

Math.median = function() {
	if (Array.isInstance(arguments[0])) {
		const array = arguments[0].sort(function(a, b) {
			if (Number.isInstance(a, b)) {
				return a - b;
			} else {
				return -1;
			}
		});

		return array[Math.floor(array.length / 2)];
	}

	return 0;
};

Math.minimum = function() {
	if (Array.isInstance(arguments[0])) {
		const array = arguments[0];

		var min = Infinity;

		for (var i = 0, length = array.length; i < length; i++) {
			const val = array[i];

			if (Number.isInstance(val) && val < min) {
				min = val;
			}
		}

		return min;
	}

	return Math.min(arguments);
};

Math.maximum = function() {
	if (Array.isInstance(arguments[0])) {
		const array = arguments[0];

		var max = 0;

		for (var i = 0, length = array.length; i < length; i++) {
			const val = array[i];

			if (Number.isInstance(val) && val > max) {
				max = val;
			}
		}

		return max;
	}

	return Math.max(arguments);
};