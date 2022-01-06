import { Resolvers } from "@apollo/client";


const NextDrawDateResolvers: Resolvers = {
  Query: {
    cart: async (
      _source,
      {},
      { dataSources },
    ) => {
      return dataSources.restApi.getNextDrawDate();
    },
  },
};

export { NextDrawDateResolvers };