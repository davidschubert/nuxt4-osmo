export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'neutral'
    },

    // ── Card: flat, no ring in dark, thumbnail fills entire card ──
    card: {
      slots: {
        root: 'rounded-lg overflow-hidden',
        body: 'p-0'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-elevated border border-default'
          }
        }
      }
    },

    // ── Badge: moderate rounding, not pill-shaped ──
    badge: {
      slots: {
        base: 'rounded-md font-medium'
      }
    },

    // ── Modal: larger radius (OSMO account modal style) ──
    modal: {
      slots: {
        content: 'rounded-xl'
      }
    },

    // ── Button: moderate rounding ──
    button: {
      slots: {
        base: 'rounded-lg'
      }
    },

    // ── Dashboard: sidebar/navbar lighter than content (OSMO hierarchy) ──
    dashboardSidebar: {
      slots: {
        root: 'relative hidden lg:flex flex-col min-h-svh min-w-16 w-(--width) shrink-0 bg-muted'
      }
    },

    dashboardNavbar: {
      slots: {
        root: 'h-(--ui-header-height) shrink-0 flex items-center justify-between border-b border-default px-4 sm:px-6 gap-1.5 bg-muted'
      }
    }
  }
})
