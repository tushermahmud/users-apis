//import User from "../modals/User";
import { Request, Response } from "express";
import {Profile} from "../modals/Profile";
import { validationResult } from "express-validator";
import { isAdminRequest, sameUser } from "../helpers/helper";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const profile = await Profile.findOne({ user: user.id }).populate("user", [
      "name",
      "bio",
    ]);
    if (!profile) {
      return res.status(404).json({
        message: "there is no profile of this user",
      });
    }
    return res.json(profile);
  } catch (e) {
    res.status(400).json(e);
  }
};

export const createOrUpdateProfile = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  const { position, website, location, status, bio } = req.body;

  //build profile object
  const profileFields: {
    user: string;
    position?: string;
    website?: string;
    location?: string;
    status?: string;
    skills?: string[];
    bio?: string;
  } = {
    user: (req as any).user.id,
  };
  if (position) {
    profileFields.position = position;
  }
  if (website) {
    profileFields.website = website;
  }
  if (location) {
    profileFields.location = location;
  }
  if (status) {
    profileFields.status = status;
  }
  if (bio) {
    profileFields.bio = bio;
  }

  try {
    let profile = await Profile.findOne({ user: (req as any).user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: (req as any).user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }
    profile = new Profile(profileFields);

    await profile.save();
    return res.json(profile);
  } catch (e) {
    return res.status(500).json({
      error: "Server Error",
    });
  }
};

export const getAllProfile = async (req: Request, res: Response) => {
  try {
    const profiles = await Profile.find().populate("user", [
      "username",
      "email",
    ]);
    if (!profiles) {
      res.json({
        error: "no profile found",
      });
    }
    return res.json(profiles);
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
    });
  }
};

export const getProfileById = async (req: Request, res: Response) => {

    if (
    sameUser( (req as any).user.id.toString(), req.params.userId.toString() ) || isAdminRequest((req as any).user)
  ) {
    try {
      const profile = await Profile.findOne({
        user: req.params.userId,
      }).populate("user", ["username", "email"]);
      if (!profile) {
        res.json({
          error: "no profile found",
        });
      }
      return res.json(profile);
    } catch (error) {
      res.status(500).json({
        error: "Server Error",
      });
    }
  } else {
    return res.status(200).json({
      error: "You are not authorized to access this route!",
    });
  }
};
