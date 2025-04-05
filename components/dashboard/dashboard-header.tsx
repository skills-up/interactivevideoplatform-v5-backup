import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/config/site"
import type { User } from "@/types/user"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <MobileNav items={siteConfig.dashboardNav} />
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Interactive Video</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}

