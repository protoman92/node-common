const 
	faker = require("faker"),
	uuid = require("uuid/v4");

const main = this;

exports.amount = function() {
	return parseFloat(faker.finance.amount());
};

exports.id = function() {
	return uuid();
};

exports.firstName = function() {
	return faker.name.firstName();
};

exports.lastName = function() {
	return faker.name.lastName();
};

exports.email = function() {
	return faker.internet.email();
};

exports.phoneExtension = function() {
	return faker.random.number();
};

exports.phoneNumber = function() {
	return faker.phone.phoneNumber();
};

exports.url = function() {
	return faker.internet.url();
};

exports.word = function() {
	return faker.random.word();
};