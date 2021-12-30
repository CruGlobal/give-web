import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Cart = {
  __typename?: 'Cart';
  gifts: Array<Gift>;
  id: Scalars['ID'];
  totalGifts: Scalars['Int'];
};

export type Gift = {
  __typename?: 'Gift';
  amount: Scalars['Float'];
  commentsToDSG?: Maybe<Scalars['String']>;
  commentsToRecipient?: Maybe<Scalars['String']>;
  recipient: GiftRecipient;
  recurrence: GiftRecurrence;
  recurringDayOfMonth?: Maybe<Scalars['String']>;
};

export type GiftRecipient = {
  __typename?: 'GiftRecipient';
  designationNumber: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  organizationId: Scalars['String'];
  replacementDesignation?: Maybe<Scalars['String']>;
  status: GiftRecipientStatus;
  type: GiftRecipientType;
};

export enum GiftRecipientStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export enum GiftRecipientType {
  NationalStaff = 'NATIONAL_STAFF',
  Project = 'PROJECT',
  Scholarship = 'SCHOLARSHIP',
  Staff = 'STAFF',
  Student = 'STUDENT',
  Volunteer = 'VOLUNTEER'
}

export enum GiftRecurrence {
  Annually = 'ANNUALLY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  SemiAnnually = 'SEMI_ANNUALLY',
  Single = 'SINGLE'
}

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
};

export type GetCartQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetCartQuery = { __typename?: 'Query', cart?: { __typename?: 'Cart', gifts: Array<{ __typename?: 'Gift', amount: number }> } | null | undefined };


export const GetCartDocument = gql`
    query GetCart {
  cart {
    gifts {
      amount
    }
  }
}
    `;

/**
 * __useGetCartQuery__
 *
 * To run a query within a React component, call `useGetCartQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCartQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCartQuery(baseOptions?: Apollo.QueryHookOptions<GetCartQuery, GetCartQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
      }
export function useGetCartLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCartQuery, GetCartQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
        }
export type GetCartQueryHookResult = ReturnType<typeof useGetCartQuery>;
export type GetCartLazyQueryHookResult = ReturnType<typeof useGetCartLazyQuery>;
export type GetCartQueryResult = Apollo.QueryResult<GetCartQuery, GetCartQueryVariables>;