require("dotenv").config();
const { sequelize } = require("./src/models");

const syncDatabase = async () => {
  try {
    console.log("Syncing database...");
    await sequelize.sync();
    console.log("Database synced successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing database:", err);
    process.exit(1);
  }
};

syncDatabase();
