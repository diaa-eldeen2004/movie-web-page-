import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sendEmail from "../utilities/emailService.js";
import { generateVerificationEmail } from "../utilities/emailtemplates.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

const cookieOptions = {
  httpOnly: true,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  sameSite: "lax", // important!
  secure: false, // only true when using HTTPS
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    if (await UserModel.findOne({ email })) {
      return res.status(409).json({ message: "Email is already taken" });
    }

    const userId = new mongoose.Types.ObjectId();
    const newUser = new UserModel({
      _id: userId,
      name,
      email,
      password,
      profileImage: "/images/default-profile.png", // fallback image
      userid: userId.toString(),
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString(), newUser.role);
    // Check if there's already a JWT cookie (e.g., for admin user) and only set a token for the new user if no token exists
    if (!req.cookies.jwt) {
      // If there's no JWT token in the cookies, set a new token for the new user
      res.cookie("jwt", token, cookieOptions);
    } else {
      // If there's already a JWT token (e.g., admin logged in), don't overwrite it
      console.log("JWT token already exists, not overwriting it.");
    }

    console.log("🎉 New user created:", newUser);

    const htmlContent = generateVerificationEmail(newUser.name, newUser._id);

    sendEmail({
      to: email,
      subject: "Verify your email!",
      text: `Hello ${name}, please verify your email by clicking this link: http://localhost:3000/api/auth/verify/${newUser._id}`, // this will show if the user do not support html email
      html: htmlContent,
    });

    // ✅ This part was missing
    res.status(201).json({
      message: "Signed up successfully!",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Error during signup:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const token = generateToken(user._id, user.role);
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt", cookieOptions);
  res.redirect("/");
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with that email." });
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let verificationCode = "";
    for (let i = 0; i < 6; i++) {
      verificationCode += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    user.resetPasswordCode = verificationCode;
    user.resetPasswordCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    });

    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("❌ Error during forgot password:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Inside auth.js controller
export const resetPassword = async (req, res) => {
  const { code, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ resetPasswordCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (
      !user.resetPasswordCodeExpires ||
      user.resetPasswordCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Code has expired." });
    }

    // Check if the newPassword is provided
    if (!newPassword) {
      return res.status(400).json({ message: "Password is required." });
    }

    // Set the new password directly (without hashing)
    user.password = newPassword;

    // Clear the reset code and expiry
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpires = null;

    // Save the updated user object
    await user.save();

    res.status(200).json({ message: "Password successfully updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

