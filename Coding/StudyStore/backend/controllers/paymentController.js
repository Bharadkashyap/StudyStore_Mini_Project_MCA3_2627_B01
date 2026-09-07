const crypto = require("crypto");
const Razorpay = require("razorpay");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const User = require("../models/User");
const PaymentAttempt = require("../models/PaymentAttempt");
const transporter = require("../config/nodemailer");
const { getDiscount } = require("./couponController");

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay API keys are missing in backend .env");
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const sendMail = async (to, subject, html) => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error("Payment email error:", error.message);
  }
};

const getCheckoutData = async (userId, couponInput) => {
  const items = await Cart.find({ user: userId }).populate("product");

  if (!items.length) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  let subtotal = 0;

  for (const item of items) {
    if (!item.product || item.quantity > item.product.stock) {
      const error = new Error(
        `Insufficient stock for ${item.product?.name || "product"}`
      );
      error.statusCode = 400;
      throw error;
    }

    subtotal += Number(item.product.price) * Number(item.quantity);
  }

  let discountAmount = 0;
  let couponCode = "";

  if (couponInput) {
    const code = String(couponInput).trim().toUpperCase();
    const coupon = await Coupon.findOne({
      code,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      const error = new Error("Invalid or expired coupon");
      error.statusCode = 400;
      throw error;
    }

    if (subtotal < coupon.minOrder) {
      const error = new Error(`Minimum order ₹${coupon.minOrder} required`);
      error.statusCode = 400;
      throw error;
    }

    discountAmount = getDiscount(coupon, subtotal);
    couponCode = coupon.code;
  }

  return {
    items,
    subtotal,
    discountAmount,
    couponCode,
    totalAmount: Math.max(0, subtotal - discountAmount),
  };
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { address, couponCode } = req.body;

    if (
      !address?.name ||
      !address?.phone ||
      !address?.address ||
      !address?.city ||
      !address?.state ||
      !address?.pincode
    ) {
      return res.status(400).json({ message: "Complete delivery address" });
    }

    const checkout = await getCheckoutData(req.user.id, couponCode);
    const amountInPaise = Math.round(checkout.totalAmount * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        message: "Razorpay payment amount must be at least ₹1",
      });
    }

    const razorpay = getRazorpayClient();
    const receipt = `studystore_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: String(req.user.id),
      },
    });

    const attempt = await PaymentAttempt.create({
      user: req.user.id,
      products: checkout.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      address,
      subtotal: checkout.subtotal,
      discountAmount: checkout.discountAmount,
      couponCode: checkout.couponCode,
      totalAmount: checkout.totalAmount,
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      attempt_id: attempt._id,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    const razorpayStatus = error?.statusCode || error?.status;
    if (razorpayStatus === 401) {
      return res.status(401).json({
        message: "Razorpay authentication failed. Check API keys.",
      });
    }

    if (error?.statusCode && error.statusCode !== 500) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to create Razorpay order",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      attempt_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (
      !attempt_id ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing Razorpay payment verification fields",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay secret is missing in backend .env",
      });
    }

    const attempt = await PaymentAttempt.findOne({
      _id: attempt_id,
      user: req.user.id,
    });

    if (!attempt) {
      return res.status(404).json({ message: "Payment attempt not found" });
    }

    if (attempt.status === "Paid" && attempt.finalOrder) {
      return res.json({
        success: true,
        message: "Payment already verified",
        orderId: attempt.finalOrder,
      });
    }

    if (attempt.razorpayOrderId !== razorpay_order_id) {
      attempt.status = "Failed";
      await attempt.save();
      return res.status(400).json({ message: "Razorpay order ID mismatch" });
    }

    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(message)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(String(razorpay_signature), "hex");

    const signatureMatches =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureMatches) {
      attempt.status = "Failed";
      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    for (const item of attempt.products) {
      const product = await Product.findById(item.product);

      if (!product || item.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name || "product"}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user.id,
      products: attempt.products,
      subtotal: attempt.subtotal,
      discountAmount: attempt.discountAmount,
      couponCode: attempt.couponCode,
      totalAmount: attempt.totalAmount,
      address: attempt.address,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });

    for (const item of attempt.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.deleteMany({ user: req.user.id });

    attempt.status = "Paid";
    attempt.razorpayPaymentId = razorpay_payment_id;
    attempt.razorpaySignature = razorpay_signature;
    attempt.finalOrder = order._id;
    await attempt.save();

    const user = await User.findById(req.user.id);
    if (user) {
      sendMail(
        user.email,
        "StudyStore - Payment Successful",
        `<h2>Payment Successful</h2><p>Hi ${user.name},</p><p>Your order <strong>#${order._id
          .toString()
          .slice(-6)}</strong> has been placed successfully.</p><p><strong>Total: ₹${order.totalAmount}</strong></p>`
      );
    }

    return res.json({
      success: true,
      message: "Payment verified and order placed",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};
