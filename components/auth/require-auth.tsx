"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { type Permission, hasPermission } from "@/lib/auth/permissions"
import { Loader2 } from "lucide-react"

interface RequireAuthProps {
  children: ReactNode
  permission?: Permission
  fallback?: ReactNode
}

export function RequireAuth({ children, permission, fallback }: RequireAuthProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If authenticated but permission check is required
  if (status === "authenticated" && permission) {
    const userRole = session.user.role as string

    if (!hasPermission(userRole, permission)) {
      return (
        fallback || (
          <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this resource.</p>
          </div>
        )
      )
    }
  }

  // If authenticated and has permission (or no permission check required)
  if (status === "authenticated") {
    return <>{children}</>
  }

  // Default fallback while redirecting
  return null
}

