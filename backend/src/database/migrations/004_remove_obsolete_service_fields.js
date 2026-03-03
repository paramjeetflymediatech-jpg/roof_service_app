const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/mysql");
const { DataTypes } = require("sequelize");

async function runMigration() {
    const queryInterface = sequelize.getQueryInterface();

    console.log("Starting DB Schema Cleanup Migration...");

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

        const tableName = "services";
        const columnsToRemove = ["heading", "sub_heading", "sub_description"];

        for (const column of columnsToRemove) {
            if (await checkColumnExists(tableName, column)) {
                console.log(`Removing column ${tableName}.${column}...`);
                await queryInterface.removeColumn(tableName, column);
                console.log(`✅ Removed column ${tableName}.${column}`);
            } else {
                console.log(`ℹ️ Column ${tableName}.${column} does not exist, skipping.`);
            }
        }

        console.log("✅ Schema Cleanup Migration completed successfully!");
    } catch (error) {
        console.error("❌ Schema Cleanup Migration failed:", error);
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
