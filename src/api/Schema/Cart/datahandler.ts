import { Cart, CartItem, CartItemDetail, CartItemStartDate, CartRateTotal, CartRateTotalCost, CartTotal } from '../../../../graphql/types.generated';

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
    details: {
      "display-name": string;
      "display-value": string;
      name: string;
      value: string;
    }[];
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

  return {
    items: data.lineItems.map(item => createCartItem(item)),
    rateTotal: data.rateTotals.map(rateTotal => createCartRateTotal(rateTotal)),
    total: createCartTotal(data.total),
  };
};

const createCartItem = (item: CartResponseLineItem): CartItem => {

  const { itemCode, itemDefinition, itemfields, quantity, rate } = item;

  const details: CartItemDetail[] = itemDefinition.details.map(detail => ({
    displayName: detail['display-name'],
    displayValue: detail['display-value'],
    name: detail.name,
    value: detail.value,
  }));

  const designationType = details.find(detail => detail.name == "designation_type")?.value
  const orgId = details.find(detail => detail.name == "org_id")?.value
  const secureDesignationFlag = !!(details.find(detail => detail.name == "secure_flag")?.value)
  const status = details.find(detail => detail.name == "status")?.value
  const startDate: CartItemStartDate = {
    displayValue: rate['start-date']['display-value'],
    value: rate['start-date'].value,
  };

  return {
    amount: itemfields.amount,
    amountWithFees: itemfields['amount-with-fees'],
    campaignCode: itemfields['campaign-code'],
    code: itemCode.code,
    designationType,
    details,
    displayName: itemDefinition['display-name'],
    orgId,
    premiumCode: itemfields['premium-code'],
    price: "",
    productCode: itemCode['product-code'],
    quantity,
    recurrence: rate.recurrence,
    recurringDayOfMonth: itemfields['recurring-day-of-month'],
    recurringStartOfMonth: itemfields['recurring-start-of-month'],
    secureDesignationFlag,
    startDate,
    status,
    uri: "",
  }
}

const createCartRateTotal = (rateTotal: CartResponseRateTotal): CartRateTotal => {

  const cost: CartRateTotalCost = {
    amount: rateTotal.cost.amount,
    amountWithFees: rateTotal.cost['amount-with-fees'],
    currency: rateTotal.cost.currency,
    display: rateTotal.cost.display,
    displayWithFees: rateTotal.cost['display-with-fees'],
  };

  return {
    cost,
    display: rateTotal.display,
    recurrence: rateTotal.recurrence,
  }
}

const createCartTotal = (total: CartResponseTotal): CartTotal => {

  return total.cost;
}

export { CartDataHandler }
