import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  serverSideSorting?: boolean;
  sorting?: { id: string; desc: boolean }[];
  onSortingChange?: (newSorting: { id: string; desc: boolean }[]) => void;
}
export default function DataTable<TData, TValue>({
  columns,
  data,
  className = "",
  serverSideSorting,
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const handleHeaderClick = (columnId: string) => {
    const currentSort = sorting?.find((s) => s.id === columnId);
    let newSorting: any;
    if (!currentSort) {
      newSorting = [{ id: columnId, desc: false }];
    } else if (currentSort.desc === false) {
      newSorting = [{ id: columnId, desc: true }];
    } else {
      newSorting = [];
    }
    onSortingChange?.(newSorting);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    manualSorting: serverSideSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-md transition-all">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = sorting?.find((s) => s.id === header.id);
                  return (
                    <TableHead
                      key={header.id}
                      onClick={() =>
                        header.column.getCanSort()
                          ? handleHeaderClick(header.id as string)
                          : null
                      }
                      className="cursor-pointer select-none text-sm font-semibold text-gray-700"
                    >
                      <span className="flex w-full">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="ml-1 text-xs">
                          {header.column.getCanSort() ? (
                            isSorted?.desc === true ? (
                              <ArrowDown className="size-4" />
                            ) : isSorted?.desc === false ? (
                              <ArrowUp className="size-4" />
                            ) : (
                              <ArrowUpDown className="size-4" />
                            )
                          ) : (
                            ""
                          )}
                        </span>
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-sm px-4 py-1 text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-gray-500 py-8"
                >
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
