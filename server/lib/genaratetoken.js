const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = async (Id, res) => {
  const token = jwt.sign({ Id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",                                 

    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

module.exports = generateToken;