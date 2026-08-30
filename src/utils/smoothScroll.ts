import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Initialize GSAP smooth scrolling with ScrollSmoother.
 * Falls back to native-like behavior if ScrollSmoother is not available (free GSAP).
 */
export function initSmoothScroll(): ScrollSmoother | null {
  // ScrollSmoother is a premium plugin — if not available, we use a manual approach
  try {
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
    });
    return smoother;
  } catch {
    console.warn('[SmoothScroll] ScrollSmoother not available, using manual smooth scroll.');
    initManualSmoothScroll();
    return null;
  }
}

/**
 * Manual smooth scroll fallback using GSAP + native scroll events.
 */
function initManualSmoothScroll(): void {
  const wrapper = document.getElementById('smooth-wrapper')!;
  const content = document.getElementById('smooth-content')!;

  let scrollTarget = 0;
  let currentScroll = 0;
  const ease = 0.08;

  // Calculate max scroll
  const getMaxScroll = () => content.scrollHeight - window.innerHeight;

  // Handle wheel events
  wrapper.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    scrollTarget = Math.max(0, Math.min(scrollTarget + e.deltaY, getMaxScroll()));
  }, { passive: false });

  // Handle touch events for mobile
  let touchStart = 0;
  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    touchStart = e.touches[0].clientY;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e: TouchEvent) => {
    const touchDelta = touchStart - e.touches[0].clientY;
    touchStart = e.touches[0].clientY;
    scrollTarget = Math.max(0, Math.min(scrollTarget + touchDelta * 2, getMaxScroll()));
  }, { passive: true });

  // Animation loop
  const tick = () => {
    currentScroll += (scrollTarget - currentScroll) * ease;
    content.style.transform = `translateY(${-currentScroll}px)`;

    // Update ScrollTrigger with the virtual scroll position
    ScrollTrigger.update();
    requestAnimationFrame(tick);
  };

  // Configure ScrollTrigger to use our virtual scroll
  ScrollTrigger.scrollerProxy(wrapper, {
    scrollTop(value?: number) {
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

  // Handle resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

  ScrollTrigger.addEventListener('refresh', () => {
    scrollTarget = Math.min(scrollTarget, getMaxScroll());
  });

  requestAnimationFrame(tick);
  ScrollTrigger.refresh();
}
