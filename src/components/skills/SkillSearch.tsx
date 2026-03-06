'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface SkillSearchProps {
  defaultValue?: string
  onSearch: (query: string) => void
}

export default function SkillSearch({
  defaultValue = '',
  onSearch,
}: SkillSearchProps) {
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSearch(value)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-[560px] gap-3">
      <div className="flex flex-1 items-center gap-2.5 rounded-lg border-[1.5px] border-[#E5E5E5] bg-surface px-4 py-3 shadow-sm">
        <Search size={16} className="shrink-0 text-text-tertiary" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="스킬 검색..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        검색
      </button>
    </form>
  )
}
