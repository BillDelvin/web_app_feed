import React from "react";
import * as RHF from "react-hook-form";
import * as Zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const searchSchema = Zod.z.object({
  searchQuery: Zod.z.string().max(100, "Search query must be 100 characters or less").optional(),
});

type SearchFormData = Zod.infer<typeof searchSchema>;

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search events...",
  defaultValue = "",
}) => {
  const { register, watch } = RHF.useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: defaultValue,
    },
  });

  const searchQuery = watch("searchQuery") ?? "";

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery || "");
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        {...register("searchQuery")}
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};
