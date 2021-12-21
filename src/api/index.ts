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

    const { data }: { data: GetCartResponse } = await this.get(`cortex/carts/${cortexScope}/default`);

    return CartDataHandler(data);
  }
}

export interface Context {
  dataSources: { restApi: RestApi };
}

const server = new ApolloServer({
  schema,
  dataSources: () => {
    return { restApi: new RestApi() };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
