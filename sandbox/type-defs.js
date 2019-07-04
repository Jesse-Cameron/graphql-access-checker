const { gql } = require('apollo-server')

exports.typeDefs = gql`
  input BeanInput {
    name: String
  }

  type Bean {
    name: String,
  }

  type Query {
    beans: [Bean]
  }

  type Mutation {
    addBean(input: BeanInput): Bean
  }
`;
