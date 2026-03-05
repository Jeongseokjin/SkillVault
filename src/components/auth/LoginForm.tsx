"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginForm() {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(formData: LoginFormData) {
    setIsSubmitting(true);
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다"
          : "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
      );
      setIsSubmitting(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>

      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/auth/signup" className="font-semibold text-black hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
