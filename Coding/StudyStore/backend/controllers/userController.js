const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/nodemailer");

// ============================
// PASSWORD VALIDATION
// ============================

const validatePassword = (password) => {

  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null;
};


// ============================
// OTP REGISTRATION
// ============================
const RegistrationOtp = require("../models/RegistrationOtp");

const sendRegisterOtp = async (req,res) => {
  try {
    const email=String(req.body.email||"").trim().toLowerCase();
    if(!email) return res.status(400).json({message:"Email is required"});
    if(await User.exists({email})) return res.status(400).json({message:"User already exists"});
    const otp=String(Math.floor(100000+Math.random()*900000));
    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");
    await RegistrationOtp.deleteMany({email});
    await RegistrationOtp.create({email,otpHash,expiresAt:new Date(Date.now()+10*60*1000)});
    await transporter.sendMail({from:process.env.EMAIL_USER,to:email,subject:"StudyStore Registration OTP",html:`<h2>Your StudyStore OTP</h2><p style="font-size:28px"><b>${otp}</b></p><p>Valid for 10 minutes.</p>`});
    res.json({message:"OTP sent to your email"});
  } catch(e){res.status(500).json({message:e.message})}
};

const registerUser = async (req,res) => {
 try {
  const {name,email,password,phone,address,city,state,pincode,otp}=req.body;
  const passwordError=validatePassword(password); if(passwordError)return res.status(400).json({message:passwordError});
  if(!name||!email||!phone||!address||!city||!state||!pincode||!otp)return res.status(400).json({message:"All registration fields and OTP are required"});
  if(!/^\d{10}$/.test(phone))return res.status(400).json({message:"Mobile number must be 10 digits"});
  if(!/^\d{6}$/.test(pincode))return res.status(400).json({message:"Pincode must be 6 digits"});
  const cleanEmail=email.trim().toLowerCase(); if(await User.exists({email:cleanEmail}))return res.status(400).json({message:"User already exists"});
  const otpHash=crypto.createHash("sha256").update(String(otp)).digest("hex");
  const rec=await RegistrationOtp.findOne({email:cleanEmail,otpHash,expiresAt:{$gt:new Date()}});if(!rec)return res.status(400).json({message:"Invalid or expired OTP"});
  const user=await User.create({name,email:cleanEmail,password:await bcrypt.hash(password,10),phone,address,city,state,pincode});
  await RegistrationOtp.deleteMany({email:cleanEmail});
  res.status(201).json({message:"Email verified and registration successful",user:{id:user._id,name:user.name,email:user.email}});
 } catch(e){res.status(500).json({message:e.message})}
};

// ============================
// LOGIN
// ============================

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    res.status(200).json({
      message: "Login Successful",
      token,
      userId: user._id,
      name: user.name,
      role: user.role
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

};


// ============================
// GET PROFILE
// ============================

const getProfile = async (req, res) => {

  try {

    const user = await User.findById(
      (req.params.id || req.user?.id)
    ).select("-password");


    if (!user) {

      return res.status(404).json({
        message: "User Not Found"
      });

    }


    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ============================
// UPDATE PROFILE
// ============================

const updateProfile = async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      (req.params.id || req.user?.id),
      req.body,
      { new: true }
    ).select("-password");


    res.json({
      message: "Profile Updated Successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ============================
// FORGOT PASSWORD
// ============================

const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;


    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "User Not Found"
      });

    }


    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");


    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;


    await user.save();


    const resetURL =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;


    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: user.email,

      subject: "StudyStore Password Reset",

      html: `
        <h2>Password Reset</h2>

        <p>Click the link below to reset your password:</p>

        <a href="${resetURL}">
          Reset Password
        </a>

        <br><br>

        <p>This link expires in 15 minutes.</p>
      `

    });


    res.json({
      message: "Reset Email Sent Successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

};


// ============================
// RESET PASSWORD
// ============================

const resetPassword = async (req, res) => {

  try {

    const { token } = req.params;
    const { password } = req.body;


    // Password validation
    const passwordError =
      validatePassword(password);


    if (passwordError) {
      return res.status(400).json({
        message: passwordError
      });
    }


    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    });


    if (!user) {

      return res.status(400).json({
        message: "Invalid or Expired Reset Link"
      });

    }


    const hashedPassword =
      await bcrypt.hash(password, 10);


    user.password = hashedPassword;

    user.resetPasswordToken = "";

    user.resetPasswordExpire = undefined;


    await user.save();


    res.json({
      message: "Password Reset Successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// ============================
// ADMIN - GET ALL USERS
// ============================

const getAllUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};


// ============================
// ADMIN - GET USER BY ID
// ============================

const getUserById = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User Not Found"
            });

        }

        res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};


// ============================
// ADMIN - UPDATE USER
// ============================

const updateUserByAdmin = async (req, res) => {

    try {

        const { name, email, phone, address, city, state, pincode, role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User Not Found"
            });

        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;
        user.address = address ?? user.address;
        user.city = city ?? user.city;
        user.state = state ?? user.state;
        user.pincode = pincode ?? user.pincode;
        user.role = role ?? user.role;

        await user.save();

        const updatedUser = await User.findById(req.params.id)
            .select("-password");

        res.status(200).json({
            message: "User Updated Successfully",
            user: updatedUser
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};


// ============================
// ADMIN - DELETE USER
// ============================

const deleteUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User Not Found"
            });

        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
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
};