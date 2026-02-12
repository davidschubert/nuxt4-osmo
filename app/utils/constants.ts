// Appwrite configuration constants
// These IDs match the collections created via Appwrite CLI
export const APPWRITE = {
  DATABASE_ID: 'vault-db',
  COLLECTIONS: {
    RESOURCES: 'resources',
    RESOURCE_CODE: 'resource-code',
    CATEGORIES: 'categories',
    USER_PROFILES: 'user-profiles'
  },
  BUCKETS: {
    THUMBNAILS: 'thumbnails',
    ASSETS: 'assets'
  }
} as const

// Category definitions with icons (used for sidebar navigation)
// These match the OSMO Supply categories from the reference screenshots
export const CATEGORIES = [
  { slug: 'utilities-scripts', name: 'Utilities & Scripts', icon: 'i-lucide-code' },
  { slug: 'buttons', name: 'Buttons', icon: 'i-lucide-mouse-pointer-click' },
  { slug: 'scroll-animations', name: 'Scroll Animations', icon: 'i-lucide-scroll' },
  { slug: 'sliders-marquees', name: 'Sliders & Marquees', icon: 'i-lucide-gallery-horizontal' },
  { slug: 'video-audio', name: 'Video & Audio', icon: 'i-lucide-play-circle' },
  { slug: 'cursor-animations', name: 'Cursor Animations', icon: 'i-lucide-pointer' },
  { slug: 'text-animations', name: 'Text Animations', icon: 'i-lucide-type' },
  { slug: 'gimmicks', name: 'Gimmicks', icon: 'i-lucide-sparkles' },
  { slug: 'navigation', name: 'Navigation', icon: 'i-lucide-menu' },
  { slug: 'dropdowns-information', name: 'Dropdowns & Information', icon: 'i-lucide-chevron-down' }
] as const

// Extra sidebar navigation items (non-category)
export const SIDEBAR_EXTRA_ITEMS = [
  { slug: 'icons', name: 'Icons', icon: 'i-lucide-shapes', to: '/vault/icons' },
  { slug: 'learn', name: 'Learn', icon: 'i-lucide-book-open', to: '/vault/learn' },
  { slug: 'easings', name: 'Easings', icon: 'i-lucide-spline', to: '/vault/easings', disabled: true, badge: 'Soon' }
] as const

// App metadata
export const APP = {
  NAME: 'The Vault',
  DESCRIPTION: 'A curated library of code snippets, UI components, animations, and design assets.',
  URL: 'https://vault.example.com'
} as const
