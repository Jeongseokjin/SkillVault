"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalSkills: number;
  totalUsers: number;
  todayDownloads: number;
  pendingSkills: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSkills: 0,
    totalUsers: 0,
    todayDownloads: 0,
    pendingSkills: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [skillsResult, usersResult, downloadsResult, pendingResult] =
      await Promise.all([
        supabase.from("skills").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("downloads")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("skills")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

    setStats({
      totalSkills: skillsResult.count ?? 0,
      totalUsers: usersResult.count ?? 0,
      todayDownloads: downloadsResult.count ?? 0,
      pendingSkills: pendingResult.count ?? 0,
    });
    setIsLoading(false);
  }

  const statCards = [
    { label: "전체 스킬", value: stats.totalSkills },
    { label: "전체 유저", value: stats.totalUsers },
    { label: "오늘 다운로드", value: stats.todayDownloads },
    { label: "승인 대기", value: stats.pendingSkills },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">
          관리자 대시보드
        </h1>
        <p className="mb-10 text-sm text-gray-500">
          SkillVault 전체 현황을 확인하세요
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : (
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
              >
                <div className="text-3xl font-bold tracking-tight text-black">
                  {card.value}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-400">
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/skills"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="mb-1 text-lg font-bold text-black">스킬 관리</h3>
            <p className="text-sm text-gray-400">스킬 승인, 거절, 삭제</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="mb-1 text-lg font-bold text-black">유저 관리</h3>
            <p className="text-sm text-gray-400">유저 역할 변경, 삭제</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
