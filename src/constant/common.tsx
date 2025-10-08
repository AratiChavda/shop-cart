export const addressBadgeColors: Record<string, string> = {
  business: "bg-blue-100 text-blue-700",
  residential: "bg-green-100 text-green-700",
  other: "bg-gray-200 text-gray-700",
};

export const CUST_CATEGORY = {
  AGENCY: "Agency",
  INSTITUTIONAL: "Institutional",
  INDIVIDUAL: "Individual",
  GROUP: "Group",
  OTHER: "Others",
};

export const ADDRESS_TYPE = {
  Business: "Business",
  Residential: "Residential",
  Other: "Other",
};

export const ADDRESS_CATEGORY = {
  SHIPPING: "Shipping",
  BILLING: "Billing",
  RENEWAL: "Renewal",
  ALTERNATE: "Alternate",
} as const;

export const CLAIM_STATUS = {
  IN_PROGRESS: "In Progress",
  UNABLE_TO_REPLACE: "Unable to replace",
  OUT_OF_CLAIM_PERIOD: "Out of claim period",
  REQUESTED_ISSUES_IN_TRANSIT: "Requested issue(s) in transit",
  REQUESTED_ISSUES_YET_TO_BE_PUBLISHED:
    "Requested issue(s) yet to be published",
  PROCESSED: "Processed",
  PARTIALLY_PROCESSED: "Partially Processed",
  REQUESTED_ISSUES_SHIPPED: "Requested Issue(s) Shipped",
};

export const REFUND_STATUS = {
  IN_PROGRESS: "In Progress",
  UNABLE_TO_REFUND: "Unable to Refund",
  PARTIAL_REFUND_ISSUED: "Partial Refund Issued",
  FULL_REFUND_ISSUED: "Full Refund Issued",
};

export const CANCELLATION_STATUS = {
  REQUEST_RECEIVED: "Request received",
  UNABLE_TO_CANCEL: "Unable to Cancel",
  CONFIRMED: "Confirmed",
};

export const JOURNAL_ITEM_TYPE = {
  ORDER_CODE: "ORDER_CODE",
  SUBSCRIPTION: "SUBSCRIPTION_DEF",
  PRODUCT: "PRODUCT",
  PACKAGE: "PACKAGE_DEF",
};

export const OC_ORDER_TYPE = {
  SUBSCRIPTION: "Subscription",
  SINGLE_ISSUE: "Single issue",
  ELECTRONIC_ISSUE: "Electronic issue",
  PRODUCT: "Product",
  BASIC_PACKAGE: "Basic Package",
  AD_HOC_PACKAGE: "Ad Hoc Package",
  POOLED_PACKAGE: "Pooled Package",
};

export const ORDER_STATUS = {
  ORDER_PLACED: "order placed",
  ACTIVE_SHIPPING: "active/shipping",
  PENDING: "Pending",
  CANCEL_FOR_NON_PAYMENT: "cancel for nonpayment",
  TEMPORARY_SUSPEND: "temporary suspend",
  SUSPEND_FOR_NON_PAYMENT: "suspend for nonpayment",
  SUSPEND_NOT_DELIVERABLE: "suspend not deliverable",
  PARTIAL_SHIPMENT: "partial shipment",
  SHIPPED_COMPLETE: "shipped complete",
  GRACE: "grace",
  CANCEL_CUSTOMER_REQUEST: "cancel - customer request",
  NON_VERIFY_CANCEL: "non-verify cancellation",
  CANCEL_WAIT_AUTHORIZE: "cancel/waiting credit card authorization",
  HOLD_FOR_PAYMENT: "hold for payment",
};

export const PAYMENT_STATUS = {
  NO_PAYMENT: "No Payment",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  CANCELLED_PAYMENT: "Cancelled Payment",
  REJECT_PAYMENT: "Reject Payment",
  PAID: "Paid",
  ON_HOLD: "On-Hold",
  PARTIAL_PAYMENT: "Partial Payment",
  PAID_PRORATED: "Paid Prorated",
  PAID_UNDERPAYMENT: "Paid - Underpayment",
  PAID_OVERPAYMENT: "Paid - Overpayment",
  NO_PAYMENT_REJECTED: "No Payment Rejected",
  NO_PAYMENT_REFUNDED: "No Payment Refunded",
  PAID_REFUNDED: "Paid Refunded",
  UNDERPAYMENT: "Underpayment",
  REFUND_PAYMENTS: "Refund payments",
  OVERPAYMENT: "Overpayment",
};
