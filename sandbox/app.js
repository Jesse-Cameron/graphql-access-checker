const Hapi = require('hapi');
const {ApolloServer} = require('apollo-server-hapi');
const jwt = require('jsonwebtoken');
const {intersection, isEmpty} = require('lodash');
const {authDirective, authDirectiveTypeDef} = require('../lib/app');

const {typeDefs} = require('./type-defs');
const {resolvers} = require('./resolvers');

const magicFunction = (context, variables) => {
  const token = context.headers.authorization;
  if (!token) {
    return false;
  }

  const {roles} = jwt.decode(context.headers.authorization);
  return !isEmpty(intersection(roles, variables));
};

exports.buildServer = async validatorFunc => {
  const server = new Hapi.Server({
    port: 3000,
    host: 'localhost'
  });

  const auth = authDirective(validatorFunc);

  const apolloServer = new ApolloServer({
    typeDefs: [typeDefs, authDirectiveTypeDef],
    resolvers,
    schemaDirectives: {
      auth
    },
    context: ({request}) => {
      return {headers: request.headers, payload: request.payload, path: request.path, params: request.params};
    }
  });

  await apolloServer.applyMiddleware({app: server, path: '/graphql'});

  await apolloServer.installSubscriptionHandlers(server.listener);

  try {
    await server.start();
  } catch (error) {
    console.log(`Error whilst starting the server: ${error.message}`);
  }

  return server;
};

// If we are running as a script
if (!module.parent) {
  (async () => {
    const server = await this.buildServer(magicFunction);
    console.log(`The server is running at ${server.info.uri}`);
  })();
}

