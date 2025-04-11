import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { UITemplateProvider } from "@/components/ui-template-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { NextAuthProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "interactive video",
    "video platform",
    "interactive content",
    "video interactions",
    "educational videos",
    "engagement",
    "video marketing",
  ],
  authors: [
    {
      name: "Interactive Video Platform",
      url: siteConfig.url,
    },
  ],
  creator: "Interactive Video Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@interactivevideo",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <NextAuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UITemplateProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader/>
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
            </UITemplateProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
