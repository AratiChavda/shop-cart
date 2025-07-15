import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Order {
  id: string;
  packageName: string;
  placedDate: string;
  startDate: string;
  quantity: number;
  price: number;
  paymentStatus: "Paid" | "Pending" | "Failed";
  orderStatus:
    | "Complete"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  imageUrl: string;
}

const orders: Order[] = [
  {
    id: "1389572",
    packageName: "THINK365 Complete Online Only - Package 2024",
    placedDate: "21 Feb 2024",
    startDate: "21 Feb 2024",
    quantity: 1,
    price: 8616.88,
    paymentStatus: "Paid",
    orderStatus: "Complete",
    imageUrl: "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
  },
  {
    id: "1389573",
    packageName: "THINK365 Advanced Package 2024",
    placedDate: "15 Mar 2024",
    startDate: "15 Mar 2024",
    quantity: 2,
    price: 12500.5,
    paymentStatus: "Pending",
    orderStatus: "Processing",
    imageUrl: "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
  },
  {
    id: "1389574",
    packageName: "THINK365 Premium Subscription",
    placedDate: "10 Apr 2024",
    startDate: "12 Apr 2024",
    quantity: 1,
    price: 4500.0,
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    imageUrl: "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
  },
  {
    id: "1389575",
    packageName: "THINK365 Starter Kit 2024",
    placedDate: "05 May 2024",
    startDate: "06 May 2024",
    quantity: 3,
    price: 2300.75,
    paymentStatus: "Failed",
    orderStatus: "Cancelled",
    imageUrl: "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
  },
  {
    id: "1389576",
    packageName: "THINK365 Professional Bundle",
    placedDate: "20 Jun 2024",
    startDate: "22 Jun 2024",
    quantity: 1,
    price: 9900.0,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    imageUrl: "https://unebraskajournals-us.imgix.net/journals/0149-9408.jpg",
  },
];

const OrderTimeline: React.FC<{ orders: Order[]; isActive: boolean }> = ({
  orders,
  isActive,
}) => {
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  const getStatusActions = (status: Order["orderStatus"]) => {
    switch (status) {
      case "Processing":
        return [
          { label: "Track Order", icon: <Truck className="h-4 w-4" /> },
          { label: "Cancel Order", icon: <FileText className="h-4 w-4" /> },
        ];
      case "Shipped":
        return [
          { label: "Track Shipment", icon: <Truck className="h-4 w-4" /> },
          // { label: "File Claim", icon: <FileText className="h-4 w-4" /> },
        ];
      case "Delivered":
        return [
          // { label: "View Receipt", icon: <FileText className="h-4 w-4" /> },
          { label: "Return Item", icon: <Package className="h-4 w-4" /> },
        ];
      case "Complete":
        return [
          {
            label: "Download Certificate",
            icon: <CheckCircle className="h-4 w-4" />,
          },
        ];
      case "Cancelled":
        return [
          { label: "View Details", icon: <FileText className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-primary to-primary/20"></div>
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
            className={`mb-12 flex flex-col sm:flex-row justify-between items-center w-full ${
              isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
            }`}
          >
            <div
              className={`w-full sm:w-5/12 ${isLeft ? "sm:pr-8" : "sm:pl-8"}`}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-primary/10 overflow-hidden">
                <CardHeader className="relative bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="text-lg font-semibold text-primary flex justify-between items-center">
                    {order.packageName}
                    <Badge
                      variant={
                        order.orderStatus === "Complete" ||
                        order.orderStatus === "Delivered" ||
                        order.orderStatus === "Shipped"
                          ? "success"
                          : order.orderStatus === "Cancelled"
                          ? "destructive"
                          : order.orderStatus === "Processing"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.orderStatus}
                    </Badge>
                  </CardTitle>
                  <motion.div
                    className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <motion.img
                      src={order.imageUrl}
                      alt="Order"
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
                          ${order.price.toFixed(2)}
                        </span>
                        <span>Payment:</span>
                        <span className="font-medium">
                          <Badge
                            variant={
                              order.paymentStatus === "Paid"
                                ? "success"
                                : order.paymentStatus === "Pending"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </span>
                      </div>
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
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </div>
            <div className="w-full sm:w-2/12 flex justify-center relative z-10">
              <motion.div
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.3, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Package className="h-5 w-5" />
              </motion.div>
            </div>
            <div className="hidden sm:block sm:w-5/12"></div>
          </motion.div>
        );
      })}
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("active");

  const activeOrders = orders.filter((order) =>
    ["Processing", "Shipped"].includes(order.orderStatus)
  );
  const orderHistory = orders.filter((order) =>
    ["Complete", "Delivered", "Cancelled"].includes(order.orderStatus)
  );

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "active" ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "active" ? -30 : 30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <TabsContent value="active">
              {activeOrders.length > 0 ? (
                <OrderTimeline orders={activeOrders} isActive={true} />
              ) : (
                <p className="text-center text-primary/60">
                  No active orders at the moment.
                </p>
              )}
            </TabsContent>
            <TabsContent value="history">
              {orderHistory.length > 0 ? (
                <OrderTimeline orders={orderHistory} isActive={false} />
              ) : (
                <p className="text-center text-primary/60">
                  No order history available.
                </p>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
