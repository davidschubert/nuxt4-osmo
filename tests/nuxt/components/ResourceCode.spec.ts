import { describe, it, expect } from 'vitest'
import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime'
import { ResourceCode } from '#components'
import { mockResourceCodes } from '~/utils/mock-data'

// Stub UButton to avoid NuxtLink rendering errors in test environment
mockComponent('UButton', {
  props: ['icon', 'label', 'variant', 'color', 'size'],
  setup(props) {
    return () => h('button', { class: 'u-button-stub' }, props.label || '')
  }
})

// res-1 code: has HTML, CSS, JS + external scripts
const fullCode = mockResourceCodes.find(c => c.resourceId === 'res-1')!
// res-2 code: has HTML, CSS but empty jsCode
const noJsCode = mockResourceCodes.find(c => c.resourceId === 'res-2')!

describe('ResourceCode', () => {
  it('renders all three code steps', async () => {
    const wrapper = await mountSuspended(ResourceCode, {
      props: { code: fullCode }
    })
    expect(wrapper.text()).toContain('Step 1: Add HTML')
    expect(wrapper.text()).toContain('Step 2: Add CSS')
    expect(wrapper.text()).toContain('Step 3: Add Javascript')
  })

  it('shows external scripts setup when provided', async () => {
    const wrapper = await mountSuspended(ResourceCode, {
      props: {
        code: fullCode,
        externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js']
      }
    })
    expect(wrapper.text()).toContain('Setup: External Scripts')
  })

  it('omits JS step when jsCode is empty', async () => {
    const wrapper = await mountSuspended(ResourceCode, {
      props: { code: noJsCode }
    })
    expect(wrapper.text()).toContain('Step 1: Add HTML')
    expect(wrapper.text()).toContain('Step 2: Add CSS')
    expect(wrapper.text()).not.toContain('Javascript')
  })

  it('shows language labels in header bars', async () => {
    const wrapper = await mountSuspended(ResourceCode, {
      props: { code: fullCode }
    })
    expect(wrapper.text()).toContain('HTML')
    expect(wrapper.text()).toContain('CSS')
    expect(wrapper.text()).toContain('Javascript')
  })

  it('does not show setup section when no external scripts', async () => {
    const wrapper = await mountSuspended(ResourceCode, {
      props: { code: fullCode }
    })
    expect(wrapper.text()).not.toContain('Setup: External Scripts')
  })
})
