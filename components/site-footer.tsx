import { Icons } from "@/components/icons"
import { siteConfig } from "@/config/site"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} Interactive Video Platform. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          {siteConfig.footerNav.map((item, index) => (
            <Link key={index} href={item.href} className="text-sm text-muted-foreground underline underline-offset-4">
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

