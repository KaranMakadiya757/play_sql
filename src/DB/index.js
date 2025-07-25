import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Username
  process.env.DB_PASS, // Password
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: "mysql",
    logging: false, // set to true to see raw SQL queries
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected ✅");
  } catch (error) {
    console.error("MySQL connection error ❌", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };