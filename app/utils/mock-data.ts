import type { Resource, Category, UserProfile } from '~/types'

// Mock categories matching OSMO Supply sidebar
export const mockCategories: Category[] = [
  {
    $id: 'cat-utilities',
    name: 'Utilities & Scripts',
    slug: 'utilities-scripts',
    icon: 'i-lucide-code',
    sortOrder: 1
  },
  {
    $id: 'cat-buttons',
    name: 'Buttons',
    slug: 'buttons',
    icon: 'i-lucide-mouse-pointer-click',
    sortOrder: 2
  },
  {
    $id: 'cat-scroll',
    name: 'Scroll Animations',
    slug: 'scroll-animations',
    icon: 'i-lucide-scroll',
    sortOrder: 3
  },
  {
    $id: 'cat-sliders',
    name: 'Sliders & Marquees',
    slug: 'sliders-marquees',
    icon: 'i-lucide-gallery-horizontal',
    sortOrder: 4
  },
  {
    $id: 'cat-video',
    name: 'Video & Audio',
    slug: 'video-audio',
    icon: 'i-lucide-play-circle',
    sortOrder: 5
  },
  {
    $id: 'cat-cursor',
    name: 'Cursor Animations',
    slug: 'cursor-animations',
    icon: 'i-lucide-pointer',
    sortOrder: 6
  },
  {
    $id: 'cat-text',
    name: 'Text Animations',
    slug: 'text-animations',
    icon: 'i-lucide-type',
    sortOrder: 7
  },
  {
    $id: 'cat-gimmicks',
    name: 'Gimmicks',
    slug: 'gimmicks',
    icon: 'i-lucide-sparkles',
    sortOrder: 8
  },
  {
    $id: 'cat-navigation',
    name: 'Navigation',
    slug: 'navigation',
    icon: 'i-lucide-menu',
    sortOrder: 9
  },
  {
    $id: 'cat-dropdowns',
    name: 'Dropdowns & Information',
    slug: 'dropdowns-information',
    icon: 'i-lucide-chevron-down',
    sortOrder: 10
  }
]

