const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },

        quantity: {
          type: Number,
          default: 1
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    // ===========================
    // SHIPPING ADDRESS
    // ===========================

    address: {

      name: String,

      phone: String,

      address: String,

      city: String,

      state: String,

      pincode: String

    },

    // ===========================
    // PAYMENT
    // ===========================

    paymentMethod: {
      type: String,
      enum: [
        "Cash On Delivery",
        "UPI",
        "Credit Card",
        "PayPal"
      ],
      default: "Cash On Delivery"
    },

    // ===========================
    // ORDER STATUS
    // ===========================

    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Pending","Paid","Failed","Refunded"], default: "Pending" },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paidAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ],
      default: "Pending"
    }

  },

  {
    timestamps: true
  }

);

module.exports = mongoose.model("Order", orderSchema);