import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export const DataTablePagination = ({
  currentPage,
  pageCount,
  onPageChange,
}: DataTablePaginationProps) => {
  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <div className="flex items-center justify-between p-4 w-full">
      <div className="text-sm text-muted-foreground w-full">
        Page <strong>{currentPage + 1}</strong> of {pageCount}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
              className={
                currentPage === 0
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, pageCount - 1))
              }
              className={
                currentPage === pageCount - 1
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
