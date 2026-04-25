import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Fade in animation
export const fadeIn = (element, options = {}) => {
    const defaults = {
        duration: 0.8,
        opacity: 0,
        y: 30,
        ease: 'power3.out',
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Fade in with scroll trigger
export const fadeInScroll = (element, options = {}) => {
    const defaults = {
        duration: 0.8,
        opacity: 0,
        y: 50,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Stagger animation for multiple elements
export const staggerFadeIn = (elements, options = {}) => {
    const defaults = {
        duration: 0.6,
        opacity: 0,
        y: 30,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: elements,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(elements, { ...defaults, ...options });
};

// Scale animation
export const scaleIn = (element, options = {}) => {
    const defaults = {
        duration: 0.6,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Slide in from left
export const slideInLeft = (element, options = {}) => {
    const defaults = {
        duration: 0.8,
        x: -100,
        opacity: 0,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Slide in from right
export const slideInRight = (element, options = {}) => {
    const defaults = {
        duration: 0.8,
        x: 100,
        opacity: 0,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Text reveal animation
export const textReveal = (element, options = {}) => {
    const defaults = {
        duration: 1,
        y: 100,
        opacity: 0,
        ease: 'power4.out',
        stagger: 0.05,
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Counter animation
export const animateCounter = (element, endValue, options = {}) => {
    const defaults = {
        duration: 2,
        ease: 'power2.out',
    };

    const obj = { value: 0 };

    return gsap.to(obj, {
        ...defaults,
        ...options,
        value: endValue,
        onUpdate: () => {
            element.textContent = Math.round(obj.value).toLocaleString();
        },
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });
};

// Parallax effect
export const parallax = (element, options = {}) => {
    const defaults = {
        y: -100,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    };

    return gsap.to(element, { ...defaults, ...options });
};

// Rotate animation
export const rotateIn = (element, options = {}) => {
    const defaults = {
        duration: 0.8,
        rotation: 180,
        opacity: 0,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Cleanup function for ScrollTrigger
export const cleanupScrollTriggers = () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
