import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-auth-token"] as string | undefined;
  if (!token) {
    return res.status(401).json({
      error: "No token found!",
    });
  }
  try {
    if (!process.env.MY_SECRET_KEY) {
      throw new Error("Secret key is undefined");
    }
    const decoded = jwt.verify(token, process.env.MY_SECRET_KEY) as any;
    if (decoded.user.role !== "admin")
      return res.status(401).json({
        error: "You are not authorized to access this route!",
      });
    next();
  } catch (e) {
    res.status(401).json({
      error: "The token is not valid!",
    });
  }
};

export default isAdmin;
