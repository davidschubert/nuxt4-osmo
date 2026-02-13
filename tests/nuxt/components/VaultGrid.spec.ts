import { describe, it, expect } from 'vitest'
import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime'
import { VaultGrid } from '#components'
import { mockResources } from '~/utils/mock-data'

// Stub components that crash in happy-dom
mockComponent('USkeleton', {
  props: ['class'],
  setup(props) {
    return () => h('div', { class: `skeleton-stub ${props.class || ''}` })
  }
})

mockComponent('VaultCard', {
  props: ['resource'],
  setup() {
    return () => h('div', { class: 'vault-card-stub' })
  }
})

describe('VaultGrid', () => {
  it('shows loading skeletons when loading', async () => {
    const wrapper = await mountSuspended(VaultGrid, {
      props: { resources: [], loading: true }
    })
    expect(wrapper.text()).not.toContain('No resources found')
    expect(wrapper.findAll('.skeleton-stub').length).toBeGreaterThan(0)
  })

  it('shows empty state when no resources and not loading', async () => {
    const wrapper = await mountSuspended(VaultGrid, {
      props: { resources: [], loading: false }
    })
    expect(wrapper.text()).toContain('No resources found')
    expect(wrapper.text()).toContain('Try adjusting your search')
  })

  it('renders correct number of resource items', async () => {
    const resources = mockResources.slice(0, 3)
    const wrapper = await mountSuspended(VaultGrid, {
      props: { resources, loading: false }
    })
    const items = wrapper.findAll('[role="listitem"]')
    expect(items).toHaveLength(3)
  })

  it('has correct ARIA roles on grid', async () => {
    const wrapper = await mountSuspended(VaultGrid, {
      props: { resources: mockResources.slice(0, 2), loading: false }
    })
    const list = wrapper.find('[role="list"]')
    expect(list.exists()).toBe(true)
    expect(list.attributes('aria-live')).toBe('polite')
  })
})
