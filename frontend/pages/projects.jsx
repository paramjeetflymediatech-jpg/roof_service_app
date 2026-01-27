import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import FeaturedProjects from '@/components/FeaturedProjects';
import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
    try {
        const data = await getSeoData('projects');
        return {
            props: {
                seoData: data.success ? data.data : null,
            },
        };
    } catch (error) {
        console.error('Error fetching Projects SEO data:', error);
        return {
            props: {
                seoData: null,
            },
        };
    }
}

export default function ProjectsPage({ seoData }) {
    return (
        <Layout>
            <SeoHead pageName="projects" initialSeoData={seoData} />
            {/* Page Hero */}
            <section className="bg-gradient-to-br from-gray-900 to-primary-900 text-white py-24">
                <div className="container-custom text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Our Featured Projects
                    </motion.h1>
                    <motion.p
                        className="text-xl max-w-2xl mx-auto opacity-90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Explore our portfolio of residential and commercial roofing achievements.
                        Quality craftsmanship showcased in every detail.
                    </motion.p>
                </div>
            </section>

            {/* Projects Content */}
            <FeaturedProjects />

            {/* Experience Stats */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-gray-50 p-12 rounded-3xl">
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-1">1000+</div>
                            <div className="text-gray-600 font-medium">Roofs Installed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-accent-600 mb-1">500+</div>
                            <div className="text-gray-600 font-medium">Happy Families</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-1">100+</div>
                            <div className="text-gray-600 font-medium">Commercial Sites</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-accent-600 mb-1">5+</div>
                            <div className="text-gray-600 font-medium">Years Experience</div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
