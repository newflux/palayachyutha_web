import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initResultsPanel(): void {
  const section = document.getElementById('results-panel');
  const pin = document.getElementById('results-pin');
  if (!section || !pin) return;

  const resultSlides = pin.querySelectorAll<HTMLElement>('.result-slide');
  const explanationSlides = pin.querySelectorAll<HTMLElement>('.explanation-slide');
  const dots = pin.querySelectorAll<HTMLElement>('.results-progress-dot');
  const counter = pin.querySelector('.results-counter');
  const totalResults = resultSlides.length;

  let currentIndex = 0;

  function swapTo(index: number): void {
    if (index === currentIndex) return;
    if (index < 0 || index >= totalResults) return;

    const oldIndex = currentIndex;
    currentIndex = index;

    // Animate out old slides
    gsap.to(resultSlides[oldIndex], {
      opacity: 0,
      y: -40,
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        resultSlides[oldIndex].classList.remove('active');
        resultSlides[oldIndex].style.transform = 'translateY(60px)';
      },
    });

    gsap.to(explanationSlides[oldIndex], {
      opacity: 0,
      y: -40,
      duration: 0.5,
      ease: 'power3.inOut',
      delay: 0.05,
      onComplete: () => {
        explanationSlides[oldIndex].classList.remove('active');
        explanationSlides[oldIndex].style.transform = 'translateY(60px)';
      },
    });

    // Animate in new slides
    resultSlides[index].classList.add('active');
    gsap.fromTo(resultSlides[index], {
      opacity: 0,
      y: 60,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.25,
    });

    explanationSlides[index].classList.add('active');
    gsap.fromTo(explanationSlides[index], {
      opacity: 0,
      y: 60,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.35,
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update counter
    if (counter) {
      counter.textContent = `0${index + 1} / 0${totalResults}`;
    }
  }

  // Pin the section and swap results on scroll progress
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${window.innerHeight}`,
    pin: pin,
    pinSpacing: true,
    scrub: false,
    onUpdate: (self) => {
      const progress = self.progress;
      const targetIndex = Math.min(
        Math.floor(progress * totalResults),
        totalResults - 1
      );
      swapTo(targetIndex);
    },
  });

  // Entrance animation for the whole section
  gsap.fromTo(pin, {
    opacity: 0,
  }, {
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
}
