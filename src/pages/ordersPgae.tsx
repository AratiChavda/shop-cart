import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, FileText } from "lucide-react";
import { fetchEntityData } from "@/api/apiServices";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { ORDER_STATUS } from "@/constant/common";
import { formatAddress, formatDate } from "@/utils/common";
import OrderTimeline, { type Order } from "@/components/orderTimeline";

const PAGE_SIZE = 10;

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
  const [journalCoverImgSrc, setJournalCoverImgSrc] = useState<
    { ocId: number; journalCoverImgSrc: string }[]
  >([]);
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
            "orderItemsAndTerms.copiesPerIssue",
            "orderAddresses.address.addressLine1",
            "orderAddresses.address.addressLine2",
            "orderAddresses.address.city",
            "orderAddresses.address.state",
            "orderAddresses.address.countryCode",
            "orderAddresses.address.zipCode",
            "orderAddresses.billingAddress",
            "orderAddresses.shippingAddress",
            "paymentBreakdown.paymentStatus",
            "paymentBreakdown.baseAmount",
            "paymentBreakdown.discount",
            "paymentBreakdown.tax",
            "paymentBreakdown.shippingCharge",
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

        let imgSrc = [...journalCoverImgSrc];
        const uniqueOcIds = new Set(
          response.content.map((order: any) => order?.orderClass?.ocId)
        );
        const savedOcIds = new Set(
          journalCoverImgSrc.map((item: any) => item.ocId)
        );
        const missingOcIds = [...uniqueOcIds].filter(
          (ocId) => !savedOcIds.has(ocId)
        );

        if (missingOcIds.length > 0) {
          const imgPayload = {
            class: "OcMapping",
            fields: "orderClass.ocId,journalCoverImgSrc",
            filters: [
              {
                path: "orderClass.ocId",
                operator: "in",
                value: missingOcIds.join(","),
              },
            ],
          };
          const imgRes = await fetchEntityData(imgPayload);
          const newRecords = imgRes.content.map((item: any) => ({
            ocId: item.orderClass.ocId,
            journalCoverImgSrc: item.journalCoverImgSrc,
          }));
          imgSrc = [...journalCoverImgSrc, ...newRecords];
          setJournalCoverImgSrc((prev) => [...prev, ...newRecords]);
        }

        const newOrders = (response.content || []).map((order: any) => {
          const billingAddress = order?.orderAddresses?.find(
            (address: any) => address?.billingAddress
          )?.address;
          const shippingAddress = order?.orderAddresses?.find(
            (address: any) => address?.shippingAddress
          )?.address;
          return {
            id: order.orderId,
            packageName:
              order?.orderItemsAndTerms?.subsProdPkgDef?.description ||
              order?.orderItemsAndTerms?.packageDef?.packageKeyInfo
                ?.description ||
              order?.keyOrderInformation?.orderCode?.orderCodes?.description ||
              "Premium Package",
            placedDate: formatDate(order.createdAt),
            startDate: formatDate(order?.orderItemsAndTerms?.validFrom),
            quantity: order?.orderItemsAndTerms?.copiesPerIssue || 1,
            orderStatus: order.orderStatus,
            paymentStatus: order?.paymentBreakdown?.paymentStatus,
            price: order?.paymentBreakdown?.netAmount || 0,
            currency: order?.paymentBreakdown?.currency || "USD",
            imageUrl:
              imgSrc.find((item: any) => item.ocId === order?.orderClass?.ocId)
                ?.journalCoverImgSrc || "/images/placeholder.jpg",
            shippingAddress:
              formatAddress(shippingAddress)
                ?.filter((item: any) => item)
                .join(", ") || "",
            billingAddress:
              formatAddress(billingAddress)
                ?.filter((item: any) => item)
                .join(", ") || "",
            totalDiscount: order?.paymentBreakdown?.discount || 0,
            taxAmount: order?.paymentBreakdown?.tax || 0,
            shippingCost: order?.paymentBreakdown?.shippingCharge || 0,
            finalAmount: order?.paymentBreakdown?.netAmount || 0,
          };
        });

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
    [
      activeHasMore,
      historyHasMore,
      user?.customer?.customerId,
      journalCoverImgSrc,
    ]
  );

  useEffect(() => {
    if (activeTab === "active" && activeOrders.length === 0) {
      fetchOrder("active", 0);
    } else if (activeTab === "history" && historyOrders.length === 0) {
      fetchOrder("history", 0);
    }
  }, [activeTab, fetchOrder, activeOrders.length, historyOrders.length]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Your Orders
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Track and manage all your orders in one place
        </p>
      </div>

      <Tabs
        defaultValue="active"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading active orders...
              </div>
            </div>
          ) : activeOrders.length > 0 ? (
            <OrderTimeline
              orders={activeOrders}
              hasMore={activeHasMore}
              loadMore={() => fetchOrder("active", activePage + 1)}
              loadingMore={isLoadingMore}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-md">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any active orders at the moment.
              </p>
              <Button>Start Shopping</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading order history...
              </div>
            </div>
          ) : historyOrders.length > 0 ? (
            <OrderTimeline
              orders={historyOrders}
              hasMore={historyHasMore}
              loadMore={() => fetchOrder("history", historyPage + 1)}
              loadingMore={isLoadingMore}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-md">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Order History</h3>
              <p className="text-muted-foreground">
                Your completed orders will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
