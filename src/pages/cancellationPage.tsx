import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "@/components/table/dataTable";
import { DataTablePagination } from "@/components/table/dataTablePagination";
import { useTableData } from "@/hooks/useTableData";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import GlobalFilter from "@/components/table/globalFilter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KeyValuePair } from "@/components/ui/keyValuePair";
import { REFUND_STATUS, CANCELLATION_STATUS } from "@/constant/common";

const statusUpdateSchema = z.object({
  status: z.string().min(1, "Please select status"),
  remark: z.string().min(1, "Please enter a remark"),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

const CancellationPage = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [cancellations] = useState([
    {
      orderId: "ORD001",
      startDate: "2023-10-01",
      endDate: "2023-10-31",
      cancellationReqDate: "2023-10-05",
      customerId: "CUST001",
      customerEmail: "cust001@example.com",
      cancellationStatus: CANCELLATION_STATUS.REQUEST_RECEIVED,
      refundStatus: REFUND_STATUS.IN_PROGRESS,
    },
    {
      orderId: "ORD002",
      startDate: "2023-09-01",
      endDate: "2023-09-30",
      cancellationReqDate: "2023-09-10",
      customerId: "CUST002",
      customerEmail: "cust002@example.com",
      cancellationStatus: CANCELLATION_STATUS.UNABLE_TO_CANCEL,
      refundStatus: REFUND_STATUS.UNABLE_TO_REFUND,
    },
    {
      orderId: "ORD003",
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      cancellationReqDate: "2023-08-15",
      customerId: "CUST003",
      customerEmail: "cust003@example.com",
      cancellationStatus: CANCELLATION_STATUS.CONFIRMED,
      refundStatus: REFUND_STATUS.FULL_REFUND_ISSUED,
    },
    {
      orderId: "ORD004",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      cancellationReqDate: "2023-07-20",
      customerId: "CUST004",
      customerEmail: "cust004@example.com",
      cancellationStatus: CANCELLATION_STATUS.REQUEST_RECEIVED,
      refundStatus: REFUND_STATUS.PARTIAL_REFUND_ISSUED,
    },
    {
      orderId: "ORD005",
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      cancellationReqDate: "2023-06-25",
      customerId: "CUST005",
      customerEmail: "cust005@example.com",
      cancellationStatus: CANCELLATION_STATUS.CONFIRMED,
      refundStatus: REFUND_STATUS.FULL_REFUND_ISSUED,
    },
  ]);

  const {
    paginatedData,
    pageSize,
    setPageSize,
    page,
    setPage,
    pageCount,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
  } = useTableData({
    data: cancellations,
    initialPageSize: 15,
  });

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Cancellation Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your customers Cancellations & Refunds
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
          columns={[
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
              header: "Cancellation Req Date",
              accessorKey: "cancellationReqDate",
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
              header: "Cancellation Status",
              accessorKey: "cancellationStatus",
            },
            {
              header: "Refund Status",
              accessorKey: "refundStatus",
            },
            {
              header: "Update Status",
              accessorKey: "actions",
              enableSorting: false,
              cell: () => (
                <div className="flex">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="cursor-pointer">
                        Refund
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Refund Status</DialogTitle>
                      </DialogHeader>
                      <StatusUpdateForm type="refund" />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="cursor-pointer">
                        Cancellation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Cancellation Status</DialogTitle>
                      </DialogHeader>
                      <StatusUpdateForm type="cancellation" />
                    </DialogContent>
                  </Dialog>
                </div>
              ),
            },
          ]}
          sorting={sorting}
          onSortingChange={setSorting}
        ></DataTable>
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
                      <KeyValuePair
                        label="Customer ID"
                        value={item.customerId}
                      />
                      <KeyValuePair
                        label="Customer Email"
                        value={item.customerEmail}
                      />
                      <KeyValuePair
                        label="Cancellation Status"
                        value={item.cancellationStatus}
                      />
                      <KeyValuePair
                        label="Refund Status"
                        value={item.refundStatus}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Icons.calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{item.cancellationReqDate}</span>
                      </div>
                      <div className="flex gap-2 absolute right-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="cursor-pointer">
                              Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Refund Status</DialogTitle>
                            </DialogHeader>
                            <StatusUpdateForm type="refund" />
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="cursor-pointer">
                              Cancellation
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Update Cancellation Status
                              </DialogTitle>
                            </DialogHeader>
                            <StatusUpdateForm type="cancellation" />
                          </DialogContent>
                        </Dialog>
                      </div>
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
        pageSize={pageSize}
        pageCount={pageCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

const StatusUpdateForm = ({ type }: { type: "refund" | "cancellation" }) => {
  const form = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    mode: "all",
    defaultValues: {
      status: "",
      remark: "",
    },
  });

  const onSubmit = async (data: StatusUpdateFormValues) => {
    console.log(`${type} updated:`, data);
    form.reset();
  };

  const statusOptions = type === "refund" ? REFUND_STATUS : CANCELLATION_STATUS;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "refund" ? "Refund Status" : "Cancellation Status"}{" "}
                <span className="text-destructive"> *</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${type} status`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(statusOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Remark <span className="text-destructive"> *</span>
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default CancellationPage;
