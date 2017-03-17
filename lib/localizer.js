const i18n = require('i18n');

const baseDir = '..';
const localizable = require(`${baseDir}/public/localization/localizable.js`);

exports.localize = function (req, text) {
  if (localizable[text]) {
    return i18n.__(text);
  }

  return text;
};
