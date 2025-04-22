import mongoose from 'mongoose';
import winston from 'winston';
import config from 'config';

export default async () => {
  const db = config.get('db');

  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    winston.info(`✅ Connected to ${db}`);
  } catch (err) {
    winston.error(`❌ Error connecting to ${db}:`, err.message);
    process.exit(1);
  }
};
