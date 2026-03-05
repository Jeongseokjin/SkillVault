import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SkillVault - AI 스킬 마켓플레이스",
  description: "AI 스킬을 찾고, 만들고, 공유하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
