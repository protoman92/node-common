const rx = require('rx');
const { faker } = require('../util');

const timeout = 1000000;

describe('Functionality Tests', () => {
  it(
    'Reduce Test',
    (done) => {
      const source = rx.Observable.just([1, 2, 3]);

      source
        .reduce((a, b) => a.concat(b), [])
        .subscribe(
          (val) => {
            console.log(val);
          },

          (err) => {
            done.fail(err);
          },

          () => {
            done();
          },
        );
    }, timeout);

  it(
    'Retry Test',
    (done) => {
      rx.Observable.range(1, 5)
        .filter(a => Boolean.random() ? true : a % 2 == 0)
        .throwIfEmpty(new Error())
        .retry(0)
        .subscribe(
          (val) => {
            console.log(val);
          },

          (err) => {
            done.fail(err);
          },

          () => {
            done();
          },
        );
    }, timeout);

  it(
    'Emit-Resume Test',
    (done) => {
      const loop = function (val) {
        return rx.Observable.just(val)
          .filter(a => a <= 10)
          .emitThenResume(a => loop(a + 1))
          .delay(10);
      };

      loop(0).subscribe(
        (val) => {
          console.log(val);
        },

        (err) => {
          done.fail(err);
        },

        () => {
          done();
        });
    }, timeout);

  it(
    'SwitchMap test',
    (done) => {
      const start = 1;
      const end = 10;

      rx.Observable
        .range(start, end)
        .flatMapLatest(val => rx.Observable.range(0, val))
        .toArray()
        .subscribe(
          (val) => {
            /**
             * The last observable to emit value will be mirrored,
             * while all older ones are stopped halfway.
             */
            expect(val.length).toBe(2 * end - start);
          },

          (err) => {
            done.fail(err);
          },

          () => {
            done();
          });
    }, timeout);

  it(
    'SwitchMap test for autocomplete search',
    (done) => {
      const totalCount = 1000;
      const documents = Number.range(totalCount).map(_ => faker.word());

      const searchDocuments = query => rx.Observable
        .just(query)
        .map(q => documents.find(a => a.includes(q)))
        .filter(item => item)
        /**
         * Even with a very small delay in subscription, we can
         * treat this as an async operation on a database. If we
         * use flatMap, we can expect all queries to be executed
         * and the end results will contain stale documents.
         * Therefore, we must use flatMapLatest to mirror only the
         * latest Observable.
         */
        .delay(1);

      rx.Observable
        .from(documents)
        .map(item => item.split(''))
        .concatMap(chars => rx.Observable
          .from(chars)
          .scan((a, b) => a + b, '')
          .flatMapLatest(query => searchDocuments(query)),
        )
        .toArray()
        .doOnNext((val) => {
          /**
           * Since we are only mirroring the latest Observable,
           * we can expect the length of the result array is
           * exactly equal to the total number of documents. This
           * is because only the last item for each set of queries
           * is executed. For example, if the word 'cat' can be
           * processed into ['c', 'ca', 'cat'], only 'cat' will be
           * executed - because we placed a delay on the search
           * engine.
           */
          expect(val.length).toBe(totalCount);
        })
        .subscribe(
          (val) => {
            console.log(val.length);
          },

          (err) => {
            done.fail(err);
          },

          () => {
            done();
          });
    }, timeout);

  it(
    'Range test',
    (done) => {
      rx.Observable.range(1)
        .doOnNext((val) => {
          console.log(val);
        })
        .subscribe(
          () => {},
          () => {},
          () => {
            done();
          },
        );
    }, timeout);

  it(
    'From test',
    (done) => {
      rx.Observable.fromObject({ a: 2, b: 2 })
        .logNext()
        .subscribe(
          () => {},
          () => {},
          () => {
            done();
          });
    }, timeout);

  it(
    'If test',
    (done) => {
      rx.Observable.if(
        () => true,
        rx.Observable.just(45),
        rx.Observable.create((observer) => {
          observer.onNext(46);
        }),
      )
      .subscribe(
        (val) => {
          console.log(val);
        },
        () => {},
        () => {
          done();
        });
    }, timeout);

  it.only(
    'From/Catch test',
    (done) => {
      const convert = (val) => {
        if (val % 2 === 0) {
          return rx.Observable.just(val);
        }

        return rx.Observable.throw(new Error());
      };

      rx.Observable.range(1, 100)
        .flatMap(val => convert(val)
        .catchSwitchToEmpty())
        .last()
        .subscribe(
          (val) => {
            console.log(val);
          },
          (err) => {
            done.fail(err);
          },
          () => {
            done();
          },
        );
    },
  );
});
