const jwt = require('jsonwebtoken');
const {intersection, isEmpty} = require('lodash');
const {gql} = require('apollo-server');

const {buildServer} = require('../app');

const validatorFunction = (context, variables) => {
  const token = context.headers.authorization;
  if (!token) {
    return false;
  }

  const {roles} = jwt.decode(context.headers.authorization);
  return !isEmpty(intersection(roles, variables));
};

describe('Sandbox tests', () => {
  let server;
  let options;
  let authorization;

  const query = `
    query GetAllBeans {
      beans {
        name
        roaster
      }
    }`;

  const mutation = `
    mutation addBean($beanName: String, $roasterName: String) {
      addBean(input: { name: $beanName, roaster: $roasterName }) {
        name
        roaster
      }
    }`;

  beforeAll(async () => {
    authorization = jwt.sign({roles: ['admin']}, 'secretKey');
  });

  beforeEach(() => {
    options = {
      url: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization
      }
    };
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  test('can access fields that are permitted', async () => {
    server = await buildServer(() => true); // Allow access
    options.payload = {
      query,
      operationName: 'GetAllBeans'
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const {data, errors} = JSON.parse(payload);
    expect(data).not.toEqual(undefined); // Validate that there is data being returned
    expect(errors).toEqual(undefined); // Validate no error objects are being returned
  });

  test('can\'t access fields that are not permitted', async () => {
    server = await buildServer(() => false); // Block access
    options.payload = {
      query,
      operationName: 'GetAllBeans'
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const errorMessage = JSON.parse(payload).errors[0].message;
    expect(errorMessage).toEqual('Access check failed.');
  });

  test('can access mutations that are permitted', async () => {
    server = await buildServer(() => true); // Allow access
    options.payload = {
      query: mutation,
      operationName: 'addBean',
      variables: {
        beanName: 'testBean',
        roasterName: 'testRoaster'
      }
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const {data, errors} = JSON.parse(payload);
    expect(data).not.toEqual(undefined); // Validate that there is data being returned
    expect(errors).toEqual(undefined); // Validate no error objects are being returned
  });

  test('can\'t access fields from a mutation that is restricted', async () => {
    const extraTypeDefs = gql`
      type Mutation {
        publicAddBean(input: BeanInput): Bean
      }
    `;
    server = await buildServer(() => false, [extraTypeDefs]); // Deny access on other Bean.roaster
    options.payload = {
      query: mutation,
      operationName: 'addBean',
      variables: {
        beanName: 'testBean',
        roasterName: 'testRoaster'
      }
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const errorMessage = JSON.parse(payload).errors[0].message;
    expect(errorMessage).toEqual('Access check failed.');
  });

  test('can access the context object', async () => {
    server = await buildServer(validatorFunction); // Allow access
    options.payload = {
      query,
      operationName: 'GetAllBeans'
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const {data, errors} = JSON.parse(payload);
    expect(data).not.toEqual(undefined); // Validate that there is data being returned
    expect(errors).toEqual(undefined); // Validate no error objects are being returned
  });
  test('can validate when using a function that is a promise', async () => {
    const validatorFunctionPromise = new Promise(resolve => {
      setTimeout(() => {
        resolve(false);
      }, 100);
    });
    server = await buildServer(() => validatorFunctionPromise); // Allow access
    options.payload = {
      query,
      operationName: 'GetAllBeans'
    };
    const {statusCode, payload} = await server.inject(options);
    expect(statusCode).toEqual(200);
    const errorMessage = JSON.parse(payload).errors[0].message;
    expect(errorMessage).toEqual('Access check failed.');
  });
});
