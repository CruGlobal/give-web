import { buildFederatedSchema } from '@apollo/federation';

import NextDrawDateTypeDefs from './NextDrawDate/nextDrawDate.graphql';
import { NextDrawDateResolvers } from './NextDrawDate/resolvers';

const schema = buildFederatedSchema([
  { typeDefs: NextDrawDateTypeDefs, resolvers: NextDrawDateResolvers },
]);

export default schema;
