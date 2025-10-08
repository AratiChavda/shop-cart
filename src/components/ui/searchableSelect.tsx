import * as React from "react";
import { Check, ChevronDown, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface SearchableSelectProps<T> {
  value: string;
  onValueChange: (value: string) => void;
  options: T[];
  valueKey: keyof T;
  labelKey: keyof T;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  searchPlaceholder?: string;
  notFoundMessage?: string;
}

const SearchableSelect = <T extends Record<string, any>>({
  value,
  onValueChange,
  options,
  valueKey,
  labelKey,
  placeholder = "Select an option",
  disabled = false,
  isLoading = false,
  searchPlaceholder = "Search...",
  notFoundMessage = "No options found.",
}: SearchableSelectProps<T>) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option[valueKey] === value);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between text-sm bg-transparent font-normal hover:bg-transparent ${
              disabled ? "cursor-not-allowed" : ""
            } ${
              selectedOption
                ? "text-accent-foreground hover:text-accent-foreground"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
            disabled={disabled || isLoading}
          >
            {selectedOption ? selectedOption[labelKey] : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{notFoundMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option[valueKey]}
                    value={String(option[labelKey])}
                    onSelect={() => {
                      onValueChange(option[valueKey]);
                      setOpen(false);
                    }}
                    className="w-full flex justify-between"
                  >
                    {option[labelKey]}
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option[valueKey] ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isLoading && (
        <Loader2Icon className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
      )}
    </div>
  );
};

export default SearchableSelect;
