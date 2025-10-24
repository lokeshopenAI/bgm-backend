const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderEmails = async (order, user) => {
  const productList = order.products.map(p => `ProductID: ${p.productId}, Quantity: ${p.quantity}`).join('\n');

  const userEmailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your BGM Snacks Order Confirmation',
    text: `Dear ${user.name},\n\nYour order has been placed successfully.\n\nOrder Details:\n${productList}\nTotal: ₹${order.totalAmount + order.handlingFee}\nPayment Method: ${order.paymentMethod}\n\nThank you for shopping with BGM Snacks!`
  };

  const companyEmailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'New Order Received at BGM Snacks',
    text: `New order placed by:\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${order.address}\n\nOrder Items:\n${productList}\nPayment Method: ${order.paymentMethod}`
  };

  await transporter.sendMail(userEmailOptions);
  await transporter.sendMail(companyEmailOptions);
};

exports.placeOrder = async (req, res) => {
  const { products, address, paymentMethod, totalAmount, handlingFee = 0 } = req.body;
  const userId = req.user.id;

  try {
    const order = new Order({ userId, products, address, paymentMethod, totalAmount, handlingFee });
    await order.save();

    const user = await User.findById(userId);
    await sendOrderEmails(order, user);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId').populate('products.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};
