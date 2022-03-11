import { Cart, Gift, GiftCost, GiftRecipient, GiftRecipientStatus, GiftRecipientType, GiftRecurrence, GiftRecurrenceFrequency, GiftTotal } from '../../../../graphql/types.generated';

interface RESTResponseLink {
  href: string;
  rel: string;
  rev: string;
  type: string;
  uri: string;
}

interface RESTResponseSelfReference {
  href: string;
  type: string;
  uri: string;
}

export interface GetCartResponse {
  id: string;
  lineItems: CartResponseLineItem[];
  rateTotals: CartResponseRateTotal[];
  rawData: {
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
    "total-quantity": number;
  };
  total: CartResponseTotal
}

interface CartResponseLineItem {
  id: string;
  availability: {
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
    state: string;
  };
  item: {
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
  };
  itemCode: {
    code: string;
    links: RESTResponseLink[];
    "product-code": string;
    self: RESTResponseSelfReference;
  };
  itemDefinition: {
    details: CartItemDetail[];
    "display-name": string;
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
  };
  itemfields: {
    amount: number;
    "amount-with-fees": number;
    "campaign-code": string;
    "donation-services-comments": string;
    links: RESTResponseLink[];
    "premium-code": string;
    "recipient-comments": string;
    "recurring-day-of-month": string;
    "recurring-start-of-month": string;
    self: RESTResponseSelfReference;
  };
  links: RESTResponseLink[];
  quantity: number;
  rate: {
    cost: {
      amount: number;
      "amount-with-fees": number;
      currency: string;
      display: string;
      "display-with-fees": string;
    }
    display: string;
    links: RESTResponseLink[];
    recurrence: {
      display: string;
      interval: string;
    };
    self: RESTResponseSelfReference;
    "start-date": {
      "display-value": string;
      value: number;
    };
  };
  self: RESTResponseSelfReference;
  total: {
    cost: {
      amount: number;
      currency: string;
      display: string;
    }[];
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
  };
}

interface CartItemDetail {
  "display-name": string;
  "display-value": string;
  name: string;
  value: string;
}

interface CartResponseRateTotal {
  cost: {
    amount: number;
    "amount-with-fees": number;
    currency: string;
    display: string;
    "display-with-fees": string;
  };
  display: string;
  links: RESTResponseLink[];
  recurrence: {
    display: string;
    interval: string;
  };
  self: RESTResponseSelfReference;
}

interface CartResponseTotal {
  cost: {
    amount: number;
    currency: string;
    display: string;
  };
  links: RESTResponseLink[];
  self: RESTResponseSelfReference;
}

//Convert REST response to GraphQL types
const CartDataHandler = (data: GetCartResponse): Cart => {

  const gifts = data.lineItems.map(item => createGift(item));
  const giftTotals = data.rateTotals.map(rateTotal => createGiftTotal(rateTotal));

  return {
    id: data.id,
    gifts,
    giftTotals,
    totalGifts: gifts.length,
  };
};

const createGift = (item: CartResponseLineItem): Gift => {

  const { itemfields } = item;

  return {
    campaignCode: itemfields['campaign-code'],
    commentsToDSG: itemfields['donation-services-comments'],
    commentsToRecipient: itemfields['recipient-comments'],
    cost: createGiftCost(item),
    premiumCode: itemfields['premium-code'],
    recipient: createGiftRecipient(item),
    recurrence: createGiftRecurrence(item),
  }
};

const createGiftCost = (item: CartResponseLineItem): GiftCost => {

  const { cost } = item.rate;

  return {
    amount: cost.amount,
    amountWithFees: cost['amount-with-fees'],
    currency: cost.currency,
    display: cost.display,
    displayWithFees: cost['display-with-fees'],
  };
};

const createGiftRecipient = (item: CartResponseLineItem): GiftRecipient => {

  const { id, itemCode, itemDefinition } = item;

  const details: CartItemDetail[] = itemDefinition.details;

  let status: GiftRecipientStatus;  
  switch (details.find(detail => detail.name == "status")?.value) {
    case 'Active':
      status = GiftRecipientStatus.Active;

    case 'Inactive':
      status = GiftRecipientStatus.Inactive;

    default:
      status = GiftRecipientStatus.Inactive;
  }

  let type: GiftRecipientType;
  switch (details.find(detail => detail.name === "designation_type")?.value) {
    case 'National Staff':
      type = GiftRecipientType.NationalStaff;

    case 'Project':
      type = GiftRecipientType.Project;

    case 'Scholarship':
      type = GiftRecipientType.Scholarship;

    case 'Staff':
      type = GiftRecipientType.Staff;

    case 'Student':
      type = GiftRecipientType.Student;

    case 'Volunteer':
      type = GiftRecipientType.Volunteer;

    default:
        type = GiftRecipientType.Staff;
  }

  return {
    id,
    designationNumber: itemCode['product-code'],
    displayName: itemDefinition['display-name'],
    organizationId: details.find(detail => detail.name === "org_id")?.value || "",
    status,
    type,
  }
};

const createGiftRecurrence = (item: CartResponseLineItem): GiftRecurrence => {

  const { itemfields, rate } = item;

  return {
    recurrenceFrequency: parseRecurrenceFrequency(rate.recurrence.interval),
    recurringDayOfMonth: itemfields['recurring-day-of-month'],
    recurringStartMonth: itemfields['recurring-start-of-month'],
  };
};

const createGiftTotal = (rateTotal: CartResponseRateTotal): GiftTotal => {

  const { cost, display, recurrence } = rateTotal;

  return {
    cost: {
      amount: cost.amount,
      amountWithFees: cost['amount-with-fees'],
      currency: cost.currency,
      display: cost.display,
      displayWithFees: cost['display-with-fees'],
    },
    displayTotal: display,
    recurrenceFrequency: parseRecurrenceFrequency(recurrence.interval),
  }
};

const parseRecurrenceFrequency = (recurrence: string): GiftRecurrenceFrequency => {

  switch (recurrence) {
    case 'NA':
      return GiftRecurrenceFrequency.Single;

    case 'MON':
      return GiftRecurrenceFrequency.Monthly;

    case 'QUARTERLY':
      return GiftRecurrenceFrequency.Quarterly;

    case 'ANNUAL':
      return GiftRecurrenceFrequency.Annually;

    default:
      return GiftRecurrenceFrequency.Single;
  };
};

export { CartDataHandler };
