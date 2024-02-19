import authMiddleware from "../middleware/auth";
import express from "express";
import {
  createOrUpdateProfile,
  getAllProfile,
  getMyProfile,
  getProfileById,
} from "../controllers/profile.controller";
import { check } from "express-validator";
import isAdmin from "../middleware/isAdmin";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.post(
  "/",
  authMiddleware,
  [check("status", "status field is required").not().isEmpty()],
  createOrUpdateProfile
);
router.get("/all", authMiddleware, isAdmin, getAllProfile);
router.get("/:userId", authMiddleware, getProfileById);
export default router;
