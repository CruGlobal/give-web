import { } from '../../../../graphql/types.generated';

export interface GetNextDrawDateResponse {
  'next-draw-date': string;
}

//Convert REST response to GraphQL types
const NextDrawDateDataHandler = (data: GetNextDrawDateResponse): string => {

  return data['next-draw-date'];
};

export { NextDrawDateDataHandler }
