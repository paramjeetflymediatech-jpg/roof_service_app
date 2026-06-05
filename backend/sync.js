require('dotenv').config();
const { sequelize, User, Location } = require('./src/models');
const bcrypt = require('bcryptjs');

async function syncAndSeed() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced successfully!');

    // Seed locations
    // const locationCount = await Location.count();
    // if (locationCount === 0) {
    //   await Location.bulkCreate([
    //     {
    //       name: "Surrey",
    //       slug: "surrey",
    //       description: "Proudly serving Surrey with high-quality residential, commercial, and flat roofing solutions tailored to local climate needs.",
    //       image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop",
    //       neighborhoods: ["Cloverdale", "Guildford", "Fleetwood", "Newton", "South Surrey", "Whalley"]
    //     },
    //     {
    //       name: "Vancouver",
    //       slug: "vancouver",
    //       description: "Top-tier roofing installations and leak repair services across Vancouver's diverse residential and commercial properties.",
    //       image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=600&h=400&fit=crop",
    //       neighborhoods: ["Kitsilano", "Point Grey", "Downtown", "Mount Pleasant", "West End", "Yaletown"]
    //     },
    //     {
    //       name: "Burnaby",
    //       slug: "burnaby",
    //       description: "Reliable, durable roofing craftsmanship for homes, strata complexes, and businesses throughout Burnaby.",
    //       image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
    //       neighborhoods: ["Brentwood", "Metrotown", "Capitol Hill", "Edmonds", "Burnaby Heights"]
    //     },
    //     {
    //       name: "Richmond",
    //       slug: "richmond",
    //       description: "Specialized roofing services engineered to withstand Richmond's coastal winds and heavy rainfall.",
    //       image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    //       neighborhoods: ["Steveston", "Golden Village", "Brighouse", "Burkeville", "Shellmont"]
    //     },
    //     {
    //       name: "Coquitlam",
    //       slug: "coquitlam",
    //       description: "Local roofing specialists providing full reroofing, maintenance, and emergency repair services in Coquitlam.",
    //       image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    //       neighborhoods: ["Burke Mountain", "Coquitlam West", "Maillardville", "Westwood Plateau"]
    //     },
    //     {
    //       name: "Langley",
    //       slug: "langley",
    //       description: "Expert roofers dedicated to keeping Langley properties safe with industry-leading materials and warranties.",
    //       image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    //       neighborhoods: ["Walnut Grove", "Willoughby", "Brookswood", "Fort Langley", "Aldergrove"]
    //     },
    //     {
    //       name: "Delta",
    //       slug: "delta",
    //       description: "Quality residential and commercial roof replacement, inspections, and gutter repair services in Delta.",
    //       image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&h=400&fit=crop",
    //       neighborhoods: ["North Delta", "Ladner", "Tsawwassen"]
    //     },
    //     {
    //       name: "New Westminster",
    //       slug: "new-westminster",
    //       description: "Professional roofing solutions tailored for heritage homes and modern developments in New Westminster.",
    //       image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
    //       neighborhoods: ["Uptown", "Sapperton", "Queensborough", "Downtown New West"]
    //     },
    //     {
    //       name: "North Vancouver",
    //       slug: "north-vancouver",
    //       description: "Premium roofing systems engineered specifically for the North Shore's heavy snow and rainfall environments.",
    //       image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=600&h=400&fit=crop",
    //       neighborhoods: ["Lonsdale", "Lynn Valley", "Deep Cove", "Capilano Highlands"]
    //     },
    //     {
    //       name: "Abbotsford",
    //       slug: "abbotsford",
    //       description: "Complete commercial, residential, and agricultural roofing contractor services across Abbotsford.",
    //       image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&h=400&fit=crop",
    //       neighborhoods: ["Clearbrook", "Mill Lake", "Sumas Mountain", "Matsqui"]
    //     }
    //   ]);
    //   console.log('✅ Default locations seeded successfully!');
    // }

    // const adminCount = await User.count({ where: { email: 'admin@roofservice.com' } });
    // if (adminCount === 0) {
    //   // await User.destroy({ where: { email: 'admin@roofservice.com' } });
    //   // const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    //   await User.create({
    //     name: 'Super Admin',
    //     email: 'admin@roofservice.com',
    //     password: "Admin@1234",
    //     role: 'admin',
    //     phone: '1234567890',
    //     isActive: true
    //   });
    //   console.log('✅ Admin user created!');
    // } else {
    //   const admin = await User.findOne({ where: { email: 'admin@roofservice.com' } });
    //   admin.password = await bcrypt.hash('Admin@123', 10);
    //   await admin.save();
    //   console.log('✅ Admin user password fully reset to Admin@123');
    // }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncAndSeed();
