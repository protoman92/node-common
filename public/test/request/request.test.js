const request = require('request');

const requestTimeout = 100000;

describe('Function Tests', () => {
  it(
    'Head requests should return correct headers',
    (done) => {
      request.head(
        'https://techcrunch.com/wp-json/',
        (err, res, body) => {
          console.log(err);
          console.log(res.headers, res.statusCode);
          done();
        },
      );
    }, requestTimeout);
});
