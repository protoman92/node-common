// @flow

/**
 * Create a random {@link String} based on the specified length.
 * @return {String} A String object.
 */
String.random = function (length) {
  const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return new Array(length).fill('')
    .map(() => Math.floor(Math.random() * all.length))
    .map(index => all.charAt(index))
    .join('');
};
