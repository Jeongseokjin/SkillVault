"use client";

import { cn } from "@/lib/utils";

const CATEGORIES = ["전체", "디자인/UI", "개발", "마케팅"] as const;

const SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "평점순", value: "rating" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface SkillFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function SkillFilter({
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: SkillFilterProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all duration-150",
              activeCategory === category
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              sortBy === option.value
                ? "bg-gray-100 text-black"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
