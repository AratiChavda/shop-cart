import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "@/components/table/dataTable";
import { DataTablePagination } from "@/components/table/dataTablePagination";
import { useTableData } from "@/hooks/useTableData";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import GlobalFilter from "@/components/table/globalFilter";
import { KeyValuePair } from "@/components/ui/keyValuePair";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RenewalPage = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [renewals] = useState([
    {
      orderId: "ORD001",
      startDate: "2023-10-01",
      endDate: "2023-10-31",
      customerId: "CUST001",
      customerEmail: "cust001@example.com",
      status: "expired",
    },
    {
      orderId: "ORD002",
      startDate: "2023-09-01",
      endDate: "2023-09-30",
      customerId: "CUST002",
      customerEmail: "cust002@example.com",
      status: "expired",
    },
    {
      orderId: "ORD003",
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      customerId: "CUST003",
      customerEmail: "cust003@example.com",
      status: "expired",
    },
    {
      orderId: "ORD004",
      startDate: "2025-06-01",
      endDate: "2025-06-30",
      customerId: "CUST004",
      customerEmail: "cust004@example.com",
      status: "aboutToExpire",
    },
    {
      orderId: "ORD005",
      startDate: "2025-06-01",
      endDate: "2025-06-30",
      customerId: "CUST005",
      customerEmail: "cust005@example.com",
      status: "aboutToExpire",
    },
  ]);

  const expiredData = renewals.filter((item) => item.status === "expired");
  const aboutToExpireData = renewals.filter(
    (item) => item.status === "aboutToExpire"
  );

  const {
    paginatedData: expiredPaginatedData,
    page: expiredPage,
    setPage: setExpiredPage,
    pageCount: expiredPageCount,
    sorting: expiredSorting,
    setSorting: setExpiredSorting,
    globalFilter: expiredGlobalFilter,
    setGlobalFilter: setExpiredGlobalFilter,
  } = useTableData({
    data: expiredData,
    initialPageSize: 15,
  });

  const {
    paginatedData: aboutToExpirePaginatedData,
    page: aboutToExpirePage,
    setPage: setAboutToExpirePage,
    pageCount: aboutToExpirePageCount,
    sorting: aboutToExpireSorting,
    setSorting: setAboutToExpireSorting,
    globalFilter: aboutToExpireGlobalFilter,
    setGlobalFilter: setAboutToExpireGlobalFilter,
  } = useTableData({
    data: aboutToExpireData,
    initialPageSize: 15,
  });

  const handleSendReminder = (email: string) => {
    toast.success(`Reminder email sent to ${email}`);
  };

  const columns = [
    {
      header: "Order ID",
      accessorKey: "orderId",
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
    },
    {
      header: "End Date",
      accessorKey: "endDate",
    },
    {
      header: "Customer ID",
      accessorKey: "customerId",
    },
    {
      header: "Customer Email",
      accessorKey: "customerEmail",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }: { row: { original: { customerEmail: string } } }) => (
        <Button
          variant="link"
          className="cursor-pointer"
          onClick={() => handleSendReminder(row.original.customerEmail)}
        >
          Send Reminder Email
        </Button>
      ),
    },
  ];

  const renderDashboard = (
    paginatedData: any[],
    page: number,
    setPage: (page: number) => void,
    pageCount: number,
    sorting: any,
    setSorting: (sorting: any) => void,
    globalFilter: string,
    setGlobalFilter: (filter: string) => void,
    title: string
  ) => (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your customers Subscriptions & Renewals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <GlobalFilter
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
          >
            {viewMode === "table" ? <Icons.lGrid /> : <Icons.lList />}
          </Button>
        </motion.div>
      </div>

      {viewMode === "table" ? (
        <DataTable
          data={paginatedData}
          columns={columns}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {paginatedData.map((item: any) => (
              <motion.div
                key={item.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden rounded-lg border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-0% to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-1">
                      <KeyValuePair label="Order ID" value={item.orderId} />
                      <KeyValuePair label="Start Date" value={item.startDate} />
                      <KeyValuePair label="End Date" value={item.endDate} />
                      <KeyValuePair
                        label="Customer ID"
                        value={item.customerId}
                      />
                      <KeyValuePair
                        label="Customer Email"
                        value={item.customerEmail}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="link"
                        className="cursor-pointer absolute right-2"
                        onClick={() => handleSendReminder(item.customerEmail)}
                      >
                        Send Reminder Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <DataTablePagination
        currentPage={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </div>
  );

  return (
    <Tabs defaultValue="expired" className="w-full">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="expired">Expired</TabsTrigger>
        <TabsTrigger value="aboutToExpire">About to Expire</TabsTrigger>
      </TabsList>
      <TabsContent value="expired">
        {renderDashboard(
          expiredPaginatedData,
          expiredPage,
          setExpiredPage,
          expiredPageCount,
          expiredSorting,
          setExpiredSorting,
          expiredGlobalFilter,
          setExpiredGlobalFilter,
          "Expired Dashboard"
        )}
      </TabsContent>
      <TabsContent value="aboutToExpire">
        {renderDashboard(
          aboutToExpirePaginatedData,
          aboutToExpirePage,
          setAboutToExpirePage,
          aboutToExpirePageCount,
          aboutToExpireSorting,
          setAboutToExpireSorting,
          aboutToExpireGlobalFilter,
          setAboutToExpireGlobalFilter,
          "About to Expire Dashboard"
        )}
      </TabsContent>
    </Tabs>
  );
};

export default RenewalPage;