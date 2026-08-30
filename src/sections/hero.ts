import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize Hero section animations.
 * Staggered entrance for team name, tag, tagline, and peripheral elements.
 */
export function initHero(): void {
  // ── Live clock ──────────────────────────────────────────
  const timeEl = document.getElementById('footer-time');
  if (timeEl) {
    const updateClock = (): void => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}:${ss}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ── Entrance timeline ───────────────────────────────────
  const tl = gsap.timeline({ delay: 0.3 });

  // Headline lines stagger in
  tl.to('.headline-line', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out',
  });

  // Tag above headline
  tl.fromTo('.hero-tag', {
    opacity: 0,
    y: -15,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.8');

  // Right section
  tl.fromTo('.hero-right', {
    opacity: 0,
    x: 40,
  }, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.7');

  // Footer bar
  tl.fromTo('.hero-footer', {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.4');

  // Header
  tl.fromTo('.hero-header', {
    opacity: 0,
    y: -20,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.8');

  // ── Scroll: footer shatters into ASCII noise ──
  const footerContent = document.querySelector('.footer-content');
  if (footerContent) {
    // We need to wrap every text node character in a span for individual animation
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(footerContent, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue?.trim() !== '') {
        textNodes.push(node);
      }
    }

    const chars: HTMLElement[] = [];
    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue || '';
      const fragment = document.createDocumentFragment();
      for (const char of text) {
        if (char === ' ' || char === '\n') {
          fragment.appendChild(document.createTextNode(char));
        } else {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          span.style.transition = 'none'; // GSAP will control
          
          // Pre-calculate random scatter targets
          span.dataset.rx = String((Math.random() - 0.5) * 600);
          span.dataset.ry = String((Math.random() - 1.0) * 300); // mostly up
          span.dataset.rot = String((Math.random() - 0.5) * 360);
          
          chars.push(span);
          fragment.appendChild(span);
        }
      }
      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    ScrollTrigger.create({
      trigger: '#showcase-section',
      start: 'top bottom',
      end: 'top 40%',
      scrub: 0.2, // bit snappier scrub
      onUpdate: (self) => {
        const p = self.progress;
        // Apply scatter to each character
        for (let i = 0; i < chars.length; i++) {
          const span = chars[i];
          // Easing for nonlinear shatter
          const easeProgress = p < 0.2 ? 0 : Math.pow((p - 0.2) / 0.8, 2); 
          
          if (easeProgress === 0) {
            span.style.transform = 'translate(0, 0) rotate(0)';
            span.style.opacity = '1';
          } else {
            const rx = parseFloat(span.dataset.rx || '0') * easeProgress;
            const ry = parseFloat(span.dataset.ry || '0') * easeProgress;
            const rot = parseFloat(span.dataset.rot || '0') * easeProgress;
            span.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg)`;
            span.style.opacity = String(1 - (easeProgress * 0.9)); // fade out a bit at end
          }
        }
      }
    });
  }
}
