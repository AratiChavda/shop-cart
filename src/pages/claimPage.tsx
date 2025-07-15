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
import { CLAIM_STATUS } from "@/constant/common";
import { Textarea } from "@/components/ui/textarea";
import { KeyValuePair } from "@/components/ui/keyValuePair";

const claimStatusUpdateSchema = z.object({
  status: z.string().min(1, "Please select claim status"),
  remark: z.string().min(1, "Please enter a remark"),
});

type ClaimStatusUpdateFormValues = z.infer<typeof claimStatusUpdateSchema>;

const ClaimPage = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [claims] = useState([
    {
      customer_id: "CUST001",
      orderId: "ORD001",
      claimId: "CLM001",
      claimDate: "2023-10-01",
      claimStatus: CLAIM_STATUS.IN_PROGRESS,
    },
    {
      customer_id: "CUST002",
      orderId: "ORD002",
      claimId: "CLM002",
      claimDate: "2023-09-15",
      claimStatus: CLAIM_STATUS.UNABLE_TO_REPLACE,
    },
    {
      customer_id: "CUST003",
      orderId: "ORD003",
      claimId: "CLM003",
      claimDate: "2023-08-30",
      claimStatus: CLAIM_STATUS.OUT_OF_CLAIM_PERIOD,
    },
    {
      customer_id: "CUST004",
      orderId: "ORD004",
      claimId: "CLM004",
      claimDate: "2023-07-25",
      claimStatus: CLAIM_STATUS.REQUESTED_ISSUES_IN_TRANSIT,
    },
    {
      customer_id: "CUST005",
      orderId: "ORD005",
      claimId: "CLM005",
      claimDate: "2023-06-10",
      claimStatus: CLAIM_STATUS.REQUESTED_ISSUES_YET_TO_BE_PUBLISHED,
    },
    {
      customer_id: "CUST006",
      orderId: "ORD006",
      claimId: "CLM006",
      claimDate: "2023-05-12",
      claimStatus: CLAIM_STATUS.PROCESSED,
    },
    {
      customer_id: "CUST007",
      orderId: "ORD007",
      claimId: "CLM007",
      claimDate: "2023-04-05",
      claimStatus: CLAIM_STATUS.PARTIALLY_PROCESSED,
    },
    {
      customer_id: "CUST008",
      orderId: "ORD008",
      claimId: "CLM008",
      claimDate: "2023-03-21",
      claimStatus: CLAIM_STATUS.REQUESTED_ISSUES_SHIPPED,
    },
    {
      customer_id: "CUST009",
      orderId: "ORD009",
      claimId: "CLM009",
      claimDate: "2023-02-17",
      claimStatus: CLAIM_STATUS.IN_PROGRESS,
    },
    {
      customer_id: "CUST010",
      orderId: "ORD010",
      claimId: "CLM010",
      claimDate: "2023-01-30",
      claimStatus: CLAIM_STATUS.UNABLE_TO_REPLACE,
    },
  ]);

  const {
    paginatedData,
    page,
    setPage,
    pageCount,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
  } = useTableData({
    data: claims,
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
            Claim Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your customers Subscriptions & Claims
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
              header: "Customer ID",
              accessorKey: "customer_id",
            },
            {
              header: "Order Id",
              accessorKey: "orderId",
            },
            {
              header: "Claim ID",
              accessorKey: "claimId",
            },
            {
              header: "Claim Date",
              accessorKey: "claimDate",
            },
            {
              header: "Order Claim Status",
              accessorKey: "claimStatus",
            },
            {
              header: "Update Status",
              accessorKey: "actions",
              enableSorting: false,
              cell: () => (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="cursor-pointer">
                      Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Claim Status</DialogTitle>
                    </DialogHeader>
                    <ClaimStatusUpdateForm />
                  </DialogContent>
                </Dialog>
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
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden rounded-lg border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-0% to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-1">
                      <KeyValuePair
                        label="Customer ID"
                        value={item.customer_id}
                      />
                      <KeyValuePair label="Order ID" value={item.orderId} />
                      <KeyValuePair label="Claim ID" value={item.claimId} />
                      <KeyValuePair
                        label="Claim Status"
                        value={item.claimStatus}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Icons.calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{item.claimDate}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="cursor-pointer absolute right-2">
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Claim Status</DialogTitle>
                          </DialogHeader>
                          <ClaimStatusUpdateForm />
                        </DialogContent>
                      </Dialog>
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
};

const ClaimStatusUpdateForm = () => {
  const form = useForm<ClaimStatusUpdateFormValues>({
    resolver: zodResolver(claimStatusUpdateSchema),
    mode: "all",
    defaultValues: {
      status: "",
      remark: "",
    },
  });
  const onSubmit = async (data: ClaimStatusUpdateFormValues) => {
    console.log("updated:", data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Claim Status <span className="text-destructive"> *</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(CLAIM_STATUS)?.map((eacValue) => {
                    return (
                      <SelectItem key={eacValue[0]} value={eacValue[0]}>
                        {eacValue[1]}
                      </SelectItem>
                    );
                  })}
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
export default ClaimPage;
