const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "account",
        required : [true, "Transaction must be associated with a from account "],
        index : true
    },

    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "account",
        required : [true, "Transaction must be associated with a from account"],
        index : true
    },

    status:{
        type:String,
        enum:{

            values : ["PENDING","COMPLETED","FAILED","REVERSED"],
            message : "status can be either PENDING, COMPLETED, FAILED or REVERSED",
        },
        default : "PENDING"
    },

    amount : {
        type:Number,
        required : [true, "Amount is required for creating a transaction"],
        min : [0, "Transaction amount cannot be negative "]
    },
     idempotencykey:{
        type:String,
        required:true,
        unique:true,
        default: uuidv4
    }
}, {
    timestamps:true
})

module.exports = mongoose.model(
    "transaction",
    transactionSchema
)