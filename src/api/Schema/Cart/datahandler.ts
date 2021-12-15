import { Cart, CartItem } from '../../../../graphql/types.generated';
import { startMonth } from 'src/common/services/giftHelpers/giftDates.service';

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
  lineItems: {
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
  }[];
  rateTotals: {
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
  }[];
  rawData: {
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
    "total-quantity": number;
  };
  total: {
    cost: {
      amount: number;
      currency: string;
      display: string;
    };
    links: RESTResponseLink[];
    self: RESTResponseSelfReference;
  }
}

//Convert REST response to GraphQL types
const CartDataHandler = (data: GetCartResponse, nextDrawDate: string): Cart => {

  /*const items = data.lineItems.map((item): CartItem => {
    const frequency = item.rate.recurrence.display
    //const itemConfig = omit(item.itemfields, ['self', 'links'])
    const giftStartDate = frequency !== 'Single'
      ? startMonth(item['recurring-day-of-month'], item['recurring-start-month'], nextDrawDate) : null
    const giftStartDateDaysFromNow = giftStartDate ? giftStartDate.diff(new Date(), 'days') : 0

    let designationType: string | undefined;
    let orgId: string | undefined;
    item.itemDefinition['details'].forEach((v) => {
      if (v['name'] === 'designation_type') {
        designationType = v['display-value']
      }
      if (v['name'] === 'org_id') {
        orgId = v['display-value']
      }
    })

    return {
      uri: item.self.uri,
      code: item.itemCode.code,
      orgId: orgId,
      displayName: item.itemDefinition['display-name'],
      //designationType: designationType,
      price: item.rate.cost.display,
      //priceWithFees: item.rate.cost['display-with-fees'],
      //config: itemConfig,
      //frequency: frequency,
      amount: item.rate.cost.amount,
      //amountWithFees: item.rate.cost['amount-with-fees'],
      //designationNumber: item.itemCode['product-code'],
      //productUri: item.item.self.uri,
      //giftStartDate: giftStartDate,
      //giftStartDateDaysFromNow: giftStartDateDaysFromNow,
      //giftStartDateWarning: giftStartDateDaysFromNow >= 275
    }
  })

  let cartTotal: number | undefined;
  let cartTotalDisplay: string | undefined;
  const frequencyTotals = data.rateTotals.map(rateTotal => {
    if (rateTotal.recurrence.interval === 'NA') {
      cartTotal = rateTotal.cost.amount
      cartTotalDisplay = rateTotal.cost.display
    }
    return {
      frequency: rateTotal.recurrence.display,
      amount: rateTotal.cost.amount,
      amountWithFees: rateTotal.cost['amount-with-fees'],
      total: rateTotal.cost.display,
      totalWithFees: rateTotal.cost['display-with-fees']
    }
  })
  // The API returns Single gift rate totals as the last item in the list, so we should move it to the first item
  // to preserve the ordering in the UI (Single gift totals first).
  if (cartTotal) {
    //frequencyTotals.unshift(frequencyTotals.pop())
  }

  // set cart item count cookie
  //this.setCartCountCookie(items.length)
  
  return {
    id: '1', //this.hateoasHelperService.getLink(cartResponse.total, 'cart').split('/').pop(),
    items: items.reverse(), // Show most recent cart items first
    //frequencyTotals: frequencyTotals,
    cartTotal: cartTotal || (data.total && data.total.cost.amount),
    cartTotalDisplay: cartTotalDisplay || (data.total && data.total.cost.display)
  }*/

  return { id: '1' };
};

export { CartDataHandler }
