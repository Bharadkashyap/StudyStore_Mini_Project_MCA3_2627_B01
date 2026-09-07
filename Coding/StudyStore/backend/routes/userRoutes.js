const express = require('express');
const router = express.Router();

const {
    sendRegisterOtp,
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    deleteUser
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
    res.send("User Route Working");
});

router.get("/profile", protect, getProfile);


router.post('/send-register-otp', sendRegisterOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get("/profile/:id", protect, getProfile);
router.put("/reset-password/:token", resetPassword);
router.put("/profile/:id", protect, updateProfile);


// ============================
// ADMIN - USER MANAGEMENT
// ============================

router.get(
    "/admin/users",
    protect,
    adminOnly,
    getAllUsers
);

router.get(
    "/admin/users/:id",
    protect,
    adminOnly,
    getUserById
);

router.put(
    "/admin/users/:id",
    protect,
    adminOnly,
    updateUserByAdmin
);

router.delete(
    "/admin/users/:id",
    protect,
    adminOnly,
    deleteUser
);


module.exports = router;