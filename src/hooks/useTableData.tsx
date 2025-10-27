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
  const [isServerSideRendering, setIsServerSideRendering] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [sorting, setSorting] = useState<Sorting[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    if (isServerSideRendering) return data;
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
  }, [isServerSideRendering, data, globalFilter, columnFilters]);

  const sortedData = useMemo(() => {
    if (isServerSideRendering) return data;
    if (!sorting.length) return filteredData;

    const [{ id, desc }] = sorting;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[id];
      const bValue = (b as any)[id];
      if (aValue < bValue) return desc ? 1 : -1;
      if (aValue > bValue) return desc ? -1 : 1;
      return 0;
    });
  }, [data, filteredData, isServerSideRendering, sorting]);

  const paginatedData = useMemo(() => {
    if (isServerSideRendering) return data;
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [isServerSideRendering, data, page, pageSize, sortedData]);

  const pageCount = isServerSideRendering
    ? Math.ceil(totalElements / pageSize)
    : Math.ceil(filteredData.length / pageSize);

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
    isDataLoading,
    setIsDataLoading,
    setIsServerSideRendering,
    setTotalElements,
  };
}
