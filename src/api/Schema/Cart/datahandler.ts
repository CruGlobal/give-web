import { Cart } from "src/types/graphql.generated";

//TODO: fill out interface with REST data
export interface GetCartData {
  
}


const CartDataHandler = (data: GetCartData): Cart => {
  //TODO: parse REST data into GQL Schema type

  return { 
    items: [
      {
        code: 'abc',
        displayName: 'Donation',
        orgId: 'Cru',
        price: 100.0,
      },
    ],
    total: 100.0,
  };
};

const CartResolver = {
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

export { CartDataHandler, CartResolver };