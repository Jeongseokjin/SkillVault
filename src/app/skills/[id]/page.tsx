"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Star, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { SkillWithAuthor, ReviewWithUser } from "@/types";

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const supabase = createClient();

  const [skill, setSkill] = useState<SkillWithAuthor | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchSkill = useCallback(async () => {
    const { data } = await supabase
      .from("skills")
      .select("*, profiles(username, avatar_url)")
      .eq("id", id)
      .single();

    if (data) setSkill(data as SkillWithAuthor);
    setIsLoading(false);
  }, [id]);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(username, avatar_url)")
      .eq("skill_id", id)
      .order("created_at", { ascending: false });

    if (data) setReviews(data as ReviewWithUser[]);
  }, [id]);

  useEffect(() => {
    fetchSkill();
    fetchReviews();
  }, [fetchSkill, fetchReviews]);

  async function handleDownload() {
    if (!user) return;
    if (!skill?.file_url) return;

    setIsDownloading(true);

    await supabase.from("downloads").insert({
      skill_id: skill.id,
      user_id: user.id,
    });

    await supabase
      .from("skills")
      .update({ downloads: skill.downloads + 1 })
      .eq("id", skill.id);

    window.open(skill.file_url, "_blank");
    setSkill((prev) => (prev ? { ...prev, downloads: prev.downloads + 1 } : null));
    setIsDownloading(false);
  }

  async function handleReviewSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setIsSubmittingReview(true);

    const { error } = await supabase.from("reviews").insert({
      skill_id: id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });

    if (!error) {
      setReviewComment("");
      setReviewRating(5);
      await fetchReviews();
    }

    setIsSubmittingReview(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <p className="text-lg font-medium">스킬을 찾을 수 없습니다</p>
          <Link href="/skills" className="mt-4 text-sm text-black hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = skill.price === "premium";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/skills"
          className="mb-8 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black"
        >
          <ArrowLeft size={14} />
          목록으로
        </Link>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {skill.category}
            </span>
            <span
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-bold",
                isPremium ? "bg-pink-50 text-gray-600" : "bg-gray-100 text-black"
              )}
            >
              {isPremium ? "프리미엄" : "무료"}
            </span>
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-tight text-black">
            {skill.title}
          </h1>

          <p className="mb-6 leading-relaxed text-gray-500">{skill.description}</p>

          {skill.tags && skill.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6 flex items-center gap-6 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-black text-black" />
              <span className="text-sm font-bold">{skill.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-400">
              ↓ {skill.downloads.toLocaleString()} 다운로드
            </span>
            <span className="text-sm text-gray-400">
              by {skill.profiles.username ?? "익명"}
            </span>
          </div>

          {user ? (
            <button
              onClick={handleDownload}
              disabled={isDownloading || !skill.file_url}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download size={16} />
              {isDownloading ? "다운로드 중..." : "다운로드"}
            </button>
          ) : (
            <Link
              href={`/auth/login?redirect=/skills/${skill.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              로그인 후 다운로드
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="mb-6 text-lg font-bold text-black">
            리뷰 ({reviews.length})
          </h2>

          {user && (
            <form onSubmit={handleReviewSubmit} className="mb-8 border-b border-gray-100 pb-8">
              <div className="mb-3 flex gap-1">
                {RATING_OPTIONS.map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                  >
                    <Star
                      size={20}
                      className={cn(
                        star <= reviewRating
                          ? "fill-black text-black"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="mb-3 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                placeholder="리뷰를 작성해주세요"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmittingReview ? "등록 중..." : "리뷰 등록"}
              </button>
            </form>
          )}

          {reviews.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              아직 리뷰가 없습니다
            </p>
          )}

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">
                      {review.profiles.username ?? "익명"}
                    </span>
                    <div className="flex gap-px">
                      {RATING_OPTIONS.map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={cn(
                            star <= review.rating
                              ? "fill-black text-black"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed text-gray-500">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
