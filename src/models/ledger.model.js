const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required : [true, "Ledger must be associated with an acccount"],
        index : true,
        immutable:true
    },

    amount:{
        type:Number,
        required : [true, "Amount is required for creating a ledger entry"],
        immutable:true
    },
    transaction : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required : [true, "Ledger must be associated with a transaction"],
        index:true,
        immutable : true
    },
    type:{
        type: String,
        enum : {
            values : ["CREDIT", "DEBIT"],
            message : "Type can be either CREDIT or DEBIT",
        },
        required : [true, "Ledger type is required "],
        immutable : true
    }
})

function PreventLedgeModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre("findOneAndUpdate", PreventLedgeModification);
ledgerSchema.pre("updateOne", PreventLedgeModification);
ledgerSchema.pre("deleteOne", PreventLedgeModification);
ledgerSchema.pre("remove", PreventLedgeModification);
ledgerSchema.pre("deleteMany", PreventLedgeModification);
ledgerSchema.pre("findOneAndDelete",PreventLedgeModification)
ledgerSchema.pre("findOneAndReplace",PreventLedgeModification)


const LedgerModel = mongoose.model("ledger",ledgerSchema)

module.exports = LedgerModel