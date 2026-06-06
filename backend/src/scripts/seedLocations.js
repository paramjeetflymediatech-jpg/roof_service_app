'use strict';

// Load environment variables from .env before anything else
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { sequelize, Location } = require('../models');

const locationsData = [
  { name: "Abbotsford", slug: "abbotsford", description: "Proudly serving Abbotsford with top-tier roofing solutions." },
  { name: "Cultus Lake", slug: "cultus-lake", description: "Expert roofing services for properties in Cultus Lake." },
  { name: "Langley", slug: "langley", description: "Professional roofing contractor serving Langley and surrounding areas." },
  { name: "New Westminster", slug: "new-westminster", description: "Reliable roofing systems for heritage and modern homes in New Westminster." },
  { name: "Port Moody", slug: "port-moody", description: "High-quality residential and commercial roofing in Port Moody." },
  { name: "Maple Ridge", slug: "maple-ridge", description: "Durable, climate-resilient roofing solutions for Maple Ridge." },
  { name: "White Rock", slug: "white-rock", description: "Premium roofing installations and repair in White Rock." },
  { name: "Burnaby", slug: "burnaby", description: "Expert roofing craftsmanship for Burnaby homes and businesses." },
  { name: "Delta", slug: "delta", description: "Quality residential and commercial roofing services in Delta." },
  { name: "North Vancouver", slug: "north-vancouver", description: "Premium roofing engineered for North Vancouver's heavy rain and snow." },
  { name: "Richmond", slug: "richmond", description: "Coastal-grade roofing systems for Richmond properties." },
  { name: "Victoria", slug: "victoria", description: "Professional roofing services across Victoria, BC." },
  { name: "Chilliwack", slug: "chilliwack", description: "Durable roofing installations and repairs in Chilliwack." },
  { name: "Hope", slug: "hope", description: "Reliable roofing solutions for residential and commercial structures in Hope." },
  { name: "Mission", slug: "mission", description: "Quality roofing inspections, repairs, and installations in Mission." },
  { name: "Pitt Meadows", slug: "pitt-meadows", description: "Dedicated local roofing services in Pitt Meadows." },
  { name: "Squamish", slug: "squamish", description: "Heavy-weather proof roofing solutions for Squamish properties." },
  { name: "West Vancouver", slug: "west-vancouver", description: "High-end roofing systems for homes and estates in West Vancouver." },
  { name: "Coquitlam", slug: "coquitlam", description: "Top-rated roofing company serving Coquitlam and Tri-Cities." },
  { name: "Kelowna", slug: "kelowna", description: "Reliable residential and commercial roofing in Kelowna." },
  { name: "Nanaimo", slug: "nanaimo", description: "Expert roof repairs and installations in Nanaimo." },
  { name: "Port Coquitlam", slug: "port-coquitlam", description: "Local roofers serving Port Coquitlam." },
  { name: "Whistler, BC", slug: "whistler-bc", description: "Extreme-weather roofing installations in Whistler." }
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synced.');

    for (const loc of locationsData) {
      const [location, created] = await Location.findOrCreate({
        where: { slug: loc.slug },
        defaults: {
          name: loc.name,
          slug: loc.slug,
          description: loc.description,
          image: loc.image || null,
          neighborhoods: loc.neighborhoods || []
        }
      });

      if (created) {
        console.log(`✅ Created location: "${loc.name}" (slug: ${loc.slug})`);
      } else {
        console.log(`➡️  Location already exists: "${loc.name}"`);
      }
    }

    console.log('\n🎉 Location seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding locations:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
