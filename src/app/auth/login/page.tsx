import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">
          로그인
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          SkillVault에 오신 것을 환영합니다
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
