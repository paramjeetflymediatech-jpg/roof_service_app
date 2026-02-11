const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/mysql");
const { DataTypes } = require("sequelize");

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();

  console.log("Starting DB Sync Migration...");

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

    // Helper to check if table exists
    const checkTableExists = async (tableName) => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (e) {
        return false;
      }
    };

    // 1. Rename 'categories' -> 'service_categories'
    if (await checkTableExists("categories")) {
      console.log("Renaming table 'categories' to 'service_categories'...");
      await queryInterface.renameTable("categories", "service_categories");
    }

    // 2. Rename 'gallery' -> 'galleries'
    if (await checkTableExists("gallery")) {
      const columnsToRename = [{ old: "imageUrl", new: "image_url" }];

      for (const col of columnsToRename) {
        if (await checkColumnExists("gallery", col.old)) {
          console.log(`Renaming gallery.${col.old} to gallery.${col.new}...`);
          await queryInterface.renameColumn("gallery", col.old, col.new);
        }
      }
      console.log("Renaming table 'gallery' to 'galleries'...");
      await queryInterface.renameTable("gallery", "galleries");
    }

    // 3. Sync 'services' table
    if (await checkTableExists("services")) {
      // is_featured
      const hasIsFeatured = await checkColumnExists("services", "is_featured");
      if (!hasIsFeatured) {
        // Check for camelCase version
        const hasIsFeaturedCamel = await checkColumnExists(
          "services",
          "isFeatured",
        );
        if (hasIsFeaturedCamel) {
          console.log(
            "Renaming services.isFeatured to services.is_featured...",
          );
          await queryInterface.renameColumn(
            "services",
            "isFeatured",
            "is_featured",
          );
        } else {
          console.log("Adding column services.is_featured...");
          await queryInterface.addColumn("services", "is_featured", {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          });
        }
      }

      // why_choose_us
      const hasWhyChooseUsSnake = await checkColumnExists(
        "services",
        "why_choose_us",
      );
      if (!hasWhyChooseUsSnake) {
        const hasWhyChooseUsCamel = await checkColumnExists(
          "services",
          "whyChooseUs",
        );
        if (hasWhyChooseUsCamel) {
          console.log(
            "Renaming services.whyChooseUs to services.why_choose_us...",
          );
          await queryInterface.renameColumn(
            "services",
            "whyChooseUs",
            "why_choose_us",
          );
        } else {
          // If neither exists, add snake_case version
          console.log("Adding column services.why_choose_us...");
          await queryInterface.addColumn("services", "why_choose_us", {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
          });
        }
      }
    }

    // 4. Sync 'leads' table
    if (await checkTableExists("leads")) {
      const columnsToRename = [
        { old: "clientImages", new: "client_images" },
        { old: "completionImages", new: "completion_images" },
      ];

      for (const col of columnsToRename) {
        if (await checkColumnExists("leads", col.old)) {
          console.log(`Renaming leads.${col.old} to leads.${col.new}...`);
          await queryInterface.renameColumn("leads", col.old, col.new);
        }
      }
    }

    // 5. Sync 'jobs' table
    if (await checkTableExists("jobs")) {
      const columnsToRename = [
        { old: "beforeImages", new: "before_images" },
        { old: "afterImages", new: "after_images" },
        { old: "materialsUsed", new: "materials_used" },
      ];

      for (const col of columnsToRename) {
        if (await checkColumnExists("jobs", col.old)) {
          console.log(`Renaming jobs.${col.old} to jobs.${col.new}...`);
          await queryInterface.renameColumn("jobs", col.old, col.new);
        }
      }
    }

    // 6. Sync 'users' table
    if (await checkTableExists("users")) {
      const columnsToRename = [
        { old: "resetPasswordExpire", new: "reset_password_expire" },
        { old: "resetPasswordToken", new: "reset_password_token" },
      ];

      for (const col of columnsToRename) {
        if (await checkColumnExists("users", col.old)) {
          console.log(`Renaming users.${col.old} to users.${col.new}...`);
          await queryInterface.renameColumn("users", col.old, col.new);
        }
      }
    }

    console.log("✅ Sync Migration completed successfully!");
  } catch (error) {
    console.error("❌ Sync Migration failed:", error);
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
