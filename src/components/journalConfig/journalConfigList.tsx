import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "@/components/table/dataTable";
import { DataTablePagination } from "@/components/table/dataTablePagination";
import { useTableData } from "@/hooks/useTableData";
import { useEffect, useState } from "react";
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
import { fetchEntityData } from "@/api/apiServices";

interface JournalConfigListProps {
  handleEdit: (data: any) => void;
  handleAddConfiguration: () => void;
}

const JournalConfigList = ({
  handleEdit,
  handleAddConfiguration,
}: JournalConfigListProps) => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [data, setData] = useState([]);

  const {
    paginatedData,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  } = useTableData({
    data: data,
    initialPageSize: 10,
  });

  useEffect(() => {
    fetchJournalConfiguration();
  }, []);

  const fetchJournalConfiguration = async () => {
    try {
      const payload = {
        class: "JournalConfiguration",
        fields:
          "id,customerCategory.custCategory,orderClass.orderClassName,journalOrderCodes.orderCode.orderCodes,journalSubDefs.subDef.subscriptionDefCode",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        const data = response.content?.map((item: any) => {
          return {
            id: item.id?.toString(),
            custCategory: item.customerCategory?.custCategory,
            orderClassName: item.orderClass?.orderClassName,
            orderCode: item.journalOrderCodes
              ?.map((oc: any) => oc?.orderCode?.orderCodes?.orderCode)
              .toString(),
            subDef: item.journalSubDefs
              ?.map((sd: any) => sd?.subDef?.subscriptionDefCode)
              .toString(),
          };
        });
        setData(data);
      } else {
        setData([]);
      }
    } catch (error: any) {
      console.error(error);
      setData([]);
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Journal Configuration
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Effortlessly configure your journal with dynamic order codes and
            Sub/Prod/Pack/Def
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

      <div className="flex justify-end">
        <Button
          type="button"
          className="mb-4"
          onClick={() => handleAddConfiguration()}
        >
          <Icons.plus className="h-5 w-5 mr-2" />
          Add Journal configuration
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {[
          { title: "Customer Category", key: "custCategory" },
          { title: "Order Class", key: "orderClassName" },
          { title: "Order Codes", key: "orderCode" },
          { title: "Sub/Prod/Pack/Def", key: "subDef" },
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
                    [eachValue.key]: e.target.value,
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
              header: "Customer Category",
              accessorKey: "custCategory",
            },
            {
              header: "Order Class",
              accessorKey: "orderClassName",
            },
            {
              header: "Order Codes",
              accessorKey: "orderCode",
            },
            {
              header: "Sub/Prod/Pack/Def",
              accessorKey: "subDef",
            },
            {
              header: "Actions",
              accessorKey: "actions",
              enableSorting: false,
              cell: ({ row }: { row: { original: { id: string } } }) => (
                <div className="flex items-center w-full">
                  <Button
                    variant="link"
                    className="cursor-pointer"
                    onClick={() => handleEdit(row.original.id)}
                  >
                    <Icons.pencilLine className="h-4 w-4" />
                    Edit
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
                          label="Customer Category"
                          value={item.custCategory}
                        />
                        <KeyValuePair
                          label="Order Class"
                          value={item.orderClassName}
                        />
                        <KeyValuePair
                          label="Order Codes"
                          value={item.orderCode}
                        />
                        <KeyValuePair
                          label="Sub/Prod/Pack/Def"
                          value={item.subDef}
                        />
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
                          <DropdownMenuItem
                            onClick={() => handleEdit(item.id)}
                          >
                            <Icons.pencilLine className="h-4 w-4" />
                            Edit
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
        pageSize={pageSize}
        pageCount={pageCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default JournalConfigList;
