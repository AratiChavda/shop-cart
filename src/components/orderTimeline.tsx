import React, { useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { downloadInvoice } from "@/api/apiServices";
import { toast } from "sonner";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constant/common";
import {
  formatCurrency,
  getPaymentVariant,
  getStatusVariant,
} from "@/utils/common";
import { useNavigate } from "react-router-dom";
import { Icons } from "./icons";

export interface Order {
  id: string;
  packageName: string;
  placedDate: string;
  startDate: string;
  quantity: number;
  price: number;
  paymentStatus: keyof typeof PAYMENT_STATUS;
  orderStatus: keyof typeof ORDER_STATUS;
  imageUrl: string;
  currency: string;
  shippingAddress?: string;
  billingAddress?: string;
  totalDiscount?: number;
  taxAmount?: number;
  shippingCost?: number;
  finalAmount?: number;
}

const OrderTimeline: React.FC<{
  orders: Order[];
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
}> = ({ orders, hasMore, loadMore, loadingMore }) => {
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loadingMore, loadMore]);

  const handleDownloadInvoice = async (orderId: number) => {
    const id = orderId.toString();
    setDownloadingId(id);
    try {
      await downloadInvoice([orderId]);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusActions = (
    status: Order["orderStatus"],
    orderId: string,
    paymentStatus: Order["paymentStatus"]
  ) => {
    const actions = [
      {
        label: "Make Payment",
        icon: <Icons.wallet className="h-4 w-4" />,
        statuses: [
          ORDER_STATUS.ORDER_PLACED,
          ORDER_STATUS.HOLD_FOR_PAYMENT,
          PAYMENT_STATUS.NO_PAYMENT,
        ],
        onClick: () => {
          navigate("/dashboard/checkout", { state: { orderIds: [orderId] } });
        },
      },
      {
        label: "Cancel Order",
        icon: <Icons.xCircle className="h-4 w-4" />,
        statuses: [ORDER_STATUS.ORDER_PLACED],
        onClick: () => toast.info("Cancel order functionality"),
      },
      {
        label: "Track Shipment",
        icon: <Icons.truck className="h-4 w-4" />,
        statuses: [ORDER_STATUS.ACTIVE_SHIPPING, ORDER_STATUS.PARTIAL_SHIPMENT],
        onClick: () => toast.info("Tracking page"),
      },
      {
        label: "Return Item",
        icon: <Icons.refresh className="h-4 w-4" />,
        statuses: [ORDER_STATUS.SHIPPED_COMPLETE],
        onClick: () => toast.info("Return process"),
      },
      {
        label: "Download Invoice",
        icon: (
          <>
            {downloadingId === orderId ? (
              <Icons.loader className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.download className="h-4 w-4" />
            )}
          </>
        ),
        statuses: [
          ORDER_STATUS.ORDER_PLACED,
          ORDER_STATUS.HOLD_FOR_PAYMENT,
          PAYMENT_STATUS.NO_PAYMENT,
          PAYMENT_STATUS.PAID,
        ],
        onClick: () => handleDownloadInvoice(Number(orderId)),
      },
      {
        label: "View Details",
        icon: <Icons.eye className="h-4 w-4" />,
        statuses: [
          ORDER_STATUS.CANCEL_FOR_NON_PAYMENT,
          ORDER_STATUS.CANCEL_CUSTOMER_REQUEST,
          ORDER_STATUS.NON_VERIFY_CANCEL,
          ORDER_STATUS.CANCEL_WAIT_AUTHORIZE,
        ],
        onClick: () => toast.info("Order details modal"),
      },
    ];

    return actions.filter(
      (action) =>
        action.statuses.includes(status) &&
        action.statuses.includes(paymentStatus)
    );
  };

  return (
    <div className="relative">
      <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 w-0.5 h-full bg-border" />

      {orders.map((order, index) => {
        const isLeft = index % 2 === 0;
        const actions = getStatusActions(
          order.orderStatus,
          order.id,
          order.paymentStatus
        );
        const isOpen = openOrder === order.id;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative pl-12 sm:pl-0 mb-6"
          >
            <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background z-10" />

            <motion.div
              className={`bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                isLeft
                  ? "sm:mr-auto sm:ml-4 sm:max-w-md"
                  : "sm:ml-auto sm:mr-4 sm:max-w-md"
              }`}
              whileHover={{ y: -2 }}
            >
              <Card className="border-0 gap-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
                      {order.packageName}
                    </CardTitle>
                    <Badge
                      variant={getStatusVariant(order.orderStatus)}
                      className="text-xs whitespace-nowrap"
                    >
                      {order.orderStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Icons.hash className="h-3 w-3" />
                      {order.id}
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Icons.calendar className="h-3 w-3" /> {order.placedDate}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex gap-3 mb-4">
                    <img
                      src={order.imageUrl}
                      alt={order.packageName}
                      className="w-24 h-24 rounded-lg object-contain border border-gray-100 flex-shrink-0"
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1 min-w-0">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="font-medium text-gray-900 truncate">
                          {order.startDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Qty</p>
                        <p className="font-medium text-gray-900">
                          {order.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.price, order.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap font-medium ${
                            getPaymentVariant(order.paymentStatus) === "success"
                              ? "bg-green-100 text-green-700"
                              : getPaymentVariant(order.paymentStatus) ===
                                "warning"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.paymentStatus.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => setOpenOrder(isOpen ? null : order.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        {isOpen ? "Show Less" : "View Details"}
                        <Icons.chevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>

                    <AnimatePresence>
                      {isOpen && (
                        <CollapsibleContent asChild>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
                              {order.shippingAddress && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5 mb-1">
                                    <Icons.mapPin className="h-3.5 w-3.5" />{" "}
                                    Shipping Address
                                  </p>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {order.shippingAddress}
                                  </p>
                                </div>
                              )}

                              {order.billingAddress && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5 mb-1">
                                    <Icons.wallet className="h-3.5 w-3.5" />{" "}
                                    Billing Address
                                  </p>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {order.billingAddress}
                                  </p>
                                </div>
                              )}

                              <div className="bg-gray-50 rounded-lg p-3 text-xs">
                                <p className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                  <Icons.barChart className="h-3.5 w-3.5" />{" "}
                                  Price Breakdown
                                </p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Subtotal
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(
                                        order.price,
                                        order.currency
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>
                                      -
                                      {formatCurrency(
                                        order?.totalDiscount || 0,
                                        order.currency
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span>
                                      {formatCurrency(
                                        order?.taxAmount || 0,
                                        order.currency
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Shipping
                                    </span>
                                    <span>
                                      {formatCurrency(
                                        order?.shippingCost || 0,
                                        order.currency
                                      )}
                                    </span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-1.5 mt-2">
                                    <div className="flex justify-between font-semibold text-gray-900">
                                      <span>Total</span>
                                      <span>
                                        {formatCurrency(
                                          order.finalAmount || order.price,
                                          order.currency
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {actions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {actions.map((action, idx) => (
                                    <button
                                      key={idx}
                                      onClick={action.onClick}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all min-w-fit"
                                    >
                                      {action.icon}
                                      <span>{action.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </Collapsible>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}

      {hasMore && (
        <div ref={ref} className="pl-12 sm:pl-0 pt-8">
          {loadingMore && (
            <div className="flex justify-center items-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading more orders...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
