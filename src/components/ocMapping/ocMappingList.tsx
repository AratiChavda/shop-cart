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

interface OcMappingListProps {
  handleEdit: (data: any) => void;
  handleAdd: () => void;
}

const OcMappingList = ({ handleEdit, handleAdd }: OcMappingListProps) => {
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
    fetchOcMapping();
  }, []);

  const fetchOcMapping = async () => {
    try {
      const payload = {
        class: "OcMapping",
        fields: "id,oc,orderClass,highwireCode",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setData(response.content);
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
            Order class mapping
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Define the order class mapping with code.
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
        <Button type="button" className="mb-4" onClick={() => handleAdd()}>
          <Icons.plus className="h-5 w-5 mr-2" />
          Add mapping
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {[
          { title: "Order Class", key: "oc" },
          { title: "Code", key: "highwireCode" },
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
              header: "Order Class",
              accessorKey: "oc",
            },
            {
              header: "Code",
              accessorKey: "highwireCode",
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
                        <KeyValuePair label="Order Class" value={item.oc} />
                        <KeyValuePair label="Code" value={item.highwireCode} />
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

export default OcMappingList;
