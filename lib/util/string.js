// @flow

/**
 * Check if a {@link String} is empty.
 * @return {Boolean} A Boolean value.
 */
String.prototype.isEmpty = function () {
  return this === '';
};

/**
 * Check if a {@link String} is not empty.
 * @return {Boolean} A Boolean value.
 */
String.prototype.isNotEmpty = function () {
  return !this.isEmpty();
};

/**
 * Check if a {@link String} is an email.
 * @return {Boolean} A Boolean value.
 */
String.prototype.isEmail = function () {
  const expression = new RegExp([
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.",
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:",
    '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+',
    '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?',
  ].join(''));

  return expression.test(this);
};
