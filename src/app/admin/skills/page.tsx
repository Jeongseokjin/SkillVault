"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Skill, SkillStatus } from "@/types";

const STATUS_FILTERS: SkillStatus[] = ["pending", "approved", "rejected"];

const STATUS_LABELS: Record<SkillStatus, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

const STATUS_COLORS: Record<SkillStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SkillStatus | "all">("all");
  const supabase = createClient();

  useEffect(() => {
    fetchSkills();
  }, [statusFilter]);

  async function fetchSkills() {
    setIsLoading(true);

    let query = supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setSkills((data as Skill[]) ?? []);
    setIsLoading(false);
  }

  async function updateSkillStatus(skillId: string, status: SkillStatus) {
    const { error } = await supabase
      .from("skills")
      .update({ status })
      .eq("id", skillId);

    if (!error) {
      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === skillId ? { ...skill, status } : skill
        )
      );
    }
  }

  async function deleteSkill(skillId: string) {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    const { error } = await supabase.from("skills").delete().eq("id", skillId);

    if (!error) {
      setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-black">
          스킬 관리
        </h1>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === "all"
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-500"
            )}
          >
            전체
          </button>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === status
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-500"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-500">제목</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">카테고리</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">상태</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">등록일</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-black">
                      {skill.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{skill.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-semibold",
                          STATUS_COLORS[skill.status]
                        )}
                      >
                        {STATUS_LABELS[skill.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(skill.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="flex gap-2 px-6 py-4">
                      {skill.status !== "approved" && (
                        <button
                          onClick={() => updateSkillStatus(skill.id, "approved")}
                          className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                        >
                          승인
                        </button>
                      )}
                      {skill.status !== "rejected" && (
                        <button
                          onClick={() => updateSkillStatus(skill.id, "rejected")}
                          className="rounded-lg bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-100"
                        >
                          거절
                        </button>
                      )}
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {skills.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-400">
                스킬이 없습니다
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
