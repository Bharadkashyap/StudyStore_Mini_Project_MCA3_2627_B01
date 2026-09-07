const express = require("express");
const router = express.Router();

const {
  toggleWishlist,
  getWishlist,
  removeWishlist
} = require("../controllers/wishlistController");

const {
  protect,
  userOnly
} = require("../middleware/authMiddleware");

router.use(protect, userOnly);

router.post("/toggle", toggleWishlist);
router.get("/", getWishlist);
router.delete("/:id", removeWishlist);

module.exports = router;