const express = require('express');
const { placeOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const Product = require('../models/Product'); // Ensure this imports your product model

exports.placeOrder = async (req, res) => {
  // ...your existing code to get cart data from req.body...

  try {
    // Example expects products: [{ productId, quantity }]
    const productIds = req.body.products.map(p => p.productId);
    // Fetch products from database
    const productsInfo = await Product.find({ _id: { $in: productIds } });

    // Merge quantity into product info for email
    const emailProducts = productsInfo.map(prod => {
      const cartEntry = req.body.products.find(item => item.productId === prod._id.toString());
      return {
        name: prod.name,
        price: prod.price,
        quantity: cartEntry ? cartEntry.quantity : 1,
        description: prod.description
      };
    });

    // Compose product details text
    const productDetailsText = emailProducts.map(prod =>
      `• ${prod.name} x ${prod.quantity} = ₹${prod.price * prod.quantity}`
    ).join('\n');

    // Send email to user and owner with productDetailsText
    const userMailOptions = {
      to: req.user.email,
      subject: 'Your BGM Snacks Order Confirmation',
      text: `Your order has been placed!\n\nProducts:\n${productDetailsText}\n\nTotal: ₹${req.body.totalAmount}\n\nThank you for shopping with us.`
    };

    const ownerMailOptions = {
      to: process.env.OWNER_EMAIL, // Set this in your .env!
      subject: 'New Order on BGM Snacks!',
      text: `Order from ${req.user.name} (${req.user.email}):\n\nProducts:\n${productDetailsText}\n\nDelivery Address: ${req.body.address || "None"}\nTotal Paid: ₹${req.body.totalAmount}`
    };

    // Send emails using your transporter
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(ownerMailOptions);

    // ... Continue creating and saving order, sending response, etc.
    res.json({ message: "Order placed and emails sent successfully!" });

  } catch (err) {
    res.status(500).json({ message: 'Order failed', error: err.message });
  }
};


const router = express.Router();

router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, verifyAdmin, getOrders);
router.put('/:id', verifyToken, verifyAdmin, updateOrderStatus);

module.exports = router;
