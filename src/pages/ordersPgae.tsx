import React, { useCallback, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Package,
  Truck,
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchEntityData } from "@/api/apiServices";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/constant/common";
import {
  formatDate,
  getPaymentVariant,
  getStatusVariant,
} from "@/utils/common";

interface Order {
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
}

const PAGE_SIZE = 10;

const OrderTimeline: React.FC<{
  orders: Order[];
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
}> = ({ orders, hasMore, loadMore, loadingMore }) => {
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0 });

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loadingMore, loadMore]);

  const getStatusActions = (status: Order["orderStatus"]) => {
    const actions = [
      {
        label: "Track Order",
        icon: <Truck className="h-4 w-4" />,
        statuses: [ORDER_STATUS.ORDER_PLACED],
      },
      {
        label: "Cancel Order",
        icon: <FileText className="h-4 w-4" />,
        statuses: [ORDER_STATUS.ORDER_PLACED],
      },
      {
        label: "Track Shipment",
        icon: <Truck className="h-4 w-4" />,
        statuses: [ORDER_STATUS.ACTIVE_SHIPPING, ORDER_STATUS.PARTIAL_SHIPMENT],
      },
      {
        label: "Return Item",
        icon: <Package className="h-4 w-4" />,
        statuses: [ORDER_STATUS.SHIPPED_COMPLETE],
      },
      {
        label: "Download Certificate",
        icon: <CheckCircle className="h-4 w-4" />,
        statuses: [ORDER_STATUS.SHIPPED_COMPLETE],
      },
      {
        label: "View Details",
        icon: <FileText className="h-4 w-4" />,
        statuses: [
          ORDER_STATUS.CANCEL_FOR_NON_PAYMENT,
          ORDER_STATUS.CANCEL_CUSTOMER_REQUEST,
          ORDER_STATUS.NON_VERIFY_CANCEL,
          ORDER_STATUS.CANCEL_WAIT_AUTHORIZE,
        ],
      },
    ];

    return actions.filter((action) => action.statuses.includes(status));
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-primary to-primary/20"
      />
      {orders.map((order, index) => {
        const isLeft = index % 2 === 0;
        const actions = getStatusActions(order.orderStatus);
        const isOpen = openOrder === order.id;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            className={`mb-8 flex flex-col sm:flex-row justify-between items-center w-full ${
              isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
            }`}
          >
            <div
              className={`w-full sm:w-5/12 ${isLeft ? "sm:pr-8" : "sm:pl-8"}`}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-primary/10">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="text-lg font-semibold text-primary flex justify-between items-center">
                    {order.packageName}
                    <Badge
                      variant={getStatusVariant(order.orderStatus)}
                      className="text-xs"
                    >
                      {order.orderStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <motion.img
                      src={order.imageUrl}
                      alt={order.packageName}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mr-4 border border-primary/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    <div>
                      <p className="text-sm text-primary/80 font-medium">
                        Order ID: {order.id}
                      </p>
                      <p className="text-xs text-primary/60">
                        Placed: {order.placedDate}
                      </p>
                      <p className="text-xs text-primary/60">
                        Start: {order.startDate}
                      </p>
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
                        className="w-full justify-between text-primary/80 hover:bg-primary/10"
                      >
                        {isOpen ? "Hide Details" : "Show Details"}
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Quantity:</span>
                        <span className="font-medium">{order.quantity}</span>
                        <span>Price:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: order.currency || "USD",
                          }).format(order.price)}
                        </span>
                        <span>Payment:</span>
                        <Badge variant={getPaymentVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      {actions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-primary hover:bg-primary/20 border-primary/30"
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </div>
            <div className="w-full my-6 sm:my-0 sm:w-2/12 flex justify-center relative z-10">
              <motion.div
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.3, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Package className="h-5 w-5" />
              </motion.div>
            </div>
            <div className="hidden sm:block sm:w-5/12" />
          </motion.div>
        );
      })}
      {hasMore && (
        <div ref={ref} className="w-full h-20 flex justify-center items-center">
          {loadingMore && (
            <p className="text-primary/60">Loading more orders...</p>
          )}
        </div>
      )}
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [activeHasMore, setActiveHasMore] = useState(true);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useUser();

  const fetchOrder = useCallback(
    async (tab: string, page: number) => {
      if (
        (tab === "active" && !activeHasMore) ||
        (tab === "history" && !historyHasMore)
      ) {
        return;
      }

      const isInitialLoad = page === 0;
      setIsLoading(isInitialLoad);
      setIsLoadingMore(!isInitialLoad);

      try {
        const baseFilters = [
          {
            path: "customerId.customerId",
            operator: "equals",
            value: user?.customer?.customerId?.toString() || "",
          },
        ];

        const statusFilter =
          tab === "active"
            ? {
                path: "orderStatus",
                operator: "in",
                value: [
                  ORDER_STATUS.ORDER_PLACED,
                  ORDER_STATUS.ACTIVE_SHIPPING,
                  ORDER_STATUS.PARTIAL_SHIPMENT,
                  ORDER_STATUS.HOLD_FOR_PAYMENT,
                ].join(","),
              }
            : {
                path: "orderStatus",
                operator: "not-in",
                value: [
                  ORDER_STATUS.ORDER_PLACED,
                  ORDER_STATUS.ACTIVE_SHIPPING,
                  ORDER_STATUS.PARTIAL_SHIPMENT,
                  ORDER_STATUS.HOLD_FOR_PAYMENT,
                ].join(","),
              };

        const payload = {
          class: "Order",
          fields: [
            "orderId",
            "orderStatus",
            "orderType",
            "createdAt",
            "orderClass.orderClassName",
            "keyOrderInformation.orderCode.orderCodes.description",
            "keyOrderInformation.orderCode.orderCodes.orderType",
            "orderItemsAndTerms.subsProdPkgDef.description",
            "orderItemsAndTerms.packageDef.packageKeyInfo.description",
            "orderItemsAndTerms.generatedIssue.issueDate",
            "orderItemsAndTerms.validFrom",
            "orderItemsAndTerms.numOfIssues",
            "paymentBreakdown.paymentStatus",
            "paymentBreakdown.netAmount",
            "paymentBreakdown.currency",
          ].join(","),
          filters: [...baseFilters, statusFilter],
        };

        const response = await fetchEntityData(payload, {
          page,
          size: PAGE_SIZE,
          sort: "createdAt,desc",
        });

        const newOrders = (response.content || []).map((order: any) => ({
          id: order.orderId,
          packageName:
            order?.orderItemsAndTerms?.subsProdPkgDef?.description ||
            order?.orderItemsAndTerms?.packageDef?.packageKeyInfo
              ?.description ||
            order?.keyOrderInformation?.orderCode?.orderCodes?.description ||
            "Unknown Package",
          placedDate: formatDate(order.createdAt),
          startDate: formatDate(order?.orderItemsAndTerms?.validFrom),
          quantity: order?.orderItemsAndTerms?.numOfIssues || 1,
          orderStatus: order.orderStatus,
          paymentStatus: order?.paymentBreakdown?.paymentStatus,
          price: order?.paymentBreakdown?.netAmount || 0,
          currency: order?.paymentBreakdown?.currency || "USD",
          imageUrl:
            "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
        }));

        if (tab === "active") {
          setActiveOrders((prev) =>
            isInitialLoad ? newOrders : [...prev, ...newOrders]
          );
          setActiveHasMore(response.page + 1 < response.totalPages);
          setActivePage(response.page);
        } else {
          setHistoryOrders((prev) =>
            isInitialLoad ? newOrders : [...prev, ...newOrders]
          );
          setHistoryHasMore(response.page + 1 < response.totalPages);
          setHistoryPage(response.page);
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to fetch orders");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user?.customer?.customerId, activeHasMore, historyHasMore]
  );

  useEffect(() => {
    if (activeTab === "active" && activeOrders.length === 0) {
      fetchOrder("active", 0);
    } else if (activeTab === "history" && historyOrders.length === 0) {
      fetchOrder("history", 0);
    }
  }, [activeTab, fetchOrder, activeOrders.length, historyOrders.length]);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/60">
          Your Orders
        </h1>
        <p className="text-primary/60 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          Explore your active orders and dive into your order history with a
          seamless, interactive timeline.
        </p>
      </motion.div>
      <Tabs
        defaultValue="active"
        className="max-w-5xl mx-auto"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-primary/10 rounded-lg">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
          >
            Active Orders
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
          >
            Order History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {isLoading ? (
            <p className="text-center text-primary/60">Loading...</p>
          ) : activeOrders.length > 0 ? (
            <OrderTimeline
              orders={activeOrders}
              hasMore={activeHasMore}
              loadMore={() => fetchOrder("active", activePage + 1)}
              loadingMore={isLoadingMore}
            />
          ) : (
            <p className="text-center text-primary/60">
              No active orders at the moment.
            </p>
          )}
        </TabsContent>
        <TabsContent value="history">
          {isLoading ? (
            <p className="text-center text-primary/60">Loading...</p>
          ) : historyOrders.length > 0 ? (
            <OrderTimeline
              orders={historyOrders}
              hasMore={historyHasMore}
              loadMore={() => fetchOrder("history", historyPage + 1)}
              loadingMore={isLoadingMore}
            />
          ) : (
            <p className="text-center text-primary/60">
              No order history available.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
