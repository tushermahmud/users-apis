jest.mock("../controllers/user.controller", () => ({
  ...jest.requireActual("../controllers/user.controller"),
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn((password, salt, callback) => callback(null, "hashedPassword")),
  compare: jest.fn((password, hashedPassword, callback) =>
    callback(null, true)
  ),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn((payload, secretKey, options, callback) =>
    callback(null, "token")
  ),
  verify: jest.fn((token, secret, callback) => {
    callback(null, {
      username: "testUser",
      email: "test@example.com",
      password: "hashedPassword",
      role: "user",
    });
  }),
}));
jest.mock("../helpers/sendEmail", () => ({
  sendEmail: jest.fn(() => Promise.resolve(true)),
}));

import supertest from "supertest";
import { app } from "../app"; // Import your Express app
import {
  activationAccount,
  createUser,
  login,
} from "../controllers/user.controller";
import { User } from "../modals/User"; // Corrected the path to match case sensitivity
import { sendEmail } from "../helpers/sendEmail";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const request = supertest(app);

describe("User Endpoints", () => {
  describe("should create a new user", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should create a user successfully", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue({
        username: "testUser",
        email: "test@example.com",
        role: "user",
      });
      const req = {
        body: {
          username: "testUser",
          email: "test@example.com",
          password: "password123",
          confirm_password: "password123",
          role: "user",
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createUser(req, res);
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: "test@example.com" }, { username: "testUser" }],
      });
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });

    it("Login with credentials", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      User.findOne = jest.fn().mockResolvedValue({
        _id: "1234567890",
        email: "test@example.com",
        password: "password123", // Assuming "hashedPassword" is the hash of "password123"
        role: "user",
      });
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      await login(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "password123");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: "1234567890", email: "test@example.com", role: "user" } },
        "LOGINTOKEN",
        { expiresIn: 36000 },
        expect.any(Function) // Expect any function as the last argument
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should reject a login attempt with incorrect password", async () => {
      User.findOne = jest.fn().mockResolvedValue({
        _id: "123",
        email: "test@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      const response = await request.post("/user/login").send({
        email: "test@example.com",
        password: "wrongPassword",
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Your credentials are invalid");
    });

    it("Should not create the user with existing email", async () => {
      User.findOne = jest.fn().mockResolvedValue({
        username: "sazzadmahmudcandidate",
        email: "sazzadmahmudtusher@gmail.com",
      });
      const res = await request.post("/user/createUser").send({
        username: "sazzadmahmudcandidate1",
        email: "sazzadmahmudtusher1@gmail.com",
        password: "sazzadmahmud",
        confirm_password: "sazzadmahmud",
        role: "user",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe("User already exists!");
    });
  });
});