// Mock resources with realistic data inspired by OSMO Supply
export const mockResources: Resource[] = [
  {
    $id: 'res-1',
    $createdAt: '2025-12-16T10:00:00.000Z',
    $updatedAt: '2025-12-16T10:00:00.000Z',
    title: 'Elastic Pulse Button (Bouncy)',
    slug: 'elastic-pulse-button-bouncy',
    description: 'A bouncy elastic pulse button with hover animation using GSAP. Supports icon and text variants.',
    category: 'cat-buttons',
    tags: ['Button', 'Bounce', 'Hover', 'Animation', 'Elastic', 'Blob', 'Pulse'],
    thumbnailFileId: '',
    isFree: true,
    isNew: true,
    htmlCode: `<a data-elastic-pulse-btn="" href="#" class="elastic-pulse-btn">
  <div data-elastic-pulse-target="" class="elastic-pulse-btn__content">
    <div class="elastic-pulse-btn__icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none"><path d="M20.5 10.5H3.5V2"></path></svg>
    </div>
    <div class="elastic-pulse-btn__text">
      <span class="elastic-pulse-btn__span">Button with Icon</span>
    </div>
  </div>
</a>`,
    cssCode: `.elastic-pulse-btn {
  cursor: pointer;
  text-decoration: none;
  position: relative;
}

.elastic-pulse-btn__content {
  color: #fff;
  background-color: #ff8a4f;
  border-radius: 50em;
  justify-content: center;
  align-items: center;
  padding: .5em .75em;
  display: flex;
  position: relative;
}

.elastic-pulse-btn__icon {
  justify-content: center;
  align-items: center;
  width: 1.5em;
  height: 1.5em;
  padding: .25em;
  display: flex;
}

.elastic-pulse-btn__text {
  padding: .25em;
}

.elastic-pulse-btn__span {
  white-space: nowrap;
  font-size: 1em;
  font-weight: 500;
  line-height: 1.2;
  display: block;
}`,
    jsCode: `function initElasticPulseButton() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  document.querySelectorAll('[data-elastic-pulse-btn]').forEach(btn => {
    const target = btn.querySelector('[data-elastic-pulse-target]') || btn;
    let hoverLocked = false;

    btn.addEventListener('mouseenter', () => {
      if (hoverLocked) return;
      hoverLocked = true;
      setTimeout(() => { hoverLocked = false; }, 500);

      const el = target;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const stretch = 0.75 * fs;
      const sx = (w + stretch) / w;
      const sy = (h - stretch * 0.33) / h;

      if (el._pulseTl && el._pulseTl.kill) el._pulseTl.kill();
      el._pulseTl = gsap.timeline()
        .to(el, { scaleX: sx, scaleY: sy, duration: 0.1, ease: 'power1.out' })
        .to(el, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1, 0.3)' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initElasticPulseButton();
});`,
    implementationNotes: `## Container

Use \`[data-elastic-pulse-btn]\` to register the element as a pulse trigger that runs the animation on hover when a pointing device supports hover.

## Target

Use \`[data-elastic-pulse-target]\` on a child to pulse that child instead of the container, on default the container with \`[data-elastic-pulse-btn]\` is pulsed.

## Stretch

The pulse deformation is calculated dynamically from the element's font-size, giving it a proportional bounce that fits both small and large buttons.

## Lock

A hover lock prevents spam triggering by holding the effect for 500ms after it starts.`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    originalSourceUrl: 'https://osmo.supply',
    authorName: 'Dennis Snellenberg',
    sortOrder: 1
  },
  {
    $id: 'res-2',
    $createdAt: '2025-12-15T10:00:00.000Z',
    $updatedAt: '2025-12-15T10:00:00.000Z',
    title: 'Button with Slanted Reveal',
    slug: 'button-slanted-reveal',
    description: 'A button with a slanted background reveal effect on hover.',
    category: 'cat-buttons',
    tags: ['Button', 'Hover', 'Reveal', 'CSS', 'Transform'],
    thumbnailFileId: '',
    isFree: true,
    isNew: true,
    htmlCode: '<button class="slanted-btn"><span>Slanted Button</span></button>',
    cssCode: `.slanted-btn {
  position: relative;
  padding: 0.75em 1.5em;
  border: 2px solid #4A90D9;
  background: transparent;
  color: #4A90D9;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
}
.slanted-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: #4A90D9;
  transform: skewX(-15deg);
  transition: left 0.4s ease;
}
.slanted-btn:hover::before { left: 0; }
.slanted-btn span { position: relative; z-index: 1; }
.slanted-btn:hover { color: #fff; }`,
    jsCode: '',
    sortOrder: 2
  },
  {
    $id: 'res-3',
    $createdAt: '2025-12-14T10:00:00.000Z',
    $updatedAt: '2025-12-14T10:00:00.000Z',
    title: 'Tilting Bouncing Button',
    slug: 'tilting-bouncing-button',
    description: 'A button that tilts and bounces on hover using GSAP.',
    category: 'cat-buttons',
    tags: ['Button', 'Tilt', 'Bounce', 'GSAP', 'Hover'],
    thumbnailFileId: '',
    isFree: false,
    isNew: false,
    htmlCode: '<button class="tilt-btn">Bouncy Button</button>',
    cssCode: `.tilt-btn {
  padding: 0.75em 2em;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 50em;
  font-weight: 600;
  cursor: pointer;
}`,
    jsCode: `document.querySelectorAll('.tilt-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, { rotate: -3, scale: 1.05, duration: 0.2 });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { rotate: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,0.3)' });
  });
});`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 3
  },
  {
    $id: 'res-4',
    $createdAt: '2025-12-13T10:00:00.000Z',
    $updatedAt: '2025-12-13T10:00:00.000Z',
    title: 'Side by Side Page Transition',
    slug: 'side-by-side-page-transition',
    description: 'A smooth side-by-side page transition effect for multi-page websites.',
    category: 'cat-utilities',
    tags: ['Transition', 'Page', 'Animation', 'GSAP'],
    thumbnailFileId: '',
    isFree: true,
    isNew: true,
    htmlCode: '<div class="page-transition" data-transition></div>',
    cssCode: `.page-transition {
  position: fixed;
  inset: 0;
  background: #1a1a1a;
  z-index: 9999;
  transform: translateX(-100%);
}`,
    jsCode: `function pageTransition() {
  const tl = gsap.timeline();
  tl.to('[data-transition]', { translateX: '0%', duration: 0.5, ease: 'power2.inOut' })
    .to('[data-transition]', { translateX: '100%', duration: 0.5, ease: 'power2.inOut' }, '+=0.1');
  return tl;
}`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 4
  },
  {
    $id: 'res-5',
    $createdAt: '2025-12-12T10:00:00.000Z',
    $updatedAt: '2025-12-12T10:00:00.000Z',
    title: 'Page Name Transition (Wipe)',
    slug: 'page-name-transition-wipe',
    description: 'A wipe transition that reveals the page name during navigation.',
    category: 'cat-utilities',
    tags: ['Transition', 'Wipe', 'Page Name', 'GSAP'],
    thumbnailFileId: '',
    isFree: true,
    isNew: true,
    htmlCode: '<div class="wipe-transition"><span class="wipe-text">[ PAGE NAME ]</span></div>',
    cssCode: `.wipe-transition {
  position: fixed;
  inset: 0;
  background: #2d3436;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  clip-path: inset(0 100% 0 0);
}
.wipe-text {
  color: #fff;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 0.1em;
}`,
    jsCode: `function wipeTransition(pageName) {
  const el = document.querySelector('.wipe-transition');
  el.querySelector('.wipe-text').textContent = '[ ' + pageName + ' ]';
  return gsap.timeline()
    .to(el, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.inOut' })
    .to(el, { clipPath: 'inset(0 0 0 100%)', duration: 0.6, ease: 'power3.inOut' }, '+=0.3');
}`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 5
  },
  {
    $id: 'res-6',
    $createdAt: '2025-12-11T10:00:00.000Z',
    $updatedAt: '2025-12-11T10:00:00.000Z',
    title: 'Magnetic Hover Effect',
    slug: 'magnetic-hover-effect',
    description: 'Elements that magnetically follow the cursor on hover.',
    category: 'cat-cursor',
    tags: ['Cursor', 'Magnetic', 'Hover', 'GSAP', 'Interactive'],
    thumbnailFileId: '',
    isFree: false,
    isNew: false,
    htmlCode: '<button class="magnetic-btn" data-magnetic>Magnetic Effect</button>',
    cssCode: `.magnetic-btn {
  padding: 1em 2em;
  background: #a29bfe;
  color: #2d3436;
  border: none;
  border-radius: 50em;
  font-weight: 600;
  cursor: pointer;
}`,
    jsCode: `document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  });
});`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 6
  },
  {
    $id: 'res-7',
    $createdAt: '2025-12-10T10:00:00.000Z',
    $updatedAt: '2025-12-10T10:00:00.000Z',
    title: 'Line Reveal Testimonials',
    slug: 'line-reveal-testimonials',
    description: 'Testimonial cards with a line-by-line reveal animation on scroll.',
    category: 'cat-scroll',
    tags: ['Scroll', 'Reveal', 'Testimonials', 'GSAP', 'ScrollTrigger'],
    thumbnailFileId: '',
    isFree: true,
    isNew: false,
    htmlCode: `<div class="testimonial" data-reveal>
  <p class="testimonial__text">"After a rough quarter, we needed hands fast. Their team jumped in with clear pricing and flexible coverage for weekend rushes and under delays."</p>
  <div class="testimonial__author">
    <img src="/avatar.jpg" alt="Author" />
    <span>Jane Doe</span>
  </div>
</div>`,
    cssCode: `.testimonial {
  max-width: 480px;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 1rem;
}
.testimonial__text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #2d3436;
}
.testimonial__author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.testimonial__author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}`,
    jsCode: `gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('[data-reveal]').forEach(el => {
  gsap.from(el, {
    y: 40, opacity: 0, duration: 0.8,
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});`,
    externalScripts: [
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js'
    ],
    sortOrder: 7
  },
  {
    $id: 'res-8',
    $createdAt: '2025-12-09T10:00:00.000Z',
    $updatedAt: '2025-12-09T10:00:00.000Z',
    title: 'Mini Showreel Player',
    slug: 'mini-showreel-player',
    description: 'A compact video player component with custom play/pause controls.',
    category: 'cat-video',
    tags: ['Video', 'Player', 'Showreel', 'Custom Controls'],
    thumbnailFileId: '',
    isFree: true,
    isNew: false,
    htmlCode: `<div class="showreel">
  <video class="showreel__video" src="/showreel.mp4" muted loop></video>
  <button class="showreel__play" data-showreel-play>Play Showreel</button>
</div>`,
    cssCode: `.showreel {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  aspect-ratio: 16/9;
  background: #111;
}
.showreel__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.showreel__play {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5em 1em;
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  border-radius: 0.5em;
  cursor: pointer;
}`,
    jsCode: `document.querySelectorAll('[data-showreel-play]').forEach(btn => {
  const video = btn.closest('.showreel').querySelector('video');
  btn.addEventListener('click', () => {
    if (video.paused) { video.play(); btn.textContent = 'Pause'; }
    else { video.pause(); btn.textContent = 'Play Showreel'; }
  });
});`,
    sortOrder: 8
  },
  {
    $id: 'res-9',
    $createdAt: '2025-12-08T10:00:00.000Z',
    $updatedAt: '2025-12-08T10:00:00.000Z',
    title: 'Two-step Scaling Navigation',
    slug: 'two-step-scaling-navigation',
    description: 'A full-screen navigation menu with a two-step scaling animation.',
    category: 'cat-navigation',
    tags: ['Navigation', 'Menu', 'Scale', 'GSAP', 'Fullscreen'],
    thumbnailFileId: '',
    isFree: false,
    isNew: false,
    htmlCode: `<nav class="scaling-nav" data-scaling-nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Portfolio</a></li>
    <li><a href="#">About us</a></li>
    <li><a href="#">Services</a></li>
  </ul>
</nav>
<button class="nav-trigger" data-nav-trigger>&times;</button>`,
    cssCode: `.scaling-nav {
  position: fixed;
  inset: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0);
  border-radius: 50%;
  z-index: 100;
}
.scaling-nav ul { list-style: none; padding: 0; text-align: center; }
.scaling-nav li { margin: 1rem 0; }
.scaling-nav a { font-size: 2rem; color: #111; text-decoration: none; font-weight: 700; }`,
    jsCode: `const trigger = document.querySelector('[data-nav-trigger]');
const nav = document.querySelector('[data-scaling-nav]');
let isOpen = false;
trigger.addEventListener('click', () => {
  isOpen = !isOpen;
  gsap.to(nav, {
    scale: isOpen ? 1 : 0,
    borderRadius: isOpen ? '0%' : '50%',
    duration: 0.6,
    ease: 'power3.inOut'
  });
});`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 9
  },
  {
    $id: 'res-10',
    $createdAt: '2025-12-07T10:00:00.000Z',
    $updatedAt: '2025-12-07T10:00:00.000Z',
    title: 'Dropping Cards Stack',
    slug: 'dropping-cards-stack',
    description: 'Cards that drop and stack with a gravity-like animation.',
    category: 'cat-gimmicks',
    tags: ['Cards', 'Stack', 'Drop', 'Animation', 'GSAP'],
    thumbnailFileId: '',
    isFree: true,
    isNew: false,
    htmlCode: `<div class="card-stack">
  <div class="stack-card" data-stack-card>Branding & Identity.</div>
  <div class="stack-card" data-stack-card>Marketing.</div>
  <div class="stack-card" data-stack-card>Development.</div>
</div>`,
    cssCode: `.card-stack {
  position: relative;
  width: 300px;
  height: 200px;
}
.stack-card {
  position: absolute;
  width: 100%;
  padding: 2rem;
  background: #ffeaa7;
  border-radius: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}`,
    jsCode: `document.querySelectorAll('[data-stack-card]').forEach((card, i) => {
  gsap.from(card, {
    y: -200, rotation: gsap.utils.random(-15, 15),
    opacity: 0, duration: 0.6, delay: i * 0.15,
    ease: 'bounce.out'
  });
});`,
    externalScripts: ['https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'],
    sortOrder: 10
  }
]

// Mock user profile
export const mockUser: UserProfile = {
  $id: 'user-1',
  userId: 'user-1',
  displayName: 'David Schubert',
  email: 'mail@davidschubert.com',
  avatarUrl: undefined,
  subscriptionStatus: 'free',
  stripeCustomerId: undefined,
  stripeSubscriptionId: undefined,
  subscribedAt: undefined
}
