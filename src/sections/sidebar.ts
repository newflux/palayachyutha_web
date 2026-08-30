/**
 * Fixed Right Sidebar — expand/collapse logic
 */
import gsap from 'gsap';

export function initSidebar(): void {
  const items = document.querySelectorAll<HTMLElement>('.sidebar-item');

  items.forEach((item) => {
    const toggle = item.querySelector('.sidebar-toggle') as HTMLButtonElement;
    const expand = item.querySelector('.sidebar-expand') as HTMLElement;
    if (!toggle || !expand) return;

    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      if (isOpen) {
        // Collapse
        gsap.to(expand, {
          maxHeight: 0,
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            item.classList.remove('open');
          },
        });
      } else {
        // Close any other open item first
        items.forEach((other) => {
          if (other !== item && other.classList.contains('open')) {
            const otherExpand = other.querySelector('.sidebar-expand') as HTMLElement;
            gsap.to(otherExpand, {
              maxHeight: 0,
              duration: 0.35,
              ease: 'power3.inOut',
              onComplete: () => {
                other.classList.remove('open');
              },
            });
          }
        });

        // Expand this item
        item.classList.add('open');

        // Measure natural height
        const inner = expand.querySelector('.sidebar-expand-inner') as HTMLElement;
        const naturalHeight = inner ? inner.offsetHeight : 200;

        gsap.fromTo(expand, {
          maxHeight: 0,
        }, {
          maxHeight: naturalHeight + 20,
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    });
  });
}
