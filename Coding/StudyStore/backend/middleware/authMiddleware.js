const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = decoded;

            next();

        } catch (error) {
            return res.status(401).json({
                message: "Not Authorized"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "No Token Provided"
        });
    }
};


// ============================
// ADMIN AUTHORIZATION
// ============================

const adminOnly = (req, res, next) => {

    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            message: "Admin Access Required"
        });
    }

};


// ============================
// CUSTOMER AUTHORIZATION
// ============================

const userOnly = (req, res, next) => {

    if (req.user && req.user.role === "user") {
        next();
    } else {
        return res.status(403).json({
            message: "Customer Access Required"
        });
    }

};


module.exports = {
    protect,
    adminOnly,
    userOnly
};