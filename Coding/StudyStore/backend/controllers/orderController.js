const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const transporter = require("../config/nodemailer");
const { getDiscount } = require("./couponController");

// =========================================================
// SEND EMAIL
// =========================================================

const mail = async (to, subject, html) => {
  try {
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    ) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error(
      "Email error:",
      error.message
    );
  }
};

// =========================================================
// CREATE ORDER
// =========================================================

exports.createOrder = async (req, res) => {
  try {
    const items = await Cart.find({
      user: req.user.id,
    }).populate("product");

    // -----------------------------------------------------
    // CART EMPTY
    // -----------------------------------------------------

    if (!items.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // -----------------------------------------------------
    // CALCULATE SUBTOTAL + CHECK STOCK
    // -----------------------------------------------------

    let subtotal = 0;

    for (const item of items) {
      if (
        !item.product ||
        item.quantity > item.product.stock
      ) {
        return res.status(400).json({
          message: `Insufficient stock for ${
            item.product?.name || "product"
          }`,
        });
      }

      subtotal +=
        Number(item.product.price) *
        Number(item.quantity);
    }

    // -----------------------------------------------------
    // COUPON
    // -----------------------------------------------------

    let discountAmount = 0;
    let couponCode = "";

    if (req.body.couponCode) {
      const code = String(
        req.body.couponCode
      )
        .trim()
        .toUpperCase();

      const coupon = await Coupon.findOne({
        code,
        active: true,
        expiresAt: {
          $gt: new Date(),
        },
      });

      if (!coupon) {
        return res.status(400).json({
          message:
            "Invalid or expired coupon",
        });
      }

      // Minimum order check
      if (subtotal < coupon.minOrder) {
        return res.status(400).json({
          message: `Minimum order ₹${coupon.minOrder} required`,
        });
      }

      // Calculate discount
      discountAmount = getDiscount(
        coupon,
        subtotal
      );

      couponCode = coupon.code;
    }

    // -----------------------------------------------------
    // FINAL TOTAL
    // -----------------------------------------------------

    const totalAmount = Math.max(
      0,
      subtotal - discountAmount
    );

    // -----------------------------------------------------
    // CREATE ORDER
    // -----------------------------------------------------

    const order = await Order.create({
      user: req.user.id,

      products: items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),

      subtotal,

      discountAmount,

      couponCode,

      totalAmount,

      address: req.body.address,

      paymentMethod:
        req.body.paymentMethod ||
        "Cash On Delivery",

      paymentStatus:
        req.body.paymentMethod === "PayPal"
          ? "Paid"
          : "Pending",

      paymentId:
        req.body.paymentId || "",

      paidAt:
        req.body.paymentMethod === "PayPal"
          ? new Date()
          : undefined,
    });

    // -----------------------------------------------------
    // REDUCE PRODUCT STOCK
    // -----------------------------------------------------

    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // -----------------------------------------------------
    // CLEAR CART
    // -----------------------------------------------------

    await Cart.deleteMany({
      user: req.user.id,
    });

    // -----------------------------------------------------
    // EMAIL
    // -----------------------------------------------------

    const user = await User.findById(
      req.user.id
    );

    if (user) {
      mail(
        user.email,
        "StudyStore - Order Confirmed",
        `
          <h2>Order Confirmed</h2>

          <p>
            Hi ${user.name},
          </p>

          <p>
            Your StudyStore order
            <strong>#${order._id
              .toString()
              .slice(-6)}</strong>
            has been placed successfully.
          </p>

          <p>
            Subtotal: ₹${subtotal}
          </p>

          ${
            discountAmount > 0
              ? `
                <p>
                  Coupon:
                  <strong>${couponCode}</strong>
                </p>

                <p>
                  Discount:
                  -₹${discountAmount}
                </p>
              `
              : ""
          }

          <p>
            <strong>
              Total: ₹${totalAmount}
            </strong>
          </p>
        `
      );
    }

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(201).json({
      message:
        "Order Placed Successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// GET MY ORDERS
// =========================================================

exports.getMyOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate(
        "products.product",
        "name price image"
      )
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// GET ALL ORDERS - ADMIN
// =========================================================

exports.getOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .populate(
        "products.product",
        "name price image"
      )
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// CANCEL ORDER
// =========================================================

exports.cancelOrder = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findOne({
        _id: req.params.id,
        user: req.user.id,
      }).populate("user");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customer can cancel only Pending / Confirmed
    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(order.status)
    ) {
      return res.status(400).json({
        message:
          "This order can no longer be cancelled",
      });
    }

    order.status = "Cancelled";

    order.cancelledAt = new Date();

    order.cancellationReason =
      req.body.reason ||
      "Cancelled by customer";

    // Refund PayPal payment
    if (
      order.paymentStatus === "Paid"
    ) {
      order.paymentStatus =
        "Refunded";
    }

    await order.save();

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    // Email
    if (order.user) {
      mail(
        order.user.email,
        "StudyStore - Order Cancelled",
        `
          <h2>Order Cancelled</h2>

          <p>
            Hi ${order.user.name},
          </p>

          <p>
            Your order
            <strong>
              #${order._id
                .toString()
                .slice(-6)}
            </strong>
            has been cancelled.
          </p>
        `
      );
    }

    res.json({
      message: "Order cancelled",
      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// ADMIN UPDATE ORDER STATUS
// =========================================================

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    const newStatus =
      req.body.status;

    if (
      !allowedStatuses.includes(
        newStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid status",
      });
    }

    const order =
      await Order.findById(
        req.params.id
      ).populate("user");

    if (!order) {
      return res.status(404).json({
        message:
          "Order Not Found",
      });
    }

    // -----------------------------------------------------
    // PREVENT STOCK RESTORING TWICE
    // -----------------------------------------------------

    const wasCancelled =
      order.status === "Cancelled";

    const isCancelled =
      newStatus === "Cancelled";

    // -----------------------------------------------------
    // UPDATE STATUS
    // -----------------------------------------------------

    order.status = newStatus;

    // COD becomes paid when delivered
    if (
      newStatus === "Delivered" &&
      order.paymentMethod ===
        "Cash On Delivery"
    ) {
      order.paymentStatus =
        "Paid";

      order.paidAt =
        new Date();
    }

    // -----------------------------------------------------
    // CANCELLED BY ADMIN
    // -----------------------------------------------------

    if (
      isCancelled &&
      !wasCancelled
    ) {
      order.cancelledAt =
        new Date();

      order.cancellationReason =
        req.body.reason ||
        "Cancelled by admin";

      if (
        order.paymentStatus ===
        "Paid"
      ) {
        order.paymentStatus =
          "Refunded";
      }

      // Restore stock
      for (
        const item of order.products
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        );
      }
    }

    await order.save();

    // -----------------------------------------------------
    // STATUS EMAIL
    // -----------------------------------------------------

    const subjects = {
      Confirmed:
        "Your StudyStore order is confirmed",

      Shipped:
        "Your StudyStore order has shipped",

      "Out for Delivery":
        "Your StudyStore order is out for delivery",

      Delivered:
        "Your StudyStore order was delivered",

      Cancelled:
        "Your StudyStore order was cancelled",
    };

    if (
      subjects[newStatus] &&
      order.user
    ) {
      mail(
        order.user.email,
        subjects[newStatus],
        `
          <h2>
            ${newStatus}
          </h2>

          <p>
            Hi ${order.user.name},
          </p>

          <p>
            Your order
            <strong>
              #${order._id
                .toString()
                .slice(-6)}
            </strong>
            status is now:
            <strong>
              ${newStatus}
            </strong>
          </p>
        `
      );
    }

    res.json({
      message:
        "Order Status Updated",
      order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};