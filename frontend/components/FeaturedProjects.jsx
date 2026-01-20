import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion } from 'framer-motion';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FeaturedProjects() {
    const sectionRef = useRef(null);
    const projectsRef = useRef([]);
    const quoteRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Quote symbol animation
            gsap.from(quoteRef.current, {
                scrollTrigger: {
                    trigger: quoteRef.current,
                    start: 'top bottom',
                    end: 'top center',
                    scrub: 1,
                },
                opacity: 0,
                scale: 0.9,
                ease: 'none',
            });

            // Projects batch animation
            ScrollTrigger.batch(projectsRef.current, {
                onEnter: (batch) =>
                    gsap.to(batch, {
                        duration: 1.2,
                        opacity: 1,
                        y: 0,
                        stagger: { each: 0.2, grid: [1, 2] },
                        overwrite: true,
                    }),
                onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -150, overwrite: true }),
                onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.2, overwrite: true }),
                onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 150, overwrite: true }),
                start: 'top 85%',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const projects = [
        {
            id: 1,
            title: 'Modern Residential Roof',
            location: 'Seattle, WA',
            type: 'Asphalt Shingles',
            image: 'https://images.unsplash.com/photo-1590482161867-1ff8e3c97a6e?auto=format&fit=crop&w=2073&q=80',
            description: 'Complete roof replacement with premium architectural shingles.',
        },
        {
            id: 2,
            title: 'Commercial Building',
            location: 'Portland, OR',
            type: 'TPO Flat Roof',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2070&q=80',
            description: 'Large-scale commercial roofing project with energy-efficient materials.',
        },
        {
            id: 3,
            title: 'Historic Home Restoration',
            location: 'Vancouver, BC',
            type: 'Cedar Shake',
            image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=2074&q=80',
            description: 'Authentic cedar shake roof restoration maintaining original character.',
        },
        {
            id: 4,
            title: 'Solar Panel Installation',
            location: 'Tacoma, WA',
            type: 'Solar + Metal Roof',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072',
            description: 'Integrated solar panel system with standing seam metal roofing.',
        },
    ];

    return (
        <section ref={sectionRef} id="projects" className="relative py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            <div className="container-custom">
                {/* Quote Symbol */}
                <div ref={quoteRef} className="text-center mb-8">
                    <div className="text-[200px] md:text-[280px] font-serif text-primary-200 leading-none select-none">
                        &#8220;
                    </div>
                </div>

                {/* Section Title */}
                <div className="text-center mb-16 -mt-32">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        Excellence in Every Project
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto italic"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Transforming homes and buildings with quality craftsmanship
                    </motion.p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            ref={(el) => (projectsRef.current[index] = el)}
                            className="opacity-0 translate-y-32"
                        >
                            <motion.div
                                className="group relative h-[400px] rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Project Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                                    style={{ backgroundImage: `url('${project.image}')` }}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="inline-block px-3 py-1 bg-accent-600 text-white text-xs font-semibold rounded-full mb-3">
                                            {project.type}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                            {project.title}
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-2">📍 {project.location}</p>
                                        <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {project.description}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Hover Border Effect */}
                                <div className="absolute inset-0 border-4 border-transparent group-hover:border-accent-500 transition-all duration-300 rounded-2xl" />
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <motion.a
                        href="/contact"
                        className="btn btn-primary text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Your Project
                    </motion.a>
                </div>
            </div>
        </section>
    );
}
