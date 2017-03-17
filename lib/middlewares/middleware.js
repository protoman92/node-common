const localizer = require('../localizer.js');
const { localizable } = require('../../public/localization');

exports.register = function (app) {
  /**
   * Intercept the response and wrap any error with a network error, with
   * localized error message and status code.
   */
  app.use((req, res, next) => {
    const oldSend = res.send;

    res.send = function (data) {
      let newData = data;

      if (Error.isInstance(data)) {
        const message = localizer.localize(req, data.message);
        newData = Error.networkError(message, data.status);
      }

      arguments[0] = newData;
      oldSend.apply(res, arguments);
    };

    next();
  });

  app.use((req, res, next) => {
    const language = req.headers['accept-language'];

    if (String.isInstance(language)) {
      req.headers['accept-language'] = language.toLowerCase();
    }

    next();
  });
};
