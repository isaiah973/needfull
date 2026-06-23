const Order = require("../Models/Order");
const Product = require("../Models/Product");

const reduceStockOnce = async (order) => {
  if (order.isStockReduced) return;

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    product.stock -= item.quantity;
    await product.save();
  }

  order.isStockReduced = true;
};

const updateOrderAfterPayment = async (reference, paymentData) => {
  const order = await Order.findOne({ paystackReference: reference });

  if (!order) {
    throw new Error("Order not found");
  }

  // ✅ idempotency (VERY IMPORTANT)
  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "paid";
  order.orderStatus = "processing";
  order.paidAt = new Date();
  order.paymentDetails = paymentData;

  await reduceStockOnce(order);

  await order.save();

  return order;
};

module.exports = {
  updateOrderAfterPayment,
};
