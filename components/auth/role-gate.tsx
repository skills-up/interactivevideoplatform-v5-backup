"use client"

import { useSession } from "next-auth/react"
import type { ReactNode } from "react"
import { type Permission, hasPermission } from "@/lib/auth/permissions"

interface RoleGateProps {
  children: ReactNode
  allowedRoles?: string[]
  requiredPermission?: Permission
  fallback?: ReactNode
}

export function RoleGate({ children, allowedRoles, requiredPermission, fallback = null }: RoleGateProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return fallback
  }

  const userRole = session.user.role as string

  // Check role if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return fallback
  }

  // Check permission if requiredPermission is provided
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return fallback
  }

  // User has the required role and permission
  return <>{children}</>
}

