const Hapi = require('hapi');
const {ApolloServer} = require('apollo-server-hapi');

const {typeDefs} = require('./type-defs');
const {resolvers} = require('./resolvers');

const server = new Hapi.Server({
  port: 3000,
  host: 'localhost'
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
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
