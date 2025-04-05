// Define all possible permissions in the system
export enum Permission {
  // Video permissions
  VIEW_VIDEOS = "view:videos",
  CREATE_VIDEO = "create:video",
  EDIT_VIDEO = "edit:video",
  DELETE_VIDEO = "delete:video",

  // Series permissions
  VIEW_SERIES = "view:series",
  CREATE_SERIES = "create:series",
  EDIT_SERIES = "edit:series",
  DELETE_SERIES = "delete:series",

  // Comment permissions
  CREATE_COMMENT = "create:comment",
  EDIT_COMMENT = "edit:comment",
  DELETE_COMMENT = "delete:comment",
  MODERATE_COMMENTS = "moderate:comments",

  // User permissions
  VIEW_USERS = "view:users",
  EDIT_USER = "edit:user",
  DELETE_USER = "delete:user",

  // Analytics permissions
  VIEW_ANALYTICS = "view:analytics",

  // Payment permissions
  MANAGE_PAYMENTS = "manage:payments",

  // Admin permissions
  ADMIN_ACCESS = "admin:access",
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  viewer: [
    Permission.VIEW_VIDEOS,
    Permission.VIEW_SERIES,
    Permission.CREATE_COMMENT,
    Permission.EDIT_COMMENT, // Can edit their own comments
  ],

  creator: [
    // All viewer permissions
    Permission.VIEW_VIDEOS,
    Permission.VIEW_SERIES,
    Permission.CREATE_COMMENT,
    Permission.EDIT_COMMENT,
    // Creator-specific permissions
    Permission.CREATE_VIDEO,
    Permission.EDIT_VIDEO, // Can edit their own videos
    Permission.DELETE_VIDEO, // Can delete their own videos
    Permission.CREATE_SERIES,
    Permission.EDIT_SERIES, // Can edit their own series
    Permission.DELETE_SERIES, // Can delete their own series
    Permission.VIEW_ANALYTICS, // Can view analytics for their content
    Permission.MANAGE_PAYMENTS, // Can manage payment settings for their content
  ],

  admin: [
    // All permissions
    ...Object.values(Permission),
  ],
}
// Helper function to check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false
  }

  return ROLE_PERMISSIONS[role].includes(permission)
}

