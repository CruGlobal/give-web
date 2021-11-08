
const CartResolvers = {
  Query: {
    cart: (
      _source,
      {},
      { datasources },
    ) => {
      return datasources.restApi.getCart();
    },
  },
};

export { CartResolvers };