---
name: gsap-vite
description: GSAP skill for React + Vite projects — complete setup, plugin registration in main.jsx, reusable hooks (useGSAPEntrance, useGSAPScrollReveal), HMR-safe patterns, and a step-by-step workflow for enhancing existing React + Vite projects with GSAP animations. Use when the user has a React + Vite project and wants to add or improve animations, UX, or UI motion with GSAP.
license: MIT
---

# GSAP with React + Vite

## When to Use This Skill

Apply when the user has an **existing React + Vite project** and wants to add, improve, or enhance animations and UX/UI motion with GSAP. This skill covers the full setup, registration patterns, reusable hooks, and a workflow for progressively enhancing any component.

**Related skills:** `gsap-react` for the useGSAP hook API; `gsap-scrolltrigger` for scroll animations; `gsap-plugins` for SplitText, Flip, Draggable, etc.; `gsap-core` for tweens and eases; `gsap-performance` for 60fps tips.

---

## 1. Installation

```bash
npm install gsap @gsap/react
```

For Club GSAP plugins (SplitText, ScrollSmoother, Flip, etc.) — install from the GSAP registry or copy into the project:

```bash
# Club GSAP (requires membership or local file)
npm install gsap@npm:@gsap/shockingly-green  # placeholder — use actual club package
```

---

## 2. Global Setup in `main.jsx`

Register **all plugins once** at app entry point. Never register inside a component that renders multiple times.

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { useGSAP } from '@gsap/react'

// Register all plugins once — tree-shaken by Vite automatically
gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Observer,
  useGSAP
)

// Optional: set global GSAP defaults for the whole app
gsap.defaults({ ease: 'power2.out', duration: 0.6 })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

> **Note on StrictMode:** React StrictMode double-invokes effects in dev. `useGSAP` handles this correctly — it reverts and re-runs. Do NOT use raw `useEffect` for GSAP in StrictMode projects without `gsap.context()` + `ctx.revert()`.

---

## 3. `vite.config.js`

Standard Vite config for React + GSAP — no special plugin needed for GSAP itself:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Optional: alias src for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

---

## 4. HMR-Safe Patterns (Hot Module Replacement)

In Vite's dev server, HMR re-runs modules without a full page reload. Without cleanup, GSAP tweens and ScrollTriggers **accumulate** on each HMR update. `useGSAP` handles this automatically because it reverts on unmount/re-run. When using `useEffect`, always return the cleanup:

```jsx
// ✅ Safe with HMR — useGSAP auto-reverts
useGSAP(() => {
  gsap.from('.card', { autoAlpha: 0, y: 30, stagger: 0.1 })
}, { scope: containerRef })

// ✅ Safe with HMR — useEffect with ctx.revert()
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.card', { autoAlpha: 0, y: 30, stagger: 0.1 })
  }, containerRef)
  return () => ctx.revert()
}, [])

// ❌ NOT safe — ScrollTriggers accumulate on every HMR update
useEffect(() => {
  gsap.to('.box', { x: 100, scrollTrigger: '.box' })
  // no cleanup → stale ScrollTriggers pile up in dev
}, [])
```

---

## 5. Reusable Hooks for Existing Projects

Drop these hooks into `src/hooks/` and use them in any component to progressively add animations.

### `useGSAPEntrance` — Fade + slide in on mount

```jsx
// src/hooks/useGSAPEntrance.js
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

/**
 * Fade + slide-in animation on component mount.
 * @param {Object} options - { y, opacity, duration, ease, delay, stagger }
 * @returns {{ ref }} — attach ref to the container element
 */
export function useGSAPEntrance({
  y = 30,
  opacity = 0,
  duration = 0.7,
  ease = 'power2.out',
  delay = 0,
  stagger = 0,
  selector = null, // if null, animates the container itself
} = {}) {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    const target = selector ? ref.current.querySelectorAll(selector) : ref.current
    gsap.from(target, { autoAlpha: opacity, y, duration, ease, delay, stagger })
  }, { scope: ref })

  return { ref }
}

// Usage in any component:
// const { ref } = useGSAPEntrance({ y: 40, stagger: 0.1, selector: '.card' })
// <section ref={ref}>...</section>
```

### `useGSAPScrollReveal` — Reveal elements on scroll

```jsx
// src/hooks/useGSAPScrollReveal.js
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Scroll-triggered reveal for elements inside a container.
 * @param {Object} options - { selector, y, stagger, start, once }
 * @returns {{ ref }} — attach ref to the container element
 */
export function useGSAPScrollReveal({
  selector = '.reveal',
  y = 40,
  stagger = 0.12,
  start = 'top 85%',
  once = true,
  ease = 'power2.out',
  duration = 0.7,
} = {}) {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    const elements = ref.current.querySelectorAll(selector)
    if (!elements.length) return

    gsap.from(elements, {
      autoAlpha: 0,
      y,
      duration,
      ease,
      stagger,
      scrollTrigger: {
        trigger: ref.current,
        start,
        once,
      },
    })
  }, { scope: ref })

  return { ref }
}

// Usage:
// const { ref } = useGSAPScrollReveal({ selector: '.feature-card' })
// <section ref={ref}>
//   <div className="feature-card">...</div>
//   <div className="feature-card">...</div>
// </section>
```

### `useGSAPParallax` — Parallax effect on scroll

