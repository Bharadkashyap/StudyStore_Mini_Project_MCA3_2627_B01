const mongoose = require("mongoose");

const paymentAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  address: { name: String, phone: String, address: String, city: String, state: String, pincode: String },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: "" },
  totalAmount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },
  status: { type: String, enum: ["Created", "Paid", "Failed"], default: "Created" },
  finalOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null }
}, { timestamps: true });

module.exports = mongoose.model("PaymentAttempt", paymentAttemptSchema);
