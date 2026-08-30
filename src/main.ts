/**
 * NeuroSync — Brain Track Hackathon Results Page
 * Main entry point: initializes styles, GSAP, and all sections.
 */

// Styles
import './styles/index.css';
import './styles/hero.css';
import './styles/showcase.css';
import './styles/asciiCursor.css';
import './styles/sidebar.css';
import './styles/transition.css';

// GSAP
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Sections
import { initHero } from './sections/hero';
import { initAsciiCursor } from './sections/asciiCursor';
import { initShowcase } from './sections/showcase';
import { initSidebar } from './sections/sidebar';
import { initResultsPanel } from './sections/resultsPanel';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Boot the application.
 */
function init(): void {
  // Initialize sections
  initHero();
  // initAsciiCursor(); // Disabled to remove unwanted hover effect
  initShowcase();
  initSidebar();
  initResultsPanel();

  // Refresh ScrollTrigger after everything is set up
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

/**
 * Manual smooth scroll using GSAP + scrollerProxy.
 * This gives us buttery smooth scrolling without the premium ScrollSmoother plugin.
 */
function initManualSmoothScroll(): void {
  const wrapper = document.getElementById('smooth-wrapper')!;
  const content = document.getElementById('smooth-content')!;

  let scrollTarget = 0;
  let currentScroll = 0;
  const ease = 0.075;

  const getMaxScroll = (): number => {
    return Math.max(0, content.scrollHeight - window.innerHeight);
  };

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const maxScroll = getMaxScroll();
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        scrollTarget = Math.min(scrollTarget + 300, maxScroll);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        scrollTarget = Math.max(scrollTarget - 300, 0);
        break;
      case 'Home':
        e.preventDefault();
        scrollTarget = 0;
        break;
      case 'End':
        e.preventDefault();
        scrollTarget = maxScroll;
        break;
      case ' ':
        e.preventDefault();
        scrollTarget = Math.min(scrollTarget + window.innerHeight * 0.8, maxScroll);
        break;
    }
  });

  // Wheel
  wrapper.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    const maxScroll = getMaxScroll();
    scrollTarget = Math.max(0, Math.min(scrollTarget + e.deltaY, maxScroll));
  }, { passive: false });

  // Touch
  let touchStartY = 0;
  let touchVelocity = 0;
  let lastTouchY = 0;
  let lastTouchTime = 0;

  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
    lastTouchY = touchStartY;
    lastTouchTime = Date.now();
    touchVelocity = 0;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e: TouchEvent) => {
    const y = e.touches[0].clientY;
    const delta = lastTouchY - y;
    const now = Date.now();
    const dt = now - lastTouchTime;

    if (dt > 0) {
      touchVelocity = delta / dt * 16;
    }

    lastTouchY = y;
    lastTouchTime = now;

    const maxScroll = getMaxScroll();
    scrollTarget = Math.max(0, Math.min(scrollTarget + delta * 1.5, maxScroll));
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    // Apply momentum
    const maxScroll = getMaxScroll();
    scrollTarget = Math.max(0, Math.min(scrollTarget + touchVelocity * 10, maxScroll));
  }, { passive: true });

  // Animation loop
  const tick = (): void => {
    const diff = scrollTarget - currentScroll;
    currentScroll += diff * ease;

    // Snap when very close
    if (Math.abs(diff) < 0.5) {
      currentScroll = scrollTarget;
    }

    content.style.transform = `translate3d(0, ${-currentScroll}px, 0)`;
    ScrollTrigger.update();
    requestAnimationFrame(tick);
  };

  // ScrollTrigger proxy
  ScrollTrigger.scrollerProxy(wrapper, {
    scrollTop(value?: number): number {
      if (arguments.length && value !== undefined) {
        scrollTarget = value;
        currentScroll = value;
      }
      return currentScroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: 'transform',
  });

  ScrollTrigger.defaults({ scroller: wrapper });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    const maxScroll = getMaxScroll();
    scrollTarget = Math.min(scrollTarget, maxScroll);
    currentScroll = Math.min(currentScroll, maxScroll);
    ScrollTrigger.refresh();
  });

  ScrollTrigger.addEventListener('refresh', () => {
    const maxScroll = getMaxScroll();
    scrollTarget = Math.min(scrollTarget, maxScroll);
  });

  requestAnimationFrame(tick);
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
