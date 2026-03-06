'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'
import { Avatar } from '@/components/ui'
import type { Profile } from '@/types'

const NAV_LINKS = [
  { label: '탐색', href: ROUTES.SKILLS },
] as const

const AUTH_NAV_LINKS = [
  { label: '탐색', href: ROUTES.SKILLS },
  { label: '업로드', href: ROUTES.SKILL_UPLOAD },
] as const

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile()
          return
        }
        setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return
      if (dropdownRef.current.contains(event.target as Node)) return
      setIsDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setProfile(null)
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push(ROUTES.HOME)
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const navLinks = profile ? AUTH_NAV_LINKS : NAV_LINKS

  return (
    <nav className="sticky top-0 z-[100] h-16 border-b border-border bg-white/95 backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent">
            <span className="text-sm text-white">⬡</span>
          </div>
          <span className="text-[17px] font-bold tracking-[-0.3px] text-text-primary">
            SkillVault
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-[#F5F5F5]"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href={ROUTES.ADMIN}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-[#F5F5F5]"
            >
              관리자
            </Link>
          )}

          {profile ? (
            <div ref={dropdownRef} className="relative ml-2">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center"
              >
                <Avatar
                  src={profile.avatar_url}
                  username={profile.username}
                  size="sm"
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-md"
                  >
                    <Link
                      href={ROUTES.MYPAGE}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-[#F5F5F5]"
                    >
                      <User size={14} />
                      마이페이지
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-[#F5F5F5]"
                    >
                      <LogOut size={14} />
                      로그아웃
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href={ROUTES.LOGIN}
                className="rounded-md border-[1.5px] border-accent px-4 py-1.5 text-sm font-semibold text-accent transition-all duration-150 hover:bg-accent hover:text-white"
              >
                로그인
              </Link>
              <Link
                href={ROUTES.SIGNUP}
                className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-[#F5F5F5] md:hidden"
          aria-label="메뉴"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-0 top-16 z-[99] flex flex-col bg-surface p-6 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-[#F5F5F5]"
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href={ROUTES.ADMIN}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-[#F5F5F5]"
                >
                  <Shield size={16} />
                  관리자
                </Link>
              )}
            </div>

            <div className="mt-auto border-t border-border pt-4">
              {profile ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href={ROUTES.MYPAGE}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-text-secondary"
                  >
                    <User size={16} />
                    마이페이지
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-text-secondary"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-md border-[1.5px] border-accent py-2.5 text-center text-sm font-semibold text-accent"
                  >
                    로그인
                  </Link>
                  <Link
                    href={ROUTES.SIGNUP}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-md bg-accent py-2.5 text-center text-sm font-semibold text-white"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
