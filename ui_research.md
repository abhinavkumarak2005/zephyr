# Zephyr Hackathon: UI & 3D Integration Research

This document collects the technical approach for building the Zephyr Hackathon landing page with a 3D Spline model, mimicking the highly interactive and motion-rich UI of [Sui Overflow](https://overflow.sui.io/).

## 1. 3D Model Integration (Spline + React)
**Target Model:** `https://prod.spline.design/QKjzhoN9XWLKyZQF/scene.splinecode`

Since our final frontend stack is **React + Vite**, the cleanest and most performant way to load this is using Spline's official React package.

- **Library:** `@splinetool/react-spline`
- **Why:** It drops seamlessly into React, automatically maintains all the cursor interactions and physics designed within the Spline editor, and handles canvas resizing perfectly.

**Implementation Concept:**
```jsx
import Spline from '@splinetool/react-spline';

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas in background */}
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/QKjzhoN9XWLKyZQF/scene.splinecode" />
      </div>
      
      {/* Glassmorphic UI overlays go here, sitting above the 3D layer */}
      <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
         <h1 className="text-white">Zephyr Hackathon</h1>
      </div>
    </div>
  );
}
```

## 2. Motion Graphics & Interactions (Sui Overflow Reference)

To achieve the exact fluid, premium feel of `overflow.sui.io`, we need a combination of smooth scrolling, scroll-triggered animations, and advanced CSS techniques.

### Core Animation Libraries Needed
1. **Smooth Scrolling (Lenis):**
   - The reference site uses Lenis for butter-smooth momentum scrolling (visible via `html.lenis` classes). 
   - **Action:** Integrate `@studio-freight/react-lenis` at the root of our React app. This makes parallax and scroll animations feel incredibly premium and weighty.
2. **Scroll-Driven Animations:**
   - We will use **Framer Motion** (standard in modern React) or **GSAP ScrollTrigger** to replicate the way elements fade in, slide, and scale as the user scrolls down the page.

### Key UI/UX Features to Replicate
- **Loader & Hero Reveal:** The reference site uses a loading screen that splits or fades away using advanced CSS `clip-path` properties to reveal the 3D scene underneath.
- **Fluid Typography (Scaling System):** Based on the CSS we pulled from their site, they use a dynamic sizing system where fonts and paddings scale perfectly with the screen width using `clamp()` functions, rather than jumping between arbitrary breakpoints.
- **Glassmorphism Layering:** UI elements (like cards and navbars) float over the 3D canvas with blurred backgrounds (`backdrop-filter: blur(12px)` and subtle borders), ensuring the 3D model is visible underneath without making the text unreadable.
- **Sticky / Pinned Sections:** Using `position: sticky` so that headings (e.g., "Problem Statements" or "Timeline") stay in place while the content scrolls past them.
- **Cursor Interactions:** Beyond the Spline model tracking the cursor, the HTML UI uses subtle hover states (like magnetic buttons or glowing borders) that react to mouse proximity.

## 3. Next Steps (When Ready to Proceed)
To execute this UI vision, we will need to install the following dependencies into the React project:
```bash
npm install @splinetool/react-spline @splinetool/runtime framer-motion @studio-freight/react-lenis
```

*Status: Research complete and documented. Holding for further instructions before implementing the React landing page.*
