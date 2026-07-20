import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production configuration (Render + Aiven)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Aiven's free tier
      }
    }
  });
} else {
  // Local development configuration (XAMPP / Local MySQL)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
}

export default sequelize;