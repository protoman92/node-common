const sinon = require('sinon');

describe('Stub/Mock Tests', () => {
  const api = {
    a: {
      func1: () => true,
      func2: () => false,
    },

    b: {
      func1: () => 'func1',
      func2: () => 'func2',
    },
  };

  class API {
    static get api() {
      return api;
    }
  }

  beforeEach((done) => {
    sinon.stub(api.a, 'func1').callsFake(() => 'stubbed api.a.func1');
    done();
  });

  afterEach((done) => {
    api.a.func1.restore();
    done();
  });

  it('Stubs/Mocks should work correctly', (done) => {
    expect(api.a.func1()).toBe('stubbed api.a.func1');
    done();
  });

  it('Stubs/Mocks for class should work correctly', (done) => {
    console.log(API.api.a.func1());
    done();
  });
});
