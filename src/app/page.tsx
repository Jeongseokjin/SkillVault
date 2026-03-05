"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SkillSearch from "@/components/skills/SkillSearch";
import SkillFilter, { type SortOption } from "@/components/skills/SkillFilter";
import SkillGrid from "@/components/skills/SkillGrid";
import { useSkills } from "@/hooks/useSkills";

const STATS = [
  { label: "등록된 스킬", key: "skills" },
  { label: "누적 다운로드", key: "downloads" },
  { label: "스킬 제작자", key: "creators" },
] as const;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { skills, isLoading, totalCount } = useSkills({
    category: activeCategory,
    searchQuery: submittedQuery,
    sortBy,
  });

  function handleSearch() {
    setSubmittedQuery(searchQuery);
  }

  function getStatValue(key: string) {
    switch (key) {
      case "skills":
        return `${totalCount}+`;
      case "downloads": {
        const total = skills.reduce((sum, skill) => sum + skill.downloads, 0);
        return total.toLocaleString();
      }
      case "creators": {
        const uniqueAuthors = new Set(skills.map((skill) => skill.author_id));
        return `${uniqueAuthors.size}명`;
      }
      default:
        return "0";
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-[960px] px-12 pb-16 pt-20">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-1.5 pr-3">
          <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
            NEW
          </span>
          <span className="text-xs font-medium text-gray-500">
            누구나 스킬을 만들고 공유할 수 있어요
          </span>
        </div>

        <h1 className="mb-5 text-[56px] font-bold leading-[1.05] tracking-[-2px] text-[#0a0a0a]">
          AI 스킬을
          <br />
          <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
            찾고, 만들고, 공유하세요
          </span>
        </h1>

        <p className="mb-10 max-w-[480px] text-[17px] leading-relaxed text-gray-500">
          Claude 에이전트 스킬을 한 곳에서.
          <br />
          검색 한 번으로 내 워크플로우에 바로 적용하세요.
        </p>

        <SkillSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
        />
      </div>

      <div className="mx-auto max-w-[960px] px-12 pb-20">
        <div className="mb-12 grid grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.key}
              className="rounded-xl border border-gray-200 bg-white px-6 py-5 text-center"
            >
              <div className="text-[28px] font-bold tracking-tight text-[#0a0a0a]">
                {getStatValue(stat.key)}
              </div>
              <div className="mt-1 text-[13px] font-medium text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <SkillFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <SkillGrid skills={skills} isLoading={isLoading} />

        <div className="mt-12 flex items-center justify-between rounded-[20px] bg-black p-12">
          <div>
            <h2 className="mb-2 text-[28px] font-bold tracking-tight text-white">
              나만의 스킬을 공유해보세요
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500">
              직접 만든 스킬을 등록하고
              <br />
              다른 사람들과 함께 사용하세요.
            </p>
          </div>
          <Link
            href="/skills/upload"
            className="whitespace-nowrap rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold text-black transition-opacity hover:opacity-90"
          >
            스킬 업로드 →
          </Link>
        </div>
      </div>
    </div>
  );
}
