"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SkillWithAuthor } from "@/types";
import type { SortOption } from "@/components/skills/SkillFilter";

interface UseSkillsParams {
  category?: string;
  searchQuery?: string;
  sortBy?: SortOption;
}

interface UseSkillsReturn {
  skills: SkillWithAuthor[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export function useSkills({
  category = "전체",
  searchQuery = "",
  sortBy = "latest",
}: UseSkillsParams = {}): UseSkillsReturn {
  const [skills, setSkills] = useState<SkillWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("skills")
        .select("*, profiles(username, avatar_url)", { count: "exact" })
        .eq("status", "approved");

      if (category !== "전체") {
        query = query.eq("category", category);
      }

      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      switch (sortBy) {
        case "popular":
          query = query.order("downloads", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        setError("스킬 목록을 불러오는데 실패했습니다");
        return;
      }

      setSkills((data as SkillWithAuthor[]) ?? []);
      setTotalCount(count ?? 0);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    } finally {
      setIsLoading(false);
    }
  }, [category, searchQuery, sortBy]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, isLoading, error, totalCount, refetch: fetchSkills };
}
