const data = require('./data');

const {beans} = data;

exports.resolvers = {
  Bean: {
    // eslint-disable-next-line no-undef
    __resolveType: object => BeanTypes[object.type]
  },

  Query: {
    beans: () => {
      return beans;
    }
  },

  Mutation: {
    addBean: (parent, {input}) => {
      const bean = {...input};
      beans.push(bean);
      return bean;
    }
  }
};
