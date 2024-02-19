import { Request, Response } from "express";
import {User} from "../modals/User";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../helpers/sendEmail";

export const createUser = async (req: Request, res: Response) => {
  const userData = req.body;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array()[0].msg });
  }
  if (userData.password !== userData.confirm_password) {
    return res.status(400).json({ error: "Passwords do not match!" });
  }
  try {
    const userFound = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });
    if (!userFound) {
      //encrypt password
      bcrypt.hash(
        userData.password,
        11,
        async (err: Error | undefined, hashedPassword: string) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          let user = new User({
            username: userData.username.trim(),
            email: userData.email.trim(),
            password: hashedPassword,
            role: userData.role.trim(),
          });

          const payload = {
            password: user.password,
            username: user.username,
            email: user.email,
            role: user.role,
          };

          

          jwt.sign(
            payload,
            `${process.env.MY_SECRET_KEY}`,
            { expiresIn: "10h" },
            async (err: Error | null, token: string | undefined) => {
              if (err)
                return res.json({
                  error: err.message,
                });

              const emailData = {
                from: process.env.EMAIL_FROM,
                to: user.email || "",
                subject: "Account Activation Link",
                html: `<h4>Please click the activation to activate your account</h4><h4>N:B:This link will be expired in 10 hours</h4><P>${process.env.CLIENT_URL}/user/activativation/${token}</P></hr><p>This Email contains Sensitive Information. So, Please do not share with anyone</p>`,
              };
              const emailsent = await sendEmail(emailData);
              if(emailsent === true){
                return res.status(200).json({
                  message: `email has been sent to ${user.email}`,
                });
              } else{
                return res.status(500).json({
                  error: emailsent,
                });
              }
            }
          );
        }
      );
    } else {
      return res.status(400).json({
        error: "User already exists!",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: "Server error!",
    });
  }
};

//user login system
export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  }
  //see if the user exists
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        error: "User does not exist!",
      });
    }

    //encrypt password
    const isMatched = await bcrypt.compare(password, user.password || "");
    if (!isMatched) {
      return res.status(401).json({
        error: "Your credentials are invalid",
      });
    }
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
    jwt.sign(
      payload,
      `${process.env.LOGINTOKEN}`,
      { expiresIn: 36000 },
      (err: Error | null, token: string | undefined) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ token });
      }
    );
  } catch (e) {
    res.status(500).json({
      error: "Server error!",
    });
  }
};

export const activationAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (token) {
      jwt.verify(
        token,
        `${process.env.MY_SECRET_KEY}`,
        async (err: Error | null, decoded: any) => {

          if (err) {
            return res.json({
              error: "Token Expired.Please sign up again",
            });
          } else {
            if (typeof decoded !== "object" || decoded === null) {
              return res.status(400).json({
                error: "Invalid token format",
              });
            }
            const { username, email, password, role } = decoded;
            let userFound = await User.findOne({ email });
            if (userFound) {
              return res.json({
                error: "user already exists",
              });
            }
            const user = new User({
              username,
              email,
              password,
              role,
            });
            try {
              const userData = await user.save();
              return res.json({
                success: true,
                user: userData,
                message:
                  "Your Account Has Been Activated. Please Login into your account",
              });
            } catch (err) {
              return res.status(500).json({
                error: "An error occurred during account activation",
              });
            }
          }
        }
      );
    } else {
      return res.status(500).json({
        error: "Error Happening. Please try again",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  } else {
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          error: "User doesn't Exist",
        });
      }
      const token = jwt.sign(
        {
          _id: user._id,
        },
        `${process.env.MY_RESET_LINK}`,
        {
          expiresIn: "1d",
        }
      );
      let result = await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordLink: token } }
      );
      if (result) {
        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Password Reset link`,
          html: `<h1>Please use the following link to reset your password</h1>
                 <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                 <hr />
                 <p>This email may contain sensetive information</p>
                 <p>${process.env.CLIENT_URL}</p>
                `,
        };
        const emailsent = await sendEmail(emailData);
        if(emailsent === true){
          return res.status(200).json({
            message: `email has been sent to ${user.email}`,
          });
        } else{
          return res.status(500).json({
            error: emailsent,
          });
        }
      }
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  const { resetPasswordLink, newPassword } = req.body;
  try {
    if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, `${process.env.MY_RESET_LINK}` , async (err: Error | null, decoded: any) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
          });
        }
        const {_id} = decoded
        let user = await User.findOne({
          _id: _id,
        });
        if (!user) {
          return res.status(404).json({
            error: "The User doesn't Exist !",
          });
        }

        //hashing password
        bcrypt.hash(newPassword, 11, async (err, hashedPassword) => {
          if (err) {
            res.json(err);
          }
          let result = await User.updateOne(
            { _id: user?._id },
            { $set: { resetPasswordLink: "", password: hashedPassword } }
          );
          if (result) {
            return res.status(200).json({
              success: true,
              message: "You have successfully Reset the password !",
            });
          } else {
            return res.status(500).json({
              error: "The is a Database error !",
            });
          }
        });
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
