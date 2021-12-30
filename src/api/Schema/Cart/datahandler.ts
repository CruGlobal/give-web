import { Cart, Gift, GiftRecipient, GiftRecipientStatus, GiftRecipientType, GiftRecurrence } from '../../../../graphql/types.generated';

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

  const gifts = data.lineItems.map(gift => createGift(gift));

  return {
    id: data.id,
    gifts,
    totalGifts: gifts.length,
  };
};

const createGift = (item: CartResponseLineItem): Gift => {

  const { itemfields } = item;

  const recipient = createGiftRecipient(item);

  let recurrence: GiftRecurrence;
  switch (item.rate.recurrence.interval) {
    case 'NA':
      recurrence = GiftRecurrence.Single;

    case 'MON':
      recurrence = GiftRecurrence.Monthly;

    case 'QUARTERLY':
      recurrence = GiftRecurrence.Quarterly;

    case 'ANNUAL':
      recurrence = GiftRecurrence.Annually;
    
    default:
      recurrence = GiftRecurrence.Single;
  }

  return {
    amount: itemfields.amount,
    commentsToDSG: itemfields['donation-services-comments'],
    commentsToRecipient: itemfields['recipient-comments'],
    recipient,
    recurrence,
    recurringDayOfMonth: itemfields['recurring-day-of-month'],
  }
}

const createGiftRecipient = (item: CartResponseLineItem): GiftRecipient => {

  const details: CartItemDetail[] = item.itemDefinition.details;

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
  
  let status: GiftRecipientStatus;  
  switch (details.find(detail => detail.name == "status")?.value) {
    case 'Active':
      status = GiftRecipientStatus.Active;

    case 'Inactive':
      status = GiftRecipientStatus.Inactive;

    default:
      status = GiftRecipientStatus.Inactive;
  }

  return {
    id: item.id,
    designationNumber: item.itemCode['product-code'],
    type,
    status,
    organizationId: "",
  }
}

export { CartDataHandler }
