import { Resolvers } from '../../../../graphql/schema.graphql';


const CartResolvers: Resolvers = {
  Query: {
    cart: (
      _source,
      {},
      { dataSources },
    ) => {
      return dataSources.restApi.getCart();
    },
  },
};

export { CartResolvers };