// src/router.d.ts — Vue Router meta type augmentation
// Ensures TypeScript knows about custom meta fields used in routes

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** If true, require a valid auth session to enter this route */
    requiresAuth?: boolean
    /** If true, redirect authenticated users away (login/register pages) */
    guestOnly?: boolean
    /** JWT role(s) required — user must have at least one */
    allowedRoles?: string[]
    /** Specific permission strings required — user must have ALL of them */
    permissions?: string[]
  }
}
