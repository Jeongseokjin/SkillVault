"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillWithAuthor } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  "디자인/UI": "⬡",
  "개발": "◈",
  "마케팅": "◉",
};

interface SkillCardProps {
  skill: SkillWithAuthor;
}

function StarRating({ rating }: { rating: number }) {
  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <span className="text-[13px] font-bold text-black">{rating.toFixed(1)}</span>
      <div className="flex gap-px">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={10}
            className={cn(
              index < roundedRating
                ? "fill-black text-black"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function SkillCard({ skill }: SkillCardProps) {
  const icon = CATEGORY_ICONS[skill.category] ?? "◎";
  const isPremium = skill.price === "premium";

  return (
    <Link href={`/skills/${skill.id}`}>
      <div
        className={cn(
          "cursor-pointer rounded-2xl border-[1.5px] border-gray-200 bg-white p-6",
          "transition-all duration-200 ease-in-out",
          "hover:-translate-y-1 hover:border-black hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gray-100 text-lg">
            {icon}
          </div>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gray-500">
            {skill.category}
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold tracking-tight text-black">
          {skill.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
          {skill.description}
        </p>

        {skill.tags && skill.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
          <StarRating rating={skill.rating} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              ↓ {skill.downloads.toLocaleString()}
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold",
                isPremium
                  ? "bg-pink-50 text-gray-600"
                  : "bg-gray-100 text-black"
              )}
            >
              {isPremium ? "프리미엄" : "무료"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
