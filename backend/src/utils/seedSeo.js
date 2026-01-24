const mongoose = require('mongoose');
const SeoMeta = require('../models/SeoMeta');
require('dotenv').config();

// Default SEO data for all pages
const defaultSeoData = [
    {
        pageName: 'home',
        pageTitle: 'Premium Roofing Services | Expert Roof Installation & Repair',
        metaDescription: 'Mainstreet Roofing offers expert roofing solutions with top-quality materials and craftsmanship. From installations to repairs, we ensure durability and customer satisfaction.',
        metaRobots: 'index, follow',
        ogTitle: 'Premium Roofing Services | Expert Roof Installation & Repair',
        ogDescription: 'Mainstreet Roofing offers expert roofing solutions with top-quality materials and craftsmanship. From installations to repairs, we ensure durability and customer satisfaction.',
        ogImage: '/assets/roofing-logo.png',
        canonicalUrl: 'https://yourdomain.com/',
    },
    {
        pageName: 'about',
        pageTitle: 'About Us | Mainstreet Roofing - Your Trusted Roofing Experts',
        metaDescription: 'Learn about Mainstreet Roofing, our experienced team, and our commitment to providing exceptional roofing services with quality materials and expert craftsmanship.',
        metaRobots: 'index, follow',
        ogTitle: 'About Us | Mainstreet Roofing - Your Trusted Roofing Experts',
        ogDescription: 'Learn about Mainstreet Roofing, our experienced team, and our commitment to providing exceptional roofing services with quality materials and expert craftsmanship.',
        ogImage: '/assets/roofing-logo.png',
        canonicalUrl: 'https://yourdomain.com/about',
    },
    {
        pageName: 'services',
        pageTitle: 'Our Services | Roofing Installation, Repair & Maintenance',
        metaDescription: 'Explore our comprehensive roofing services including new construction, reroofs, metal roofing, leak repair, and more. Professional solutions for residential and commercial projects.',
        metaRobots: 'index, follow',
        ogTitle: 'Our Services | Roofing Installation, Repair & Maintenance',
        ogDescription: 'Explore our comprehensive roofing services including new construction, reroofs, metal roofing, leak repair, and more. Professional solutions for residential and commercial projects.',
        ogImage: '/assets/roofing-logo.png',
        canonicalUrl: 'https://yourdomain.com/services',
    },
    {
        pageName: 'contact',
        pageTitle: 'Contact Us | Get a Free Roofing Quote Today',
        metaDescription: 'Contact Mainstreet Roofing for a free quote. Our expert team is ready to help with all your roofing needs. Call 604-720-4313 or fill out our contact form.',
        metaRobots: 'index, follow',
        ogTitle: 'Contact Us | Get a Free Roofing Quote Today',
        ogDescription: 'Contact Mainstreet Roofing for a free quote. Our expert team is ready to help with all your roofing needs. Call 604-720-4313 or fill out our contact form.',
        ogImage: '/assets/roofing-logo.png',
        canonicalUrl: 'https://yourdomain.com/contact',
    },
    {
        pageName: 'gallery',
        pageTitle: 'Gallery | Our Roofing Projects & Work Portfolio',
        metaDescription: 'View our portfolio of completed roofing projects. See the quality of our workmanship and the variety of roofing solutions we provide for residential and commercial clients.',
        metaRobots: 'index, follow',
        ogTitle: 'Gallery | Our Roofing Projects & Work Portfolio',
        ogDescription: 'View our portfolio of completed roofing projects. See the quality of our workmanship and the variety of roofing solutions we provide for residential and commercial clients.',
        ogImage: '/assets/roofing-logo.png',
        canonicalUrl: 'https://yourdomain.com/gallery',
    },
];

async function seedSeoData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing SEO data
        await SeoMeta.deleteMany({});
        console.log('Cleared existing SEO data');

        // Insert default SEO data
        await SeoMeta.insertMany(defaultSeoData);
        console.log('SEO data seeded successfully!');
        console.log(`Inserted ${defaultSeoData.length} SEO pages`);

        // Display inserted data
        const seoPages = await SeoMeta.find();
        console.log('\nSeeded SEO Pages:');
        seoPages.forEach(page => {
            console.log(`- ${page.pageName}: ${page.pageTitle}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding SEO data:', error);
        process.exit(1);
    }
}

// Run the seed function
seedSeoData();
