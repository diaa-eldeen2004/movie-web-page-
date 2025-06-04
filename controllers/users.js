import User from "../models/user.js";


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the email is used by another user
    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail._id.toString() !== id) {
      return res.status(409).json({ message: "❌ Email is already taken." });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;


    // Password (no hashing here — let Mongoose pre-save middleware handle it)
    if (password && password.trim() !== "") {
      user.password = password.trim();
    }
    await user.save();
    res.status(200).json({ message: "✅ User updated successfully." });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "❌ Server error." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


