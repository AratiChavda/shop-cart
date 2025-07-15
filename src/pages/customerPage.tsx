import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "@/components/table/dataTable";
import { DataTablePagination } from "@/components/table/dataTablePagination";
import { useTableData } from "@/hooks/useTableData";
import { Package, User } from "lucide-react";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { KeyValuePair } from "@/components/ui/keyValuePair";
import { useNavigate } from "react-router-dom";

const CustomerPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [customers] = useState([
    {
      customer_id: "CUST001",
      email: "john.doe@example.com",
      fname: "John",
      lastName: "Doe",
    },
    {
      customer_id: "CUST002",
      email: "jane.smith@example.com",
      fname: "Jane",
      lastName: "Smith",
    },
    {
      customer_id: "CUST003",
      email: "michael.brown@example.com",
      fname: "Michael",
      lastName: "Brown",
    },
    {
      customer_id: "CUST004",
      email: "emily.jones@example.com",
      fname: "Emily",
      lastName: "Jones",
    },
    {
      customer_id: "CUST005",
      email: "david.wilson@example.com",
      fname: "David",
      lastName: "Wilson",
    },
    {
      customer_id: "CUST006",
      email: "lisa.taylor@example.com",
      fname: "Lisa",
      lastName: "Taylor",
    },
    {
      customer_id: "CUST007",
      email: "robert.anderson@example.com",
      fname: "Robert",
      lastName: "Anderson",
    },
    {
      customer_id: "CUST008",
      email: "susan.moore@example.com",
      fname: "Susan",
      lastName: "Moore",
    },
    {
      customer_id: "CUST009",
      email: "kevin.jackson@example.com",
      fname: "Kevin",
      lastName: "Jackson",
    },
    {
      customer_id: "CUST010",
      email: "nancy.martin@example.com",
      fname: "Nancy",
      lastName: "Martin",
    },
  ]);

  const {
    paginatedData,
    page,
    setPage,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  } = useTableData({
    data: customers,
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
            Customers
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your customers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
          >
            {viewMode === "table" ? <Icons.lGrid /> : <Icons.lList />}
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {[
          { title: "Customer ID", key: "customer_id" },
          { title: "Email", key: "email" },
          { title: "First Name", key: "fname" },
          { title: "Last Name" },
        ]?.map((eachValue: any) => {
          return (
            <div
              key={eachValue.key}
              className="flex flex-col items-start gap-2"
            >
              <span className="text-sm text-gray-600">{eachValue.title}</span>
              <Input
                type="text"
                placeholder={`Search ${eachValue.title}...`}
                value={columnFilters[eachValue?.key] || ""}
                onChange={(e: any) =>
                  setColumnFilters({
                    ...columnFilters,
                    [eachValue.id]: e.target.value,
                  })
                }
              />
            </div>
          );
        })}
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
              header: "Email",
              accessorKey: "email",
            },
            {
              header: "First Name",
              accessorKey: "fname",
            },
            {
              header: "Last Name",
              accessorKey: "lastName",
            },
            {
              header: "Actions",
              accessorKey: "actions",
              enableSorting: false,
              cell: () => (
                <div className="flex items-center w-full">
                  <Button
                    variant="link"
                    className="cursor-pointer"
                    onClick={() => navigate("/dashboard/orders")}
                  >
                    <Package className="h-4 w-4" />
                    View Order Details
                  </Button>
                  <Button
                    variant="link"
                    className="cursor-pointer"
                    onClick={() => navigate("/dashboard/viewUserProfile/1")}
                  >
                    <User className="h-4 w-4" />
                    Customer Profile
                  </Button>
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
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden rounded-lg border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-0 via-0% to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <KeyValuePair
                          label="Customer ID"
                          value={item.customer_id}
                        />
                        <KeyValuePair
                          label="Name"
                          value={`${item.fname} ${item.lastName}`}
                        />
                        <KeyValuePair label="Email" value={item.email} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1 rounded-full text-gray-600 hover:text-gray-900 "
                          >
                            <Icons.moreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 mt-2 shadow-xl rounded-xl border border-gray-100 bg-white">
                          <DropdownMenuItem>
                            <Icons.order className="h-4 w-4" />
                            View Order Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icons.user className="h-4 w-4" />
                            Customer Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default CustomerPage;
