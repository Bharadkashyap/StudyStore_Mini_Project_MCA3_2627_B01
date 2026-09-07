const router = require("express").Router();
const controller = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, controller.createRazorpayOrder);
router.post("/verify-payment", protect, controller.verifyRazorpayPayment);

module.exports = router;
