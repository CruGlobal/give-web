import { Resolvers } from 'src/types/graphql.generated';


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