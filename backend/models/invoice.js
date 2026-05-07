const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    items: [itemSchema],
    subTotal: {
      type: Number,
      default: 0
    },
    taxPercent: {
      type: Number,
      default: 18
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid'],
      default: 'draft'
    },
    dueDate: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function () {
  let subTotal = 0;

  this.items = this.items.map((item) => {
    item.amount = item.quantity * item.price;
    subTotal += item.amount;
    return item;
  });

  this.subTotal = subTotal;
  this.taxAmount = (subTotal * this.taxPercent) / 100;
  this.totalAmount = subTotal + this.taxAmount - this.discount;
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
