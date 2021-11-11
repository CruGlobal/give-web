import { Cart } from "src/types/graphql.generated";

//TODO: fill out interface with REST data
export interface GetCartData {
  
}

export interface GetCartIncluded {
  
}


const CartDataHandler = (data: GetCartData, included: GetCartIncluded): Cart => {
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

export { CartDataHandler }
