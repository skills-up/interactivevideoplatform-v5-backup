import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { SearchBar } from "@/components/search-bar"
import { siteConfig } from "@/config/site"
import type { Session } from "next-auth"

interface SiteHeaderProps {
  session: Session | null
}

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
            <SearchBar />
          </div>
          <nav className="flex items-center space-x-1">
            {session?.user ? (
              <UserNav user={session.user} />
            ) : (
              <>
                <Link href="/auth/login" className={buttonVariants({ variant: "ghost" })}>
                  Login
                </Link>
                <Link href="/auth/register" className={buttonVariants({ variant: "default" })}>
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

