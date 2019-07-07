const {gql} = require('apollo-server');

exports.typeDefs = gql`
  input BeanInput {
    name: String,
    roaster: String
  }

  type Bean {
    name: String,
    roaster: String @auth(accessLevel: ["admin"])
  }

  type Query {
    beans: [Bean]
  }

  type Mutation {
    addBean(input: BeanInput): Bean @auth(accessLevel: ["admin"])
  }
`;
