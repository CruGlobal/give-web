import { Resolvers } from "@apollo/client";


const CartResolvers: Resolvers = {
  Query: {
    cart: async (
      _source,
      {},
      { dataSources },
    ) => {
      return dataSources.restApi.getCart();
    },
  },
};

export { CartResolvers };