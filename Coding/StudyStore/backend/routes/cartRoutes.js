const r = require("express").Router();
const c = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

r.use(protect);

r.post("/", (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Customer Access Required",
    });
  }
  next();
}, c.addToCart);

r.get("/", (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Customer Access Required",
    });
  }
  next();
}, c.getCartItems);

r.patch("/:id", (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Customer Access Required",
    });
  }
  next();
}, c.updateQuantity);

r.delete("/clear", (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Customer Access Required",
    });
  }
  next();
}, c.clearCart);

r.delete("/:id", (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({
      message: "Customer Access Required",
    });
  }
  next();
}, c.removeCartItem);

module.exports = r;