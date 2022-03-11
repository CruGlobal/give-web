import { buildFederatedSchema } from '@apollo/federation';

import CartTypeDefs from './Cart/cart.graphql';
import { CartResolvers } from './Cart/resolvers';
import NextDrawDateTypeDefs from './NextDrawDate/nextDrawDate.graphql';
import { NextDrawDateResolvers } from './NextDrawDate/resolvers';

const schema = buildFederatedSchema([
  { typeDefs: CartTypeDefs, resolvers: CartResolvers },
  { typeDefs: NextDrawDateTypeDefs, resolvers: NextDrawDateResolvers },
]);

export default schema;
