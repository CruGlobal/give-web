import { ApolloServer } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';

import schema from './Schema';
import { CartDataHandler, GetCartResponse } from './Schema/Cart/datahandler';
import { cortexScope } from '../common/app.constants';

class RestApi extends RESTDataSource {

  constructor() {

    super();

    this.baseURL = 'https://give-stage2.cru.org';
  }

  async getCart() {

    /*zoom: {
      lineItems: 'lineitems:element[],lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,lineitems:element:itemfields',
      rateTotals: 'ratetotals:element[]',
      total: 'total,total:cost'
    }*/

    const { data }: { data: GetCartResponse } = await this.get(`cortex/carts/${cortexScope}/default`);

    return CartDataHandler(data, {});
  }
}

export interface Context {
  dataSources: { restApi: RestApi };
}

const server  = new ApolloServer({
  schema,
  dataSources: () => {
    return { restApi: new RestApi() };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
