require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const MYSQL = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'student_placement',
};

const sequelize = new Sequelize(MYSQL.database, MYSQL.user, MYSQL.password, {
  host: MYSQL.host,
  port: MYSQL.port,
  dialect: 'mysql',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementNotifierDB';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ MongoDB connected successfully');
};

const connectMySQL = async () => {
  // Create the database automatically if it does not exist
  const conn = await mysql.createConnection({
    host: MYSQL.host,
    port: MYSQL.port,
    user: MYSQL.user,
    password: MYSQL.password,
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${MYSQL.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();

  await sequelize.authenticate();
  await sequelize.sync();
  console.log('✅ MySQL connected successfully');
};

module.exports = { sequelize, connectMongo, connectMySQL };
