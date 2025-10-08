import { ORDER_STATUS, PAYMENT_STATUS } from "@/constant/common";
import { format } from "date-fns";

export function formatDate(date: number, dateFormat?: "mm/dd/yyyy") {
  if (!date) return "";

  const dateOnly = new Date(Number(date));
  const utcDate = new Date(
    Date.UTC(
      dateOnly.getUTCFullYear(),
      dateOnly.getUTCMonth(),
      dateOnly.getUTCDate()
    )
  );
  return format(new Date(utcDate), dateFormat || "dd MMM yyyy");
}

export const getStatusVariant = (
  status: keyof typeof ORDER_STATUS
):
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost"
  | "success"
  | "warning" => {
  switch (status) {
    case ORDER_STATUS.ORDER_PLACED:
    case ORDER_STATUS.ACTIVE_SHIPPING:
    case ORDER_STATUS.PARTIAL_SHIPMENT:
      return "success";
    case ORDER_STATUS.CANCEL_FOR_NON_PAYMENT:
    case ORDER_STATUS.CANCEL_CUSTOMER_REQUEST:
    case ORDER_STATUS.NON_VERIFY_CANCEL:
    case ORDER_STATUS.CANCEL_WAIT_AUTHORIZE:
      return "destructive";
    case ORDER_STATUS.PENDING:
    case ORDER_STATUS.HOLD_FOR_PAYMENT:
      return "warning";
    case ORDER_STATUS.TEMPORARY_SUSPEND:
    case ORDER_STATUS.SUSPEND_FOR_NON_PAYMENT:
    case ORDER_STATUS.SUSPEND_NOT_DELIVERABLE:
      return "secondary";
    case ORDER_STATUS.SHIPPED_COMPLETE:
    case ORDER_STATUS.GRACE:
      return "success";
    default:
      return "default";
  }
};

export const getPaymentVariant = (
  status: keyof typeof PAYMENT_STATUS
):
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost"
  | "success"
  | "warning" => {
  switch (status) {
    case PAYMENT_STATUS.PAID:
    case PAYMENT_STATUS.PAID_PRORATED:
    case PAYMENT_STATUS.PAID_OVERPAYMENT:
      return "success";
    case PAYMENT_STATUS.PENDING:
    case PAYMENT_STATUS.PARTIAL_PAYMENT:
    case PAYMENT_STATUS.PAID_UNDERPAYMENT:
    case PAYMENT_STATUS.ON_HOLD:
      return "warning";
    case PAYMENT_STATUS.CANCELLED:
    case PAYMENT_STATUS.CANCELLED_PAYMENT:
    case PAYMENT_STATUS.REJECT_PAYMENT:
    case PAYMENT_STATUS.NO_PAYMENT:
    case PAYMENT_STATUS.NO_PAYMENT_REJECTED:
    case PAYMENT_STATUS.NO_PAYMENT_REFUNDED:
    case PAYMENT_STATUS.PAID_REFUNDED:
    case PAYMENT_STATUS.UNDERPAYMENT:
    case PAYMENT_STATUS.REFUND_PAYMENTS:
    case PAYMENT_STATUS.OVERPAYMENT:
      return "destructive";
    default:
      return "default";
  }
};
