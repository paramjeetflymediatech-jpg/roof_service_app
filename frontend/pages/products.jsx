import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import RoofingProducts from '@/components/RoofingProducts';

export default function ProductsPage() {
    return (
        <Layout>
            {/* Page Hero */}
            <section className="bg-gradient-to-br from-primary-700 to-accent-700 text-white py-24">
                <div className="container-custom text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Mainstreet Roofing Ltd Products
                    </motion.h1>
                    <motion.p
                        className="text-xl max-w-2xl mx-auto opacity-90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        We use only the highest quality materials from industry-leading manufacturers
                        to ensure your roof stands the test of time.
                    </motion.p>
                </div>
            </section>

            {/* Products Content */}
            <RoofingProducts />

            {/* Comparison or Info Section could go here */}
            <section className="py-20 bg-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Quality Materials Matter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-xl font-bold mb-2">Maximum Protection</h3>
                            <p className="text-gray-600">Superior resistance against UV rays, heavy rain, and high winds.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-4">💎</div>
                            <h3 className="text-xl font-bold mb-2">Aesthetic Appeal</h3>
                            <p className="text-gray-600">Wide variety of colors and textures to complement your home's architecture.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-4">📈</div>
                            <h3 className="text-xl font-bold mb-2">Long-Term Value</h3>
                            <p className="text-gray-600">High-grade materials increase property value and reduce maintenance costs.</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
