export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  items: Array<CartItem>;
  total: Scalars['Float'];
};

export type CartItem = {
  __typename?: 'CartItem';
  code: Scalars['String'];
  displayName: Scalars['String'];
  orgId: Scalars['String'];
  price: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
};

export type GetCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartQuery = { __typename?: 'Query', cart?: { __typename?: 'Cart', items: Array<{ __typename?: 'CartItem', displayName: string }> } | null | undefined };
