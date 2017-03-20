// @flow

String.randomString = function (length) {
  const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return new Array(length)
    .fill('')
    .map(() => Math.floor(Math.random() * all.length))
    .map(index => all.charAt(index))
    .join('');
};
