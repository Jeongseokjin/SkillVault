"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  skillUploadSchema,
  ALLOWED_CATEGORIES,
  MAX_FILE_SIZE,
  type SkillUploadFormData,
} from "@/lib/validations/skill";

export default function SkillUploadPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [skillFile, setSkillFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const skillFileRef = useRef<HTMLInputElement>(null);
  const previewFileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillUploadFormData>({
    resolver: zodResolver(skillUploadSchema),
    defaultValues: { price: "free" },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login?redirect=/skills/upload");
    return null;
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;

    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }

  function removeTag(target: string) {
    setTags((prev) => prev.filter((tag) => tag !== target));
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setServerError("파일 크기는 10MB 이하여야 합니다");
      return;
    }

    setter(file);
  }

  async function uploadFile(file: File, bucket: string) {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  }

  async function onSubmit(formData: SkillUploadFormData) {
    setIsSubmitting(true);
    setServerError("");

    try {
      let fileUrl: string | null = null;
      let previewUrl: string | null = null;

      if (skillFile) {
        fileUrl = await uploadFile(skillFile, "skills");
      }

      if (previewFile) {
        previewUrl = await uploadFile(previewFile, "previews");
      }

      const { error } = await supabase.from("skills").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        tags: tags.length > 0 ? tags : null,
        author_id: user!.id,
        file_url: fileUrl,
        preview_url: previewUrl,
        status: "pending",
      });

      if (error) {
        setServerError("업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        setIsSubmitting(false);
        return;
      }

      router.push("/mypage");
    } catch {
      setServerError("파일 업로드 중 오류가 발생했습니다");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">
          스킬 업로드
        </h1>
        <p className="mb-10 text-sm text-gray-500">
          새로운 AI 스킬을 등록하세요. 관리자 승인 후 공개됩니다.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              제목
            </label>
            <input
              {...register("title")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="스킬 이름을 입력하세요"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="스킬에 대한 상세 설명을 입력하세요"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              카테고리
            </label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="">카테고리 선택</option>
              {ALLOWED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              태그
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="태그를 입력하고 엔터를 누르세요"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              가격
            </label>
            <div className="flex gap-3">
              {(["free", "premium"] as const).map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm has-[:checked]:border-black has-[:checked]:bg-gray-50"
                >
                  <input
                    type="radio"
                    value={option}
                    {...register("price")}
                    className="accent-black"
                  />
                  {option === "free" ? "무료" : "프리미엄"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              스킬 파일
            </label>
            <input
              ref={skillFileRef}
              type="file"
              onChange={(e) => handleFileChange(e, setSkillFile)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => skillFileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-sm text-gray-400 transition-colors hover:border-gray-400"
            >
              {skillFile ? (
                <span className="text-black">{skillFile.name}</span>
              ) : (
                <>
                  <Upload size={16} />
                  파일을 선택하세요 (최대 10MB)
                </>
              )}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              미리보기 이미지
            </label>
            <input
              ref={previewFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setPreviewFile)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => previewFileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-sm text-gray-400 transition-colors hover:border-gray-400"
            >
              {previewFile ? (
                <span className="text-black">{previewFile.name}</span>
              ) : (
                <>
                  <Plus size={16} />
                  미리보기 이미지 선택
                </>
              )}
            </button>
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "업로드 중..." : "스킬 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
