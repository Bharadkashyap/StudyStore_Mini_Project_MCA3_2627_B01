const Wishlist = require("../models/Wishlist");

// ============================
// TOGGLE WISHLIST
// CUSTOMER ONLY
// ============================

const toggleWishlist = async (req, res) => {
  try {
    const { product } = req.body;

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Customer Access Required",
      });
    }

    if (!product) {
      return res.status(400).json({
        message: "Product is required",
      });
    }

    const user = req.user.id;

    const existing = await Wishlist.findOne({
      user,
      product,
    });

    if (existing) {
      await existing.deleteOne();

      return res.json({
        message: "Removed from Wishlist",
        active: false,
        itemId: existing._id,
      });
    }

    const item = await Wishlist.create({
      user,
      product,
    });

    const populated = await item.populate("product");

    return res.status(201).json({
      message: "Added to Wishlist",
      active: true,
      item: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already in Wishlist",
        active: true,
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================
// GET MY WISHLIST
// CUSTOMER ONLY
// ============================

const getWishlist = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Customer Access Required",
      });
    }

    const items = await Wishlist.find({
      user: req.user.id,
    })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================
// REMOVE FROM MY WISHLIST
// CUSTOMER ONLY
// ============================

const removeWishlist = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Customer Access Required",
      });
    }

    const item = await Wishlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Wishlist item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Removed from Wishlist",
      active: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  toggleWishlist,
  getWishlist,
  removeWishlist,
};