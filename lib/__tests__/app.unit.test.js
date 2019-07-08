const {authDirective} = require('../app');

describe('Auth Schema Directive', () => {
  test('correctly returns an the directive', () => {
    const customFunc = () => {};
    const auth = authDirective(customFunc);
    expect(typeof auth).toBe('function'); // In js classes are functinos
  });

  test('throws an type error if no function is passed in', () => {
    const customFunc = undefined;
    expect(() => authDirective(customFunc)).toThrow('The custom function passed in is not valid');
  });
});
