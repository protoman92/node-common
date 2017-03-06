function TestObject() {
	this.getId = function() {
		return "TestObject";
	};
};

function TestObject1() {
	var object = new TestObject();

	const getId = object.getId;

	object.getId = function() {
		console.log(getId());
		return "TestObject1";
	};

	return object;
};

describe("Common Tests", function() {
	it(
		"Override Tests",
		function() {
			var object1 = new TestObject1();
			console.log(object1);
			console.log(object1.getId());
		}
	);
});