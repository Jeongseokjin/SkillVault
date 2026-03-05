"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const NAV_ITEMS = [
  { label: "탐색", href: "/skills" },
  { label: "업로드", href: "/skills/upload" },
] as const;

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
        return;
      }
      setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  const isAdmin = profile?.role === "admin";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex h-16 items-center justify-between",
        "border-b border-gray-200 bg-white/95 px-12 backdrop-blur-md"
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
          <span className="text-sm text-white">V</span>
        </div>
        <span className="text-[17px] font-bold tracking-tight">SkillVault</span>
      </Link>

      <div className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onMouseEnter={() => setHoveredNav(item.label)}
            onMouseLeave={() => setHoveredNav(null)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-all duration-150",
              hoveredNav === item.label && "bg-gray-100"
            )}
          >
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            onMouseEnter={() => setHoveredNav("관리자")}
            onMouseLeave={() => setHoveredNav(null)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-all duration-150",
              hoveredNav === "관리자" && "bg-gray-100"
            )}
          >
            관리자
          </Link>
        )}

        {profile ? (
          <div className="ml-2 flex items-center gap-2">
            <Link
              href="/mypage"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
            >
              {profile.username ?? "마이페이지"}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="ml-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            시작하기
          </Link>
        )}
      </div>
    </nav>
  );
}
