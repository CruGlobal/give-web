export default {
  "self": {
    "type": "carts.cart",
    "uri": "/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy?zoom=order",
    "href": "https://give-stage2.cru.org/cortex/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy?zoom=order"
  },
  "messages": [],
  "links": [
    {
      "rel": "lineitems",
      "rev": "cart",
      "type": "carts.line-items",
      "uri": "/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/lineitems",
      "href": "https://give-stage2.cru.org/cortex/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/lineitems"
    },
    {
      "rel": "additemstocartform",
      "type": "carts.add-items-to-cart-form",
      "uri": "/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/form",
      "href": "https://give-stage2.cru.org/cortex/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/form"
    },
    {
      "rel": "descriptor",
      "type": "carts.cart-descriptor",
      "uri": "/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/descriptor",
      "href": "https://give-stage2.cru.org/cortex/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/descriptor"
    },
    {
      "rel": "discount",
      "rev": "cart",
      "type": "discounts.discount-for-cart",
      "uri": "/discounts/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy",
      "href": "https://give-stage2.cru.org/cortex/discounts/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy"
    },
    {
      "rel": "order",
      "rev": "cart",
      "type": "orders.order",
      "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
      "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
    },
    {
      "rel": "appliedpromotions",
      "rev": "cart",
      "type": "promotions.applied-promotions-for-cart",
      "uri": "/promotions/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/applied",
      "href": "https://give-stage2.cru.org/cortex/promotions/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy/applied"
    },
    {
      "rel": "ratetotals",
      "rev": "cart",
      "type": "ratetotals.ratetotals-for-cart",
      "uri": "/ratetotals/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy",
      "href": "https://give-stage2.cru.org/cortex/ratetotals/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy"
    },
    {
      "rel": "total",
      "rev": "cart",
      "type": "totals.cart-total",
      "uri": "/totals/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy",
      "href": "https://give-stage2.cru.org/cortex/totals/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy"
    }
  ],
  "_order": [
    {
      "self": {
        "type": "orders.order",
        "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
        "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
      },
      "messages": [
        {
          "type": "needinfo",
          "id": "need.email",
          "debug-message": "Customer email address must be specified.",
          "linked-to": {
            "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/emailinfo",
            "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/emailinfo",
            "type": "orders.email-info"
          },
          "data": {}
        },
        {
          "type": "needinfo",
          "id": "need.billing.address",
          "debug-message": "Billing address must be specified.",
          "linked-to": {
            "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/billingaddressinfo",
            "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/billingaddressinfo",
            "type": "orders.billingaddress-info"
          },
          "data": {}
        },
        {
          "type": "needinfo",
          "id": "need.payment.method",
          "debug-message": "Payment method must be specified.",
          "linked-to": {
            "uri": "/paymentmethods/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
            "href": "https://give-stage2.cru.org/cortex/paymentmethods/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
            "type": "paymentmethods.order-payment-methods"
          },
          "data": {}
        }
      ],
      "links": [
        {
          "rel": "couponinfo",
          "rev": "order",
          "type": "coupons.couponinfo",
          "uri": "/coupons/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/info",
          "href": "https://give-stage2.cru.org/cortex/coupons/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/info"
        },
        {
          "rel": "donordetails",
          "rev": "order",
          "type": "donordetails.donor-order-details",
          "uri": "/donordetails/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
          "href": "https://give-stage2.cru.org/cortex/donordetails/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
        },
        {
          "rel": "enhancedpurchaseform",
          "type": "enhancedpurchases.enhancedpurchaseform",
          "uri": "/enhancedpurchases/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/form",
          "href": "https://give-stage2.cru.org/cortex/enhancedpurchases/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/form"
        },
        {
          "rel": "billingaddressinfo",
          "rev": "order",
          "type": "orders.billingaddress-info",
          "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/billingaddressinfo",
          "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/billingaddressinfo"
        },
        {
          "rel": "deliveries",
          "rev": "order",
          "type": "orders.deliveries",
          "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/deliveries",
          "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/deliveries"
        },
        {
          "rel": "emailinfo",
          "rev": "order",
          "type": "orders.email-info",
          "uri": "/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/emailinfo",
          "href": "https://give-stage2.cru.org/cortex/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/emailinfo"
        },
        {
          "rel": "cart",
          "rev": "order",
          "type": "carts.cart",
          "uri": "/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy",
          "href": "https://give-stage2.cru.org/cortex/carts/crugive/mfsdazlbmy3wiljxmizteljummzwgllchbswkljug5sdgztdgmzdkmrqgy"
        },
        {
          "rel": "paymentinstrumentselector",
          "rev": "order",
          "type": "paymentinstruments.order-payment-instrument-selector",
          "uri": "/paymentinstruments/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/paymentinstrumentselector",
          "href": "https://give-stage2.cru.org/cortex/paymentinstruments/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/paymentinstrumentselector"
        },
        {
          "rel": "paymentmethodinfo",
          "rev": "order",
          "type": "paymentmethods.order-payment-methods",
          "uri": "/paymentmethods/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
          "href": "https://give-stage2.cru.org/cortex/paymentmethods/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
        },
        {
          "rel": "purchaseform",
          "type": "purchases.create-purchase-form",
          "uri": "/purchases/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/form",
          "href": "https://give-stage2.cru.org/cortex/purchases/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=/form"
        },
        {
          "rel": "tax",
          "rev": "order",
          "type": "taxes.order-tax",
          "uri": "/taxes/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
          "href": "https://give-stage2.cru.org/cortex/taxes/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
        },
        {
          "rel": "total",
          "rev": "order",
          "type": "totals.order-total",
          "uri": "/totals/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe=",
          "href": "https://give-stage2.cru.org/cortex/totals/orders/crugive/gm4dqmtfmnstaljzmq2tsljuhbsdiljygq2daljwgfsgczbtgazgkobzhe="
        }
      ]
    }
  ],
  "total-quantity": 1
}
