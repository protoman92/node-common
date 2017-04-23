/**
 * Check if a {@link String} is empty.
 * @param {String} str A String value.
 * @return {Boolean} A Boolean value.
 */
String.isEmpty = function isEmpty(str) {
  return str.isEmpty();
};

/**
 * Check if a {@link String} is not empty.
 * @param {String} str A String value.
 * @return {Boolean} A Boolean value.
 */
String.isNotEmpty = function isNotEmpty(str) {
  return str.isNotEmpty();
};

/**
 * Check if a {@link String} is empty.
 * @return {Boolean} A Boolean value.
 */
String.prototype.isEmpty = function isEmpty() {
  return this === '';
};

/**
 * Check if a {@link String} is not empty.
 * @return {Boolean} A Boolean value.
 */
String.prototype.isNotEmpty = function isNotEmpty() {
  return !this.isEmpty();
};

/**
 * Capitalize the first letter of each component sub-{@link String}.
 * @return {String} A String value.
 */
String.prototype.capitalize = function capitalize() {
  return this.split(' ')
    .filter(String.isNotEmpty)
    .map((component) => {
      const firstLetter = component[0].toUpperCase();
      const remainder = component.substring(1, component.length);
      return firstLetter + remainder;
    })
    .join(' ');
};
