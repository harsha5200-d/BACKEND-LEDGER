const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlockListModel = require("../models/blackList.model")

async function authMiddleware(req,res,next)
{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1] 
    
    if(!token){
        return res.status(401).json({
            message:"unauthorized access, token is missing "
        })
    }

    const isBlocked = await tokenBlockListModel.findOne({ token });
    if (isBlocked) {
        return res.status(401).json({
            message: "unauthorized access, token is invalid"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        
        req.user = user
        next()

    }catch(err){
        return res.status(401).json({
            message:"unathorized access,token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req,res,next)
{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"unauthorized access, token is missing "
        })
    }

    const isBlocked = await tokenBlockListModel.findOne({ token });
    if (isBlocked) {
        return res.status(401).json({
            message: "unauthorized access, token is invalid"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user || !user.systemUser){
            return res.status(403).json({
                message:"forbidden access, system user only"
            })
        }

        req.user = user
        return next()
    }catch(err){
        return res.status(401).json({
            message:"unathorized access,token is invalid"
        })
    }
}



module.exports = {
    authMiddleware,
    authSystemUserMiddleware,
}

