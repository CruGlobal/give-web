import { ApolloServer } from 'apollo-server';
import { Book } from 'src/types/graphql.generated';
import cartTypeDefs from './Cart/cart.graphql';

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

const server  = new ApolloServer({ typeDefs: cartTypeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
