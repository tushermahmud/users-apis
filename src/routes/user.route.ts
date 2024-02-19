import express from "express";
import { activationAccount, createUser, forgetPassword, login, resetPassword } from "../controllers/user.controller";
import { check } from "express-validator";

const router = express.Router();

router.post(
  "/createUser",
  [
    check("email").notEmpty().isEmail().withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 6, max: 30 })
      .withMessage("Password must be between 6 and 30 characters"),
    check("username")
      .notEmpty()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    check("confirm_password")
      .notEmpty()
      .withMessage("Confirm password is required"),
  ],
  createUser
);

router.post(
  "/login",
  [
    check("email").notEmpty().isEmail().withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 6, max: 30 })
      .withMessage("Password must be between 6 and 30 characters"),
  ],
  login
);

router.post("/activation", activationAccount);

router.put(
  "/forgot-password",
  [
    check("email", "Email is empty!!").notEmpty(),
    check("email", "Invalid email!!").isEmail(),
  ],
  forgetPassword
);

router.put("/password/reset", resetPassword);




export default router;
