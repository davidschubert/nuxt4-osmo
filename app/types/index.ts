// Subscription status for user profiles
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due'

// Resource represents a single vault entry (code snippet, component, animation, etc.)
export interface Resource {
  $id: string
  $createdAt: string
  $updatedAt: string
  title: string
  slug: string
  description: string
  category: string // Category document ID
  tags: string[]
  thumbnailFileId: string // Storage file ID
  thumbnailUrl?: string // Resolved preview URL (client-side)
  isFree: boolean // true = free tier, false = premium
  isNew: boolean // "New" badge display
  htmlCode: string
  cssCode: string
  jsCode: string
  implementationNotes?: string // Markdown implementation docs
  externalScripts?: string[] // CDN URLs for external dependencies (e.g. gsap)
  previewUrl?: string // External preview URL
  originalSourceUrl?: string // Link to original source
  authorName?: string // Resource author
  authorAvatarUrl?: string // Author avatar
  sortOrder: number
}

// Category for sidebar navigation
export interface Category {
  $id: string
  name: string // "Buttons"
  slug: string // "buttons"
  icon: string // "i-lucide-mouse-pointer-click"
  sortOrder: number
}

// Computed category with resource count (not stored, computed client-side)
export interface CategoryWithCount extends Category {
  count: number
}

// User profile stored in Appwrite
export interface UserProfile {
  $id: string
  userId: string
  displayName: string
  email: string
  avatarUrl?: string
  subscriptionStatus: SubscriptionStatus
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscribedAt?: string
}

// Navigation item for sidebar menu
export interface SidebarNavItem {
  label: string
  icon: string
  to?: string
  badge?: string | number
  disabled?: boolean
  children?: SidebarNavItem[]
}

// Search result item
export interface SearchResult {
  id: string
  title: string
  description?: string
  to: string
  icon?: string
  category?: string
}

// Search result group
export interface SearchGroup {
  id: string
  label: string
  items: SearchResult[]
}
