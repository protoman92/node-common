const baseDir = '../../../..';
const shareDir = `${baseDir}/node-common`;
const sharedHandlerDir = `${shareDir}/handlers`;
const utils = require(`${sharedHandlerDir}/util/common.js`);

const main = this;

exports.includeUtils = function () {
  utils.includeUtils({
    directory: __dirname,
    prepend: '',
  });
};
