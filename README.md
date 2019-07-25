# graphql-access-checker

[![Build Status](https://travis-ci.org/Jesse-Cameron/graphql-access-checker.svg?branch=master)](https://travis-ci.org/Jesse-Cameron/graphql-access-checker)

A smallish library for easily creating auth with a [schema directive](https://www.apollographql.com/docs/graphql-tools/schema-directives/)

### Package Dependencies

- node >= 8.X
- apollo-server >= 2.6.X

## Auth Directive Documentation

`authDirective`

**args:**

- *validatorFunction* (function, required) - the function to run on incoming requests. Returns a boolean. Has two arguments:
    - *context*: (object) - apollo-server context object
    - *validAccess* (array) - the list of valid access levels (i.e. roles or permissions)

`authDirectiveTypeDef`

 - An gql object containing the the typedef for the schema directive

## Example Implementation

For an example implementation please consult the sandbox [file](sandbox/app.js)
