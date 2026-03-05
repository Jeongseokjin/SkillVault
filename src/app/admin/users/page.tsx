"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers((data as Profile[]) ?? []);
    setIsLoading(false);
  }

  async function updateUserRole(userId: string, role: UserRole) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
    }
  }

  async function deleteUser(userId: string) {
    const confirmed = window.confirm("정말 이 유저를 삭제하시겠습니까?");
    if (!confirmed) return;

    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (!error) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-black">
          유저 관리
        </h1>

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
                  <th className="px-6 py-3 font-semibold text-gray-500">유저명</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">이메일</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">역할</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">가입일</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-black">
                      {user.username ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          user.role === "admin"
                            ? "rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700"
                            : "rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="flex gap-2 px-6 py-4">
                      {user.role === "user" ? (
                        <button
                          onClick={() => updateUserRole(user.id, "admin")}
                          className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                        >
                          관리자로
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserRole(user.id, "user")}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                        >
                          유저로
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-400">
                유저가 없습니다
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
