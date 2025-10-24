const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }],
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'COD'], required: true },
  totalAmount: { type: Number, required: true },
  handlingFee: { type: Number, default: 0 },
  status: { type: String, enum: ['Placed', 'Confirmed', 'Dispatched', 'Delivered'], default: 'Placed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
    