import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">
          회원가입
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          SkillVault 계정을 만들어보세요
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
