import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
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
  giftTotals: Array<GiftTotal>;
  gifts: Array<Gift>;
  id: Scalars['ID'];
  totalGifts: Scalars['Int'];
};

export type Gift = {
  __typename?: 'Gift';
  campaignCode: Scalars['String'];
  commentsToDSG?: Maybe<Scalars['String']>;
  commentsToRecipient?: Maybe<Scalars['String']>;
  cost: GiftCost;
  premiumCode: Scalars['String'];
  recipient: GiftRecipient;
  recurrence: GiftRecurrence;
};

export type GiftCost = {
  __typename?: 'GiftCost';
  amount: Scalars['Float'];
  amountWithFees: Scalars['Float'];
  currency: Scalars['String'];
  display: Scalars['String'];
  displayWithFees: Scalars['String'];
};

export type GiftRecipient = {
  __typename?: 'GiftRecipient';
  designationNumber: Scalars['String'];
  displayName: Scalars['String'];
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

export type GiftRecurrence = {
  __typename?: 'GiftRecurrence';
  recurrenceFrequency: GiftRecurrenceFrequency;
  recurringDayOfMonth?: Maybe<Scalars['String']>;
  recurringStartMonth?: Maybe<Scalars['String']>;
};

export enum GiftRecurrenceFrequency {
  Annually = 'ANNUALLY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  SemiAnnually = 'SEMI_ANNUALLY',
  Single = 'SINGLE'
}

export type GiftTotal = {
  __typename?: 'GiftTotal';
  cost: GiftCost;
  displayTotal: Scalars['String'];
  recurrenceFrequency: GiftRecurrenceFrequency;
};

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
  nextDrawDate: Scalars['String'];
};

export type CartItemFragment = { __typename?: 'Gift', cost: { __typename?: 'GiftCost', amount: number, amountWithFees: number, currency: string, display: string, displayWithFees: string }, recipient: { __typename?: 'GiftRecipient', id: string, designationNumber: string, displayName: string }, recurrence: { __typename?: 'GiftRecurrence', recurrenceFrequency: Types.GiftRecurrenceFrequency, recurringDayOfMonth?: string | null | undefined, recurringStartMonth?: string | null | undefined } };

export const CartItemFragmentDoc = gql`
    fragment CartItem on Gift {
  cost {
    amount
    amountWithFees
    currency
    display
    displayWithFees
  }
  recipient {
    id
    designationNumber
    displayName
  }
  recurrence {
    recurrenceFrequency
    recurringDayOfMonth
    recurringStartMonth
  }
}
    `;