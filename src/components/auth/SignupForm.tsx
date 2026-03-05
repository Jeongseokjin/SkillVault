"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";

export default function SignupForm() {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(formData: SignupFormData) {
    setIsSubmitting(true);
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
        },
      },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered")
          ? "이미 가입된 이메일입니다"
          : "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
      );
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 text-4xl">✉️</div>
        <h2 className="mb-2 text-xl font-bold text-black">이메일을 확인해주세요</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          입력하신 이메일로 인증 링크를 보냈습니다.
          <br />
          이메일을 확인하여 가입을 완료해주세요.
        </p>
        <Link
          href="/auth/login"
          className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          로그인 페이지로
        </Link>
      </div>
    );
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
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
          유저명
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          {...register("username")}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
          placeholder="유저명을 입력하세요"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
          placeholder="8자 이상 입력하세요"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
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
        {isSubmitting ? "가입 중..." : "회원가입"}
      </button>

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="font-semibold text-black hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
