    const User = require('../models/user.model.js');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const sendEmail = require('../lib/nodemailar.js');
    const Otp = require('../models/otp.model.js');
    const generateToken = require('../lib/genaratetoken.js');


    const signupController = async (req, res) => {
      try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.json({ success: false, message: "User already exists" });
        }
       const  hashedPassword = await bcrypt.hash(password, 10);

   await User.create({ name, email, password: hashedPassword });
      



        return res.json({ success: true, message: "sign up successful" });

      } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Signup failed" });
      }
    };


// const verifyOtpController = async (req, res) => {
//     try {
//     const { name, email, password, otp } = req.body;

//     const otpEntry = await Otp.findOne({ email });

//     if (!otpEntry) {
//       return res.json({ success: false, message: "OTP expired or invalid" });
//     }

//     if (otpEntry.otp !== otp) {
//       return res.json({ success: false, message: "Incorrect OTP" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.create({ name, email, password: hashedPassword });

//     const existingUser = await User.findOne({ email });

//     await Otp.deleteOne({ email });

//         generateToken(existingUser._id, res);

//     return res.json({ success: true, message: "OTP verified and user created", user: { name, email } });

//   } catch (err) {
//     console.log(err);
//     res.json({ success: false, message: "OTP Verification failed" });
//   }
// };

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {

            return res.status(400).json({ message: 'User not found' });
            
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        generateToken(existingUser._id, res);
        const userdata={
            name:existingUser.name,
            email:existingUser.email,
            _id:existingUser._id
        }
        
        res.status(200).json({ success: true,  user: userdata });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}; 
const cheakauthController = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,        
      sameSite: "none",    
    });
       
    return res.json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

module.exports = {
    signupController,
    loginController,
    // verifyOtpController,
    cheakauthController,
    logoutController
};