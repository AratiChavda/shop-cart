import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import type { JSX } from "react";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function PaginationPageLink({
  pageNum,
  onPageChange,
  isActive = false,
}: {
  pageNum: number;
  onPageChange: (page: number) => void;
  isActive?: boolean;
}) {
  return (
    <PaginationItem key={pageNum}>
      {!isActive ? (
        <Button
          variant="default"
          disabled
          className="font-bold disabled:opacity-100"
        >
          {pageNum}
        </Button>
      ) : (
        <PaginationLink
          onClick={() => onPageChange(pageNum)}
          isActive={isActive}
          className="cursor-pointer"
        >
          {pageNum}
        </PaginationLink>
      )}
    </PaginationItem>
  );
}

const generatePaginationLinks = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const pages: JSX.Element[] = [];

  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationPageLink
          pageNum={i}
          isActive={currentPage !== i}
          onPageChange={onPageChange}
          key={i}
        />
      );
    }
  } else {
    pages.push(
      <PaginationPageLink
        pageNum={1}
        isActive={currentPage !== 1}
        onPageChange={onPageChange}
        key={1}
      />
    );

    if (currentPage < 3) {
      for (let i = 2; i <= 3; i++) {
        pages.push(
          <PaginationPageLink
            pageNum={i}
            isActive={currentPage !== i}
            onPageChange={onPageChange}
            key={i}
          />
        );
      }
    } else {
      if (currentPage > 3) {
        pages.push(<PaginationEllipsis key="ellipsis-before" />);
      }

      const minMiddleLinks =
        currentPage - 1 !== 1
          ? (currentPage + 1 === totalPages || currentPage == totalPages) &&
            currentPage - 2 !== 1
            ? currentPage - 2
            : currentPage - 1
          : currentPage;
      const maxMiddleLinks =
        currentPage + 1 !== totalPages
          ? currentPage !== totalPages
            ? currentPage + 1
            : currentPage - 1
          : currentPage;

      for (let i = minMiddleLinks; i <= maxMiddleLinks; i++) {
        pages.push(
          <PaginationPageLink
            pageNum={i}
            isActive={currentPage !== i}
            onPageChange={onPageChange}
            key={i}
          />
        );
      }
    }

    if (totalPages > 6 && currentPage + 2 < totalPages) {
      pages.push(<PaginationEllipsis key="ellipsis-after" />);
    }

    pages.push(
      <PaginationPageLink
        pageNum={totalPages}
        isActive={currentPage !== totalPages}
        onPageChange={onPageChange}
        key={totalPages}
      />
    );
  }
  return pages;
};

export const DataTablePagination = ({
  currentPage,
  pageCount,
  pageSize,
  pageSizeOptions = [10, 20, 30, 50],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) => {
  return (
    <div className="flex items-center justify-between p-4 w-full">
      <div className="flex items-center gap-4">
        <div className="text-sm text-nowrap text-muted-foreground w-full">
          Page <strong>{currentPage + 1}</strong> of {pageCount}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-nowrap">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size.toString()} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {generatePaginationLinks(currentPage, pageCount, onPageChange)}
          {currentPage < pageCount ? (
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                isActive={true}
                className="cursor-pointer"
              />
            </PaginationItem>
          ) : null}
        </PaginationContent>
      </Pagination>
    </div>
  );
};
