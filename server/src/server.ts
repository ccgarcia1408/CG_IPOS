import app from "./app";
import pool from "./config/db";
import logger from "./utils/logger";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info("Database connected successfully");
    connection.release();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", (error as Error).message);
    process.exit(1);
  }
};

startServer();