const {SchemaDirectiveVisitor} = require('graphql-tools');
const {defaultFieldResolver} = require('graphql');
const {gql} = require('apollo-server');

let validatorFunction;

const censorResponse = (result) => {
  // If we are returning a literal, simply return an error message
  const resultType = typeof result;
  if (['string', 'number', 'bigint', 'boolean', 'symbol'].includes(resultType)) {
    return 'You do not have access to this field';
  }

  // if field.type.ofType instanceof GraphQlScalarType
};

const authDirectiveBuilder = customFunction => {
  if (!(typeof customFunction === 'function')) {
    throw new TypeError('The custom function passed in is not valid');
  }

  validatorFunction = customFunction;
  return AuthDirective;
};

const authDirectiveTypeDef = gql`
  directive @auth(
    accessLevel: [String]
  ) on OBJECT | FIELD_DEFINITION | MUTATION | QUERY | SUBSCRIPTION
`;

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAccessLevel = this.args.accessLevel;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAccessLevel = this.args.accessLevel;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) {
      return;
    }

    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const {resolve = defaultFieldResolver} = field;
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredAccessLevel =
          field._requiredAccessLevel ||
          objectType._requiredAccessLevel;

        // If there are is no required auth level then let the request through
        if (!requiredAccessLevel) {
          return resolve.apply(this, args);
        }

        const context = args[2];
        const isAllowed = validatorFunction(context, requiredAccessLevel);
        if (!isAllowed) {
          const result = resolve.apply(this, args);
          // censorResponse(result);

          throw new Error('Access check failed.');
        }

        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = {
  authDirective: customFunction => authDirectiveBuilder(customFunction),
  authDirectiveTypeDef
};
