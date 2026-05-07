const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5050;

app.get('/', (req, res) => {
  res.send('Welcome to Invoice Generator System');
});

const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

app.use('/user', userRoutes);
app.use('/client', clientRoutes);
app.use('/invoice', invoiceRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
