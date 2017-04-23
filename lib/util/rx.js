const rx = require('rx');
const env = require('./environment.js');
const utils = require('./common.js');

const throwObservable = rx.Observable.throw;

/**
 * Temporary override. Remove when in production.
 */
rx.Observable.throw = function throwError(err) {
  if (String.isInstance(err)) {
    return throwObservable(Error(err));
  }

  return throwObservable(err);
};

/**
 * Continue another {@link Observable} if the current one is empty.
 * @param  {rx.Observable} obs An Observable object, or a Function that
 * returns an Observable.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.switchIfEmpty = function emptySwitch(obs) {
  return this.defaultIfEmpty(obs).flatMap((val) => {
    if (val === obs) {
      return obs;
    } else if (Function.isInstance(val)) {
      return val();
    }

    return rx.Observable.just(val);
  });
};

/**
 * Emit an error if the current {@link Observable} is empty.
 * @param  {object} err An error object.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.throwIfEmpty = function throwSwitch(err) {
  const error = err instanceof Error ? err : new Error(err);
  const switched = rx.Observable.throw(error);
  return this.switchIfEmpty(switched);
};

/**
 * Continue emitting another value if an error is encountered. Uses
 * {@link #onErrorResumeNext} implicitly, which concatenates. If this
 * behavior is not the desired one, use {@link catch} instead.
 * @param  {object} value An object of any type.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.onErrorReturn = function errorReturn(value) {
  return this.onErrorResumeNext(rx.Observable.just(value));
};

/**
 * Switch to an empty {@link Observable} if the current one throws an error.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.onErrorSwitchToEmpty = function errorSwitch() {
  return this.onErrorResumeNext(rx.Observable.empty());
};

/**
 * Continue emitting another value if an error is encountered. Uses
 * {@link #catch} implicitly, which does not concatenate.
 * @param  {object} value An object of any type.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchReturn = function catchReturn(value) {
  return this.catch(rx.Observable.just(value));
};

/**
 * Switch to an empty {@link Observable} if the current one throws an error.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.catchSwitchToEmpty = function catchSwitch() {
  return this.catch(rx.Observable.empty());
};

/**
 * Immediately emit the current value, then resume another {@link Observable}.
 * @param  {Function} fcn A function that returns an Observable to be resumed.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.emitThenResume = function emit(fcn) {
  const instance = this;

  if (Function.isInstance(fcn)) {
    return this.flatMap(value => rx.Observable
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
rx.Observable.prototype.flatMapIfSatisfied = function flatMap(cond, fcn1, fcn2) {
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

/**
 * Log onNext's output.
 * @param  {Function} convert A Function that converts the value to another
 * value. This parameter is optional.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.logNext = function logNext(convert) {
  return this.doOnNext((val) => {
    if (Function.isInstance(convert)) {
      utils.log(convert(val));
    } else {
      utils.log(val);
    }
  });
};

/**
 * Log onError's output.
 * @param  {Function} convert A Function that converts the error to another
 * value. This parameter is optional.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.prototype.logError = function logError(convert) {
  return this.doOnError((err) => {
    if (Function.isInstance(convert)) {
      utils.log(convert(err));
    } else {
      utils.log(err);
    }
  });
};

/**
 * Similar to {@link Observable#from}, but accepts a key-value {@link Object}.
 * @return {rx.Observable} An Observable object.
 */
rx.Observable.fromObject = function from(obj) {
  if (Object.isInstance(obj)) {
    return rx.Observable
      .from(utils.getEntries(obj))
      .filter(entry => entry && entry.length === 2)
      .map(entry => ({ key: entry[0], value: entry[1] }));
  }

  return rx.Observable.throw(new Error('Not an object'));
};
