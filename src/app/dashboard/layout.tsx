'use client'

import { Camera, Home, Refrigerator, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { href: '/dashboard', label: '一覧', icon: Home },
  { href: '/scan', label: 'スキャン', icon: Camera },
  { href: '/settings', label: '設定', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* PC用トップナビ */}
      <header className="hidden border-b border-outline-variant/20 bg-surface md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary font-headline tracking-tighter text-xl">
            <Refrigerator className="size-6" strokeWidth={2.2} />
            <span>myFridge</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container editorial-shadow'
                      : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 pb-28 md:pb-0">{children}</main>

      {/* モバイル用ボトムナビ - Crisper Mint Design */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header rounded-t-[48px] shadow-[0_-20px_40px_rgba(0,54,41,0.05)] md:hidden">
        <div className="flex justify-around items-center px-4 py-4 mb-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === '/dashboard' && pathname.startsWith('/dashboard')) ||
              (href === '/scan' && pathname.startsWith('/scan')) ||
              (href === '/settings' && pathname.startsWith('/settings'))
            
            // Scan などの特定アイテムをピル状に強調する場合
            const isHighlight = href === '/scan';

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isHighlight && isActive 
                    ? 'bg-primary-container px-6 py-2 rounded-full text-on-primary-container' 
                    : isHighlight 
                    ? 'bg-surface-variant/50 px-6 py-2 rounded-full text-on-surface-variant'
                    : 'px-2 py-2 text-on-surface-variant'
                }`}
              >
                <Icon className={`size-5 ${isActive && !isHighlight ? 'text-primary' : ''}`} />
                <span className={`text-[10px] font-bold tracking-[1px] uppercase ${isActive && !isHighlight ? 'text-primary' : ''}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
