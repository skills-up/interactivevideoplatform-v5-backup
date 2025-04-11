import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { SearchBar } from "@/components/search-bar"
import { siteConfig } from "@/config/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex">
            <SearchBar />
          </div>
          <nav className="flex items-center space-x-1">
              <UserNav />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

