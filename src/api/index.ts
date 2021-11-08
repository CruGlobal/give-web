import { ApolloServer } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';

import schema from './Schema';
import { GetCartData, CartDataHandler } from './Schema/Cart/datahandler';

const books: Book[] = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

class RestApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://give-stage2.cru.org';
  }

  async getCart() {
    //TODO: define path for query
    const { data, included }: { data: GetCartData, included: any } = await this.get(``);

    return CartDataHandler(data);
  }
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
