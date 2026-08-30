import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initShowcase(): void {
  initStatementAnimation();
  initAccordion();
}

function initStatementAnimation(): void {
  const textEl = document.querySelector('.statement-text') as HTMLElement;
  if (!textEl) return;

  const text = textEl.textContent || '';
  const words = text.split(/\s+/).filter(Boolean);
  textEl.innerHTML = words
    .map((word) => `<span class="word-wrap"><span class="word">${word}</span></span>`)
    .join(' ');

  const style = document.createElement('style');
  style.textContent = `
    .word-wrap {
      display: inline-block;
      overflow: hidden;
      vertical-align: bottom;
      padding-bottom: 0.1em;
    }
    .word {
      display: inline-block;
      transform: translateY(110%);
    }
  `;
  document.head.appendChild(style);

  gsap.to('.statement-text .word', {
    y: 0,
    duration: 0.8,
    stagger: 0.025,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#showcase-statement',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.fromTo('.statement-badge', {
    opacity: 0,
    x: 20,
  }, {
    opacity: 1,
    x: 0,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#showcase-statement',
      start: 'top 50%',
      toggleActions: 'play none none reverse',
    },
  });

  gsap.fromTo('.statement-tag', {
    opacity: 0,
    y: -10,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#showcase-statement',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });
}

function initAccordion(): void {
  const items = document.querySelectorAll<HTMLElement>('.accordion-item');

  items.forEach((item) => {
    const toggle = item.querySelector('.accordion-toggle') as HTMLButtonElement;
    const expand = item.querySelector('.accordion-expand') as HTMLElement;
    const icon = item.querySelector('.accordion-icon') as HTMLElement;
    if (!toggle || !expand) return;

    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      if (isOpen) {
        // Collapse
        gsap.to(expand, {
          maxHeight: 0,
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            item.classList.remove('open');
            if (icon) icon.textContent = '( + )';
            ScrollTrigger.refresh();
          },
        });
      } else {
        // Close others
        items.forEach((other) => {
          if (other !== item && other.classList.contains('open')) {
            const otherExpand = other.querySelector('.accordion-expand') as HTMLElement;
            const otherIcon = other.querySelector('.accordion-icon') as HTMLElement;
            gsap.to(otherExpand, {
              maxHeight: 0,
              duration: 0.4,
              ease: 'power3.inOut',
              onComplete: () => {
                other.classList.remove('open');
                if (otherIcon) otherIcon.textContent = '( + )';
              },
            });
          }
        });

        // Expand this
        item.classList.add('open');
        if (icon) icon.textContent = '( - )';

        const inner = expand.querySelector('.accordion-expand-inner') as HTMLElement;
        const naturalHeight = inner ? inner.offsetHeight : 500;

        gsap.fromTo(expand, {
          maxHeight: 0,
        }, {
          maxHeight: naturalHeight + 40,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => ScrollTrigger.refresh(),
        });

        // Animate elements inside
        gsap.fromTo(expand.querySelectorAll('.preview-card'), {
          y: 20,
          opacity: 0,
          scale: 0.95
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.2,
          ease: 'power3.out'
        });
      }
    });
  });

  // Fade in the whole accordion area
  gsap.fromTo('.accordion-wrapper', {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#showcase-accordion',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });
}
