require("dotenv").config();
const sequelize = require("./src/config/mysql");
const Gallery = require("./src/models/Gallery");

async function checkGallery() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const items = await Gallery.findAll({ limit: 5 });
    console.log("Gallery Items:", JSON.stringify(items, null, 2));
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
}

checkGallery();
