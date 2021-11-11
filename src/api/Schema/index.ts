import { buildFederatedSchema } from '@apollo/federation';

import CartTypeDefs from './Cart/cart.graphql';
import { CartResolvers } from './Cart/resolvers';

const schema = buildFederatedSchema([
  { typeDefs: CartTypeDefs, resolvers: CartResolvers, },
]);

export default schema;