import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServiceCard({ title, description, icon, features, index = 0 }) {
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: index * 0.1,
            },
        },
    };

    // Icon mapping
    const iconMap = {
        home: '🏠',
        building: '🏢',
        wrench: '🔧',
        hammer: '🔨',
        search: '🔍',
        water: '💧',
    };

    // Create URL-friendly slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const serviceUrl = `/services/${slug}`;

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -10 }}
            className="card card-hover p-8 group relative h-full flex flex-col"
        >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                >
                    {iconMap[icon] || '⭐'}
                </motion.div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{description}</p>

            {/* Features */}
            {features && features.length > 0 && (
                <ul className="space-y-2 mb-6">
                    {features.map((feature, idx) => (
                        <motion.li
                            key={idx}
                            className="flex items-center text-sm text-gray-700"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-accent-500 mr-2">✓</span>
                            {feature}
                        </motion.li>
                    ))}
                </ul>
            )}

            {/* Learn More Button */}
            <Link href={serviceUrl}>
                <motion.button
                    className="w-full btn btn-primary mt-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Learn More
                </motion.button>
            </Link>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500 rounded-xl transition-all duration-300 pointer-events-none" />
        </motion.div>
    );
}
