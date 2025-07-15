import { useState, useMemo, useEffect } from "react";

interface Sorting {
  id: string;
  desc: boolean;
}

interface UseTableDataParams<T> {
  data: T[];
  initialPageSize?: number;
}

export function useTableData<T>({
  data,
  initialPageSize = 10,
}: UseTableDataParams<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [sorting, setSorting] = useState<Sorting[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    let filtered = data;

    if (globalFilter) {
      const gf = globalFilter.toLowerCase();
      filtered = filtered.filter((item: any) =>
        Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(gf)
        )
      );
    }

    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (!filterValue) return;
      const fv = filterValue.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const cellValue = item[columnId];
        return cellValue && cellValue.toString().toLowerCase().includes(fv);
      });
    });

    return filtered;
  }, [data, globalFilter, columnFilters]);

  const sortedData = useMemo(() => {
    if (!sorting.length) return filteredData;

    const [{ id, desc }] = sorting;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[id];
      const bValue = (b as any)[id];
      if (aValue < bValue) return desc ? 1 : -1;
      if (aValue > bValue) return desc ? -1 : 1;
      return 0;
    });
  }, [filteredData, sorting]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const pageCount = Math.ceil(filteredData.length / pageSize);

  useEffect(() => {
    setPage(0);
  }, [globalFilter, columnFilters, pageSize]);

  return {
    paginatedData,
    page,
    setPage,
    pageCount,
    pageSize,
    setPageSize,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
  };
}
