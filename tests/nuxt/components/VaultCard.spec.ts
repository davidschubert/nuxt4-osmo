import { describe, it, expect } from 'vitest'
import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime'
import { VaultCard } from '#components'
import { mockResources } from '~/utils/mock-data'

// Stub Nuxt UI components that use reka-ui primitives
mockComponent('UBadge', {
  props: ['color', 'variant', 'size'],
  setup(_, { slots }) {
    return () => h('span', { class: 'badge-stub' }, slots.default ? slots.default() : [])
  }
})

mockComponent('UIcon', {
  props: ['name'],
  setup() {
    return () => h('span', { class: 'icon-stub' })
  }
})

mockComponent('NuxtImg', {
  props: ['src', 'alt', 'loading', 'width', 'height'],
  setup() {
    return () => h('img', { class: 'nuxt-img-stub' })
  }
})

// Mock NuxtLink to render as <a> with slot content
mockComponent('NuxtLink', {
  props: ['to', 'class', 'ariaLabel'],
  setup(props, { slots, attrs }) {
    return () => h('a', {
      'href': props.to,
      'class': props.class,
      'aria-label': attrs['aria-label'] || props.ariaLabel
    }, slots.default ? slots.default() : [])
  }
})

// res-1: isFree=true, isNew=true (Elastic Pulse Button)
const freeNewResource = mockResources.find(r => r.$id === 'res-1')!
// res-3: isFree=false, isNew=false (Tilting Bouncing Button)
const premiumResource = mockResources.find(r => r.$id === 'res-3')!
// res-8: isFree=true, isNew=false (Mini Showreel Player)
const freeOldResource = mockResources.find(r => r.$id === 'res-8')!

describe('VaultCard', () => {
  it('renders resource title', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeNewResource }
    })
    expect(wrapper.text()).toContain('Elastic Pulse Button (Bouncy)')
  })

  it('shows New text for new resources', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeNewResource }
    })
    // The badge and sr-only span both contain "New"
    expect(wrapper.html()).toContain('New')
  })

  it('does not show New for old resources', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeOldResource }
    })
    expect(wrapper.text()).toContain('Mini Showreel Player')
    expect(wrapper.html()).not.toContain('New resource')
  })

  it('has link to correct vault resource page', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeNewResource }
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe(`/vault/${freeNewResource.slug}`)
  })

  it('shows premium lock sr-only text for premium resources', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: premiumResource }
    })
    expect(wrapper.html()).toContain('Premium resource, requires subscription')
  })

  it('does not show lock text for free resources', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeNewResource }
    })
    expect(wrapper.html()).not.toContain('Premium resource, requires subscription')
  })

  it('has aria-label attribute with title', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: freeNewResource }
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    const ariaLabel = link.attributes('aria-label')
    expect(ariaLabel).toContain('Elastic Pulse Button (Bouncy)')
    expect(ariaLabel).toContain('(New)')
  })

  it('aria-label includes premium locked info', async () => {
    const wrapper = await mountSuspended(VaultCard, {
      props: { resource: premiumResource }
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('aria-label')).toContain('Premium, locked')
  })
})
