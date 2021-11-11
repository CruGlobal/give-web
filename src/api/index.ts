import { ApolloServer } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';

import schema from './Schema';
import { GetCartData, CartDataHandler, GetCartIncluded } from './Schema/Cart/datahandler';

class RestApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://give-stage2.cru.org';


  }

  async getCart() {
    //TODO: define path for query
    const { data, included }: { data: GetCartData, included: GetCartIncluded } = await this.get(`carts/`);

    return CartDataHandler(data, included);
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
