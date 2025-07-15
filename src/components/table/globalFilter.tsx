import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface GlobalFilterProps {
  globalFilter: string;
  setGlobalFilter: (globalFilter: string) => void;
}
export default function GlobalFilter({
  globalFilter,
  setGlobalFilter,
}: GlobalFilterProps) {
  return (
    <div className="relative max-w-md">
      <Input
        placeholder="Search..."
        value={globalFilter}
        onChange={(e: any) => setGlobalFilter(e.target.value)}
        className="pl-10 pr-4 py-2 rounded-xl"
      />
      <Search className="absolute left-3 top-2 text-gray-400 h-5 w-5" />
      {globalFilter && (
        <button
          onClick={() => setGlobalFilter("")}
          className="absolute right-3 top-2"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
