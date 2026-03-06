import { Github } from 'lucide-react'

const GITHUB_URL = 'https://github.com/Jeongseokjin/SkillVault'

export default function Footer() {
  return (
    <footer className="flex h-20 items-center justify-between border-t border-border px-6 md:px-12">
      <p className="text-[13px] text-text-tertiary">
        &copy; 2026 SkillVault. Made by Jeongseokjin
      </p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-tertiary transition-colors duration-150 hover:text-text-primary"
        aria-label="GitHub"
      >
        <Github size={18} />
      </a>
    </footer>
  )
}
