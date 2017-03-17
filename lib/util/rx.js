const rx = require('rx');

/**
 * Continue another {@link Observable} if the current one is empty.
 * @param  {rx.Observable} obs An Observable object.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.switchIfEmpty = function (obs) {
  return this.defaultIfEmpty(obs).flatMap((val) => {
    if (val === obs) {
      return obs;
    }

    return rx.Observable.just(val);
  });
};

/**
 * Emit an error if the current {@link Observable} is empty.
 * @param  {object} err An error object.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.throwIfEmpty = function (err) {
  const error = err instanceof Error ? err : new Error(err);
  return this.switchIfEmpty(rx.Observable.throw(error));
};

/**
 * Continue emitting another value if an error is encountered. Uses
 * {@link #onErrorResumeNext} implicitly, which concatenates. If this
 * behavior is not the desired one, use {@link catch} instead.
 * @param  {object} value An object of any type.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchReturn = function (value) {
  return this.onErrorResumeNext(rx.Observable.just(value));
};

/**
 * Switch to an empty {@link Observable} if the current one throws an error.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchSwitchToEmpty = function () {
  return this.onErrorResumeNext(rx.Observable.empty());
};

/**
 * Continue emitting another value if an error is encountered. Uses
 * {@link #catch} implicitly, which does not concatenate.
 * @param  {object} value An object of any type.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchReturn = function (value) {
  return this.catch(rx.Observable.just(value));
};

/**
 * Switch to an empty {@link Observable} if the current one throws an error.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchSwitchToEmpty = function () {
  return this.catch(rx.Observable.empty());
};

/**
 * Call {@link #toArray}, then iterate through all elements in the emitted
 * {@link Array}.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.toArrayThenIterate = function () {
  return this.toArray().flatMap(array => rx.Observable.from(array));
};

/**
 * Immediately emit the current value, then resume another {@link Observable}.
 * @param  {Function} fcn A function that returns an Observable to be resumed.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.emitThenResume = function (fcn) {
  const instance = this;

  if (Function.isInstance(fcn)) {
    return this
      .flatMap(value => rx.Observable
        .just(value)
        .concat(fcn(value, instance)));
  }

  const error = `${String(fcn)} is not a function`;
  return rx.Observable.throw(error);
};

/**
 * {@link #flatMap} if a certain condition is satified, otherwise resume the
 * current stream.
 * @param  {Function} cond A function that returns a Boolean value.
 * @param  {Function} fcn1 A function that returns an Observable object to
 * continue the stream. This function accepts two parameters, the first one
 * being the current Observable object, and the second one being the value
 * being emitted by the current Observable object.
 * @param  {Function} fcn2 An optional function that returns an Observable.
 * Executed if the condition is not satisfied.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.flatMapIfSatisfied = function (cond, fcn1, fcn2) {
  const instance = this;

  if (Function.isInstance(cond, fcn1)) {
    return instance.flatMap((val) => {
      const satisfied = Boolean.cast(cond(val));

      if (satisfied) {
        return fcn1(val, instance);
      } else if (Function.isInstance(fcn2)) {
        return fcn2(val, instance);
      }

      return rx.Observable.just(val);
    });
  }

  const error = 'Parameters must be functions';
  return rx.Observable.throw(error);
};
