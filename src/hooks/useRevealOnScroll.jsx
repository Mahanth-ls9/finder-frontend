// src/hooks/useRevealOnScroll.js
import { useEffect } from 'react';

export default function useRevealOnScroll(selector = '.reveal') {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // if user prefers reduced motion, just show elements
      document.querySelectorAll(selector).forEach(el => el.classList.add('reveal--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal--visible');
            observer.unobserve(e.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    document.querySelectorAll(selector).forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);
}
