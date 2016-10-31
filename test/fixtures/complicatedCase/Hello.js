'use strict';

class Hello {
  constructor() {
    const greeting = `
      this
      is
      a
      multiline
      greeting
    `;

    this.unexcuted(() => { });

    throw new Error('Hello error!');
  }
}

module.exports = Hello;
