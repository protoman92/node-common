// @flow

Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }

  return this;
};
