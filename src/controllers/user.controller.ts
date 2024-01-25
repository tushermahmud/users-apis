import { Request, Response } from "express";
import User from "../modals/User";

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const userFound = await User.findOne({ email: userData.email });

    if (!userData?.username) {
      return res.status(400).json({ error: "Username is required!" });
    }

    if (!userData?.email) {
      return res.status(400).json({ error: "Email is required!" });
    }

    if (userFound) {
      return res.status(400).json({ error: "Email Already Exists!" });
    }
    const newUser = new User({
      username: userData.username,
      email: userData.email,
    });

    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const retrievedUser = await User.findOne({ _id: req.params.id });
    if (!retrievedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(retrievedUser);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
