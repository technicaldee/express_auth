const mongoose = require("mongoose");

// create user schema
const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ["user", "staff", "manager", "admin"],
      default: "user",
    },
    isTutor: {
      type: Boolean,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
