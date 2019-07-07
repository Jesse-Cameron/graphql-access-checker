const Hapi = require('hapi');
const {ApolloServer} = require('apollo-server-hapi');
const jwt = require('jsonwebtoken');
const {intersection, isEmpty} = require('lodash');
const {authDirective, authDirectiveTypeDef} = require('../lib/app');

const {typeDefs} = require('./type-defs');
const {resolvers} = require('./resolvers');

const server = new Hapi.Server({
  port: 3000,
  host: 'localhost'
});

const magicFunction = (context, variables) => {
  const token = context.headers.authorization;
  if (!token) {
    return false;
  }

  const {roles} = jwt.decode(context.headers.authorization);
  return !isEmpty(intersection(roles, variables));
};

const auth = authDirective(magicFunction);

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

async function startServer() {
  await apolloServer.applyMiddleware({app: server, path: '/graphql'});

  await apolloServer.installSubscriptionHandlers(server.listener);

  try {
    await server.start();
    console.log(`The server is running at ${server.info.uri}`);
  } catch (error) {
    console.log(`Error whilst starting the server: ${error.message}`);
  }
}

startServer();
