"use client";

import { Search } from "lucide-react";

interface SkillSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SkillSearch({ value, onChange, onSubmit }: SkillSearchProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    onSubmit();
  }

  return (
    <div className="flex max-w-[560px] gap-3">
      <div className="flex flex-1 items-center gap-2.5 rounded-xl border-[1.5px] border-gray-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Search size={16} className="text-gray-400" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="스킬 검색..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-[15px] text-black outline-none"
        />
      </div>
      <button
        onClick={onSubmit}
        className="whitespace-nowrap rounded-xl bg-black px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        검색
      </button>
    </div>
  );
}
