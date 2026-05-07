const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Successfully connected to MongoDb');
});

db.on('error', (err) => {
  console.log('MongoDb connection error', err);
});

db.on('disconnected', () => {
  console.log('MongoDb disconnected');
});

module.exports = db;
