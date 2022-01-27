import { ApolloServer } from 'apollo-server';
import { RESTDataSource } from 'apollo-datasource-rest';

import schema from './Schema';
import { NextDrawDateDataHandler, GetNextDrawDateResponse } from './Schema/NextDrawDate/datahandler';

class RestApi extends RESTDataSource {
  
  constructor() {

    super();
    
    this.baseURL = process.env.API_URL;
  }

  async getNextDrawDate() {

    const { data }: { data: GetNextDrawDateResponse } = await this.get(
      `cortex/nextdrawdate`,
    );
    
    return NextDrawDateDataHandler(data);
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
