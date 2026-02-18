<script setup lang="ts">
definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Welcome - OSMO',
  robots: 'noindex'
})
</script>

<template>
  <div class="relative min-h-screen bg-neutral-950 flex items-center justify-center overflow-hidden px-4">
    <!-- Decorative ghost cards (background) -->
    <div
      class="absolute inset-0 pointer-events-none select-none"
      aria-hidden="true"
    >
      <!-- Top-left card -->
      <div class="absolute top-[10%] left-[8%] w-48 h-64 rounded-2xl bg-neutral-900/40 border border-neutral-800/30 -rotate-6 blur-[1px]" />
      <!-- Top-right card -->
      <div class="absolute top-[8%] right-[10%] w-44 h-60 rounded-2xl bg-neutral-900/30 border border-neutral-800/20 rotate-3 blur-[1px]" />
      <!-- Bottom-left card -->
      <div class="absolute bottom-[12%] left-[12%] w-40 h-56 rounded-2xl bg-neutral-900/30 border border-neutral-800/20 rotate-6 blur-[1px]" />
      <!-- Bottom-right card -->
      <div class="absolute bottom-[10%] right-[8%] w-48 h-64 rounded-2xl bg-neutral-900/40 border border-neutral-800/30 -rotate-3 blur-[1px]" />
      <!-- Center-left card -->
      <div class="absolute top-[35%] left-[3%] w-36 h-52 rounded-2xl bg-neutral-900/20 border border-neutral-800/15 rotate-12 blur-[2px]" />
      <!-- Center-right card -->
      <div class="absolute top-[30%] right-[3%] w-36 h-52 rounded-2xl bg-neutral-900/20 border border-neutral-800/15 -rotate-12 blur-[2px]" />
    </div>

    <!-- Main content card -->
    <div class="relative z-10 w-full max-w-md text-center">
      <div class="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm p-8 sm:p-10 space-y-6">
        <!-- Unlocked badge -->
        <div class="flex justify-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <span class="size-1.5 rounded-full bg-green-400" />
            Unlocked
          </span>
        </div>

        <!-- Heading -->
        <h1 class="text-3xl sm:text-4xl font-serif text-white">
          You're in!
        </h1>

        <!-- Description -->
        <p class="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
          The OSMO Demo Vault is now unlocked. Browse a curated library of production-ready code snippets, UI components, animations, and design assets.
        </p>

        <!-- CTA Button -->
        <NuxtLink
          to="/vault"
          class="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-neutral-950 font-semibold text-sm transition-colors"
        >
          Enter the Vault
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </NuxtLink>

        <!-- Decorative "Try OSMO" element -->
        <p class="text-xs text-neutral-600 italic">
          Try OSMO
        </p>
      </div>
    </div>
  </div>
</template>
