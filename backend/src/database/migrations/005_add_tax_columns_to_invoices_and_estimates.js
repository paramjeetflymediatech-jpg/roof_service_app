const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/mysql");
const { DataTypes } = require("sequelize");

async function runMigration() {
    const queryInterface = sequelize.getQueryInterface();

    console.log("Starting Migration: Adding tax columns to invoices and estimates...");

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

        const tables = ["invoices", "estimates"];
        const columnsToAdd = [
            { name: "apply_gst", type: DataTypes.BOOLEAN, defaultValue: true },
            { name: "apply_pst", type: DataTypes.BOOLEAN, defaultValue: false },
            { name: "provincial_tax_type", type: DataTypes.STRING, defaultValue: "PST" },
            { name: "provincial_tax_rate", type: DataTypes.DECIMAL(5, 2), defaultValue: 7.0 }
        ];

        for (const tableName of tables) {
            for (const column of columnsToAdd) {
                if (!(await checkColumnExists(tableName, column.name))) {
                    console.log(`Adding column ${tableName}.${column.name}...`);
                    await queryInterface.addColumn(tableName, column.name, {
                        type: column.type,
                        defaultValue: column.defaultValue,
                        allowNull: true
                    });
                    console.log(`✅ Added column ${tableName}.${column.name}`);
                } else {
                    console.log(`ℹ️ Column ${tableName}.${column.name} already exists, skipping.`);
                }
            }
        }

        console.log("✅ Tax columns migration completed successfully!");
    } catch (error) {
        console.error("❌ Tax columns migration failed:", error);
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
