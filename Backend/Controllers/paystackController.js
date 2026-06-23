const axios = require("axios");
const crypto = require("crypto");
const Order = require("../Models/orderModel");
const Product = require("../Models/productModel");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const generateReference = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

const toKobo = (amountInNaira) => {
  return Math.round(Number(amountInNaira) * 100);
};

// calculate order from DB, not frontend price
const calculateOrderTotals = async (items) => {
  let orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (!product.isActive) {
      const error = new Error(`${product.title} is not available`);
      error.statusCode = 400;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${product.title}`);
      error.statusCode = 400;
      throw error;
    }

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });

    itemsPrice += product.price * item.quantity;
  }

  return { orderItems, itemsPrice };
};

// shared stock reducer
const reduceStockOnce = async (order) => {
  if (order.isStockReduced) return;

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found during stock update: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock while updating ${product.title}`);
    }

    product.stock -= item.quantity;
    await product.save();
  }

  order.isStockReduced = true;
};

// shared successful payment handler
const markOrderPaid = async (reference, paymentData) => {
  const order = await Order.findOne({ paystackReference: reference });

  if (!order) return null;

  // prevents double update and double stock reduction
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

// shared failed payment handler
const markOrderFailed = async (reference, paymentData) => {
  const order = await Order.findOne({ paystackReference: reference });

  if (!order) return null;

  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "failed";
  order.paymentDetails = paymentData;
  await order.save();

  return order;
};

// INIT PAYMENT
const initializePayment = async (req, res) => {
  try {
    const { items, shippingAddress, email } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    if (!shippingAddress || !email) {
      return res.status(400).json({
        success: false,
        message: "Email and shipping address are required",
      });
    }

    const { orderItems, itemsPrice } = await calculateOrderTotals(items);

    const shippingPrice = 0;
    const totalPrice = itemsPrice + shippingPrice;
    const reference = generateReference();

    const order = await Order.create({
      user: req.user ? req.user._id : null,
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalPrice,
      currency: "NGN",
      paymentMethod: "paystack",
      paymentStatus: "pending",
      orderStatus: "pending",
      paystackReference: reference,
    });

    const payload = {
      email,
      amount: String(toKobo(totalPrice)),
      currency: "NGN",
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`,
      metadata: {
        orderId: order._id.toString(),
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order._id.toString(),
          },
        ],
      },
    };

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    order.paystackAccessCode = data.data.access_code || "";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      "Initialize payment error:",
      error.response?.data || error.message,
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Unable to initialize payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required",
      });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paystackData = response.data.data;

    let order;

    if (paystackData.status === "success") {
      order = await markOrderPaid(reference, paystackData);
    } else if (paystackData.status === "failed") {
      order = await markOrderFailed(reference, paystackData);
    } else {
      order = await Order.findOne({ paystackReference: reference });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this reference",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verification completed",
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paystackStatus: paystackData.status,
      order,
    });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// WEBHOOK
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    if (!signature) {
      return res.status(401).json({ message: "Missing Paystack signature" });
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({ message: "Invalid Paystack signature" });
    }

    const event = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;

    if (event.event === "charge.success") {
      await markOrderPaid(event.data.reference, event.data);
    }

    if (event.event === "charge.failed") {
      await markOrderFailed(event.data.reference, event.data);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).json({ received: false });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
};
