const mongoose = require("mongoose")

const tokenBlacklistSchema = new mongoose.Schema({
    token : {
        type:String,
        required : [true, "Token is required to blacklist"],
        unique: [true, "This token is already blacklisted"]
    },
    blackListedAt : {
        type:Date,
        default:Date.now,
        immutable:true,
    }
},
    {
        timestamps:true
    }
)

tokenBlacklistSchema.index({createdAt:1}, {expireAfterSeconds: 60*60*24*7 })

const tokenBlacklistModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema)

module.exports = tokenBlacklistModel    