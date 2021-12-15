/* eslint-disable */
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
  id: Scalars['String'];
  items: Array<CartItem>;
  rateTotal: Array<CartRateTotal>;
  total: CartTotal;
};

export type CartItem = {
  __typename?: 'CartItem';
  amount: Scalars['Float'];
  amountWithFees: Scalars['Float'];
  campaignCode: Scalars['String'];
  code: Scalars['String'];
  details: Array<CartItemDetail>;
  displayName: Scalars['String'];
  orgId?: Maybe<Scalars['String']>;
  premiumCode: Scalars['String'];
  price: Scalars['String'];
  productCode: Scalars['String'];
  quantity: Scalars['Int'];
  recurrence: CartItemRecurrence;
  recurringDayOfMonth: Scalars['String'];
  recurringStartOfMonth: Scalars['String'];
  startDate: CartItemStartDate;
  uri: Scalars['String'];
};

export type CartItemDetail = {
  __typename?: 'CartItemDetail';
  displayName: Scalars['String'];
  displayValue: Scalars['String'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type CartItemRecurrence = {
  __typename?: 'CartItemRecurrence';
  display: Scalars['String'];
  interval: Scalars['String'];
};

export type CartItemStartDate = {
  __typename?: 'CartItemStartDate';
  displayValue: Scalars['String'];
  value: Scalars['Int'];
};

export type CartRateTotal = {
  __typename?: 'CartRateTotal';
  cost: CartRateTotalCost;
  display: Scalars['String'];
  recurrence: CartItemRecurrence;
};

export type CartRateTotalCost = {
  __typename?: 'CartRateTotalCost';
  amount: Scalars['Float'];
  amountWithFees: Scalars['Float'];
  currency: Scalars['String'];
  display: Scalars['String'];
  displayWithFees: Scalars['String'];
};

export type CartTotal = {
  __typename?: 'CartTotal';
  amount: Scalars['Float'];
  currency: Scalars['String'];
  display: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
};