```jsx
// src/hooks/useGSAPParallax.js
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Parallax scroll effect on an element.
 * @param {Object} options - { speed, axis }
 * @returns {{ ref }} — attach to the element to parallax
 */
export function useGSAPParallax({ speed = 0.3, axis = 'y' } = {}) {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    const distance = ref.current.offsetHeight * speed
    gsap.to(ref.current, {
      [axis]: axis === 'y' ? -distance : distance,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, { scope: ref })

  return { ref }
}
```

---

## 6. Workflow — Enhancing an Existing React + Vite Project

Follow these steps when you receive an existing project and need to add/improve GSAP animations:

### Step 1 — Audit the project
- Check `package.json` for existing animation libraries (framer-motion, react-spring, etc.)
- Identify pages/components that lack entrance animations, scroll animations, or transitions
- Note the router used (React Router, TanStack Router, etc.)

### Step 2 — Install and configure
```bash
npm install gsap @gsap/react
```
- Update `src/main.jsx` with global plugin registration (see section 2 above)
- Add `vite.config.js` if missing (see section 3)

### Step 3 — Add entrance animations to key components
Priority order: **Hero sections → Navigation → Cards/Grids → CTAs → Footer**

```jsx
// Before: static Hero component
function Hero() {
  return <section><h1>Title</h1><p>Subtitle</p></section>
}

// After: with GSAP entrance
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

function Hero() {
  const ref = useRef(null)
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('h1', { autoAlpha: 0, y: 60, duration: 1 })
      .from('p',  { autoAlpha: 0, y: 30, duration: 0.8 }, '-=0.5')
      .from('.cta', { autoAlpha: 0, scale: 0.9, duration: 0.6 }, '-=0.4')
  }, { scope: ref })
  return (
    <section ref={ref}>
      <h1>Title</h1>
      <p>Subtitle</p>
      <button className="cta">Get Started</button>
    </section>
  )
}
```

### Step 4 — Add scroll reveals to repeating elements
Use `useGSAPScrollReveal` hook (section 5) or add `.reveal` class to elements and use:

```jsx
ScrollTrigger.batch('.reveal', {
  onEnter: (elements) =>
    gsap.from(elements, { autoAlpha: 0, y: 40, stagger: 0.1, duration: 0.7 }),
  start: 'top 85%',
  once: true,
})
```

### Step 5 — Add page transition (React Router)
```jsx
// src/components/PageTransition.jsx
import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { useLocation } from 'react-router-dom'

export function PageTransition({ children }) {
  const ref = useRef(null)
  const location = useLocation()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { autoAlpha: 0, y: 20, duration: 0.4, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [location.pathname])

  return <div ref={ref}>{children}</div>
}
```

### Step 6 — Cleanup on route change (React Router + ScrollTrigger)
```jsx
// In your router layout or App.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useScrollTriggerCleanup() {
  const location = useLocation()
  useEffect(() => {
    // Kill all ScrollTriggers when navigating to avoid stale triggers
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [location.pathname])
}
```

---

## 7. Vite Tree-Shaking — Import Correctly

Always import plugins from their specific path so Vite tree-shakes unused code:

```js
// ✅ Correct — Vite tree-shakes each import separately
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'

// ❌ Wrong — imports everything, no tree-shaking
import gsap, { ScrollTrigger, Flip } from 'gsap'
```

---

## 8. Animation Checklist for Existing Projects

Use this checklist when improving UX/UI with GSAP on any React + Vite project:

- `[ ]` Hero section: entrance animation (fade + slide, staggered heading/subtitle/CTA)
- `[ ]` Navbar: scroll-based appearance (`autoAlpha`, background change on scroll)
- `[ ]` Cards / grid items: scroll reveal with stagger
- `[ ]` Images: parallax on scroll (`useGSAPParallax`)
- `[ ]` Text sections: reveal per line with SplitText (if Club GSAP)
- `[ ]` CTA buttons: hover micro-animation (`gsap.to` on mouseenter/mouseleave)
- `[ ]` Page transitions: fade in/out on route change
- `[ ]` Modals / drawers: entrance animation instead of instant show/hide
- `[ ]` Numbers / counters: animated count-up on scroll into view
- `[ ]` Footer: staggered entrance on scroll

---

## Best practices

- ✅ Register all plugins once in `main.jsx` — never inside components.
- ✅ Use `useGSAP` (from `@gsap/react`) instead of `useEffect` for GSAP — it handles StrictMode and HMR correctly.
- ✅ Always pass `scope: ref` to `useGSAP` — selectors like `.card` only match inside that component.
- ✅ Import plugins from `'gsap/PluginName'` for correct Vite tree-shaking.
- ✅ Use `gsap.timeline({ defaults: { ... } })` for sequenced hero/entrance animations.
- ✅ Clean up ScrollTriggers on route changes in SPAs.
- ✅ Use `once: true` in `ScrollTrigger` for entrance/reveal animations (don't replay on scroll back).

## Do Not

- ❌ Call `gsap.registerPlugin()` inside a React component — it runs on every render.
- ❌ Use selector strings without a `scope` in `useGSAP` — they can match elements in other components.
- ❌ Forget to return cleanup in `useEffect` if you use it for GSAP (always `ctx.revert()`).
- ❌ Animate `display`, `width`, `height`, `top`, `left` for shows/hides — use `autoAlpha` + transforms.
- ❌ Leave `markers: true` in ScrollTrigger for production builds.

### Learn More

- https://gsap.com/resources/React
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://vitejs.dev/guide/
