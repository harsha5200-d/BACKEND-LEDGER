const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlockListModel = require("../models/blackList.model")
// User Registration Controller
// POST /api/auth/register

async function userRegisterController(req,res){
  try {
    const {email,password,name} = req.body;

    const isExists = await userModel.findOne({ email }).select("+password");;

    if(isExists){
      return res.status(422).json({
        message : "user already exists with email.",
        status: "failed"
      });
    }

    const user = await userModel.create({ email, password, name });

    const token = jwt.sign(
      {userId:user._id},
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    res.cookie("token",token);

    // ✅ ADD THIS (you missed this earlier)
    try {
      await emailService.sendRegistrationEmail(user.email, user.name);
      console.log("📧 Email triggered");
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.status(201).json({
      user : {
        _id : user._id,
        email : user.email,
        name : user.name
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
// User Login Controller
// POST /api/auth/login

async function userLoginController(req,res){

    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password")

        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }

        const isMatch = await user.comparePassword(password)

        if(!isMatch){
            return res.status(401).json({
                message:"invalid credentials"
            })
        }

        const token = jwt.sign(
            { userId:user._id },
            process.env.JWT_SECRET,
            { expiresIn:"7d" }
        )

        // SEND TOKEN AS COOKIE
        res.cookie("token", token, {
            httpOnly:true,
            secure:true, // true only in production HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message:"login successful",
            token
        })

    } catch(err){

        console.log(err)

        return res.status(500).json({
            message:"internal server error"
        })
    }
}


async function userLogoutController(req,res)
{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token)
    {
        return res.status(400).json({
            message: "Token not provided"
        })
    }

    res.cookie("token","")

    await tokenBlockListModel.create({
        token
    })

    res.status(200).json({
        message: "Logout successful"
    })
}
module.exports = { userRegisterController, userLoginController, userLogoutController }