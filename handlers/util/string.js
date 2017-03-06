String.prototype.isEmpty = function() {
	return this == "";
};

String.prototype.isNotEmpty = function() {
	return !this.isEmpty();
};

String.prototype.isEmail = function() {
  	const expression = new RegExp([
  		"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.",
  		"[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:",
  		"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+",
  		"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
  	].join(""));

  	return expression.test(this);
};

String.randomString = function(length) {
	const all = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	return new Array(length)
		.fill("")
		.map(val => Math.floor(Math.random() * all.length))
		.map(index => all.charAt(index))
		.join("");
};