const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    address: {
      type: String,
      required: true
    },
    companyName: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
