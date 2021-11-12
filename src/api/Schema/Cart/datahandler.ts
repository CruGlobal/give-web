import { Cart } from "src/types/graphql.generated";

//TODO: fill out interface with REST data
export interface GetCartResponse {
  lineItems: {
    item: {
      self: {
        uri: string;
      };
    };
    itemCode: {
      code: string;
      'product-code': string;
    };
    itemDefinition: {
      'details': any;
      'display-name': string;
    };
    rate: {
      cost: {
        amount: number;
        'amount-with-fees': number;
      };
      recurrence: {
        display: string;
      };
      self: {
        uri: string;
      };
    };
    'recurring-day-of-month': any;
    'recurring-start-month': any;
  }[];
  rateTotals: {
    cost: {
      amount: number;
      'amount-with-fees': number;
      display: number;
      'display-with-fees': number;
    };
    recurrence: {
      interval: string;
    };
  }[];
  total: {

  }
}


const CartDataHandler = (data: GetCartResponse): Cart => {
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
