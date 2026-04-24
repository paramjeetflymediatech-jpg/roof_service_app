const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/mysql");
const { DataTypes } = require("sequelize");

async function runMigration() {
    const queryInterface = sequelize.getQueryInterface();

    console.log("Starting Migration: Adding images column to estimates...");

    try {
        // Helper to check if column exists
        const checkColumnExists = async (tableName, columnName) => {
            try {
                const description = await queryInterface.describeTable(tableName);
                return !!description[columnName];
            } catch (error) {
                console.warn(`Could not describe table ${tableName}: ${error.message}`);
                return false;
            }
        };

        const tableName = "estimates";
        const columnName = "images";

        if (!(await checkColumnExists(tableName, columnName))) {
            console.log(`Adding column ${tableName}.${columnName}...`);
            await queryInterface.addColumn(tableName, columnName, {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: null
            });
            console.log(`✅ Added column ${tableName}.${columnName}`);
        } else {
            console.log(`ℹ️ Column ${tableName}.${columnName} already exists, skipping.`);
        }

        console.log("✅ Images column migration completed successfully!");
    } catch (error) {
        console.error("❌ Images column migration failed:", error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run if executed directly
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;
