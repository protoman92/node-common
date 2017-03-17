String.prototype.isEmpty = function () {
  return this === '';
};

String.prototype.isNotEmpty = function () {
  return !this.isEmpty();
};

String.prototype.isEmail = function () {
  const expression = new RegExp([
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.",
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:",
    '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+',
    '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?',
  ].join(''));

  return expression.test(this);
};
