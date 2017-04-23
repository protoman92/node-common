/**
 * Check if a Boolean value is true.
 * @param {Boolean} bool A Boolean value.
 * @return {Boolean} A Boolean value.
 */
Boolean.isTrue = function isTrue(bool) {
  return Boolean.isInstance(bool) && bool;
};

/**
 * Create a random Boolean value.
 * @param {Float} threshold The probability of getting a true value.
 * @return {Boolean} A Boolean value.
 */
Boolean.random = function random(threshold) {
  return (1 - Math.random()) < parseFloat(threshold || 0.5);
};
