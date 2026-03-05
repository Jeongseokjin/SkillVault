"use client";

import SkillCard from "./SkillCard";
import type { SkillWithAuthor } from "@/types";

interface SkillGridProps {
  skills: SkillWithAuthor[];
  isLoading: boolean;
}

export default function SkillGrid({ skills, isLoading }: SkillGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg font-medium">검색 결과가 없습니다</p>
        <p className="mt-1 text-sm">다른 키워드로 검색해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
