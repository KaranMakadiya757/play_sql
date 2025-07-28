import sql from "mysql2/promise";
import { runSchema } from "./runSchema.js";

const pool = sql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("MySQL connected ✅");
    connection.release();
    await runSchema();
  } catch (error) {
    console.error("MySQL connection error ❌", error);
    process.exit(1);
  }
};

export { connectDB, pool };