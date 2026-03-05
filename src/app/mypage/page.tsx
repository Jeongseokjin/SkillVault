"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Skill, DownloadWithSkill } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

type Tab = "skills" | "downloads" | "profile";

export default function MyPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("skills");
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [myDownloads, setMyDownloads] = useState<DownloadWithSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editUsername, setEditUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/mypage");
      return;
    }
    fetchData();
  }, [user, authLoading]);

  useEffect(() => {
    if (profile) setEditUsername(profile.username ?? "");
  }, [profile]);

  async function fetchData() {
    if (!user) return;

    setIsLoading(true);

    const [skillsResult, downloadsResult] = await Promise.all([
      supabase
        .from("skills")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("downloads")
        .select("*, skills(title, category, preview_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setMySkills((skillsResult.data as Skill[]) ?? []);
    setMyDownloads((downloadsResult.data as DownloadWithSkill[]) ?? []);
    setIsLoading(false);
  }

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ username: editUsername.trim() })
      .eq("id", user.id);

    if (error) {
      setSaveMessage("저장에 실패했습니다. 잠시 후 다시 시도해주세요");
    } else {
      setSaveMessage("프로필이 저장되었습니다");
    }

    setIsSaving(false);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "skills", label: `내 스킬 (${mySkills.length})` },
    { key: "downloads", label: `다운로드 (${myDownloads.length})` },
    { key: "profile", label: "프로필 수정" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-black">
            마이페이지
          </h1>
          <p className="text-sm text-gray-500">
            {profile?.email}
          </p>
        </div>

        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "border-b-2 px-4 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "skills" && (
              <div className="space-y-3">
                {mySkills.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="mb-4 text-gray-400">아직 등록한 스킬이 없습니다</p>
                    <Link
                      href="/skills/upload"
                      className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      첫 스킬 업로드하기
                    </Link>
                  </div>
                )}
                {mySkills.map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div>
                      <h3 className="mb-1 font-semibold text-black">
                        {skill.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {skill.category} · ↓ {skill.downloads}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold",
                        STATUS_COLORS[skill.status]
                      )}
                    >
                      {STATUS_LABELS[skill.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="space-y-3">
                {myDownloads.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="mb-4 text-gray-400">다운로드한 스킬이 없습니다</p>
                    <Link
                      href="/skills"
                      className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      스킬 탐색하기
                    </Link>
                  </div>
                )}
                {myDownloads.map((download) => (
                  <Link
                    key={download.id}
                    href={`/skills/${download.skill_id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div>
                      <h3 className="mb-1 font-semibold text-black">
                        {download.skills.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {download.skills.category}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(download.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="max-w-md space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    유저명
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                    placeholder="유저명을 입력하세요"
                  />
                </div>

                {saveMessage && (
                  <p
                    className={cn(
                      "rounded-lg px-4 py-2.5 text-sm",
                      saveMessage.includes("실패")
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    )}
                  >
                    {saveMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? "저장 중..." : "프로필 저장"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
