// 

const mongoose = require("mongoose");
const LedgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with a user"],
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "CLOSED"],
      default: "ACTIVE",
    },

    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },

    systemUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Compound Index
|--------------------------------------------------------------------------
*/
accountSchema.index({ user: 1, status: 1 });

/*
|--------------------------------------------------------------------------
| Get Account Balance
|--------------------------------------------------------------------------
*/
accountSchema.methods.getBalance = async function () {
  try {
    const balanceData = await LedgerModel.aggregate([
      {
        $match: {
          account: this._id,
        },
      },

      {
        $group: {
          _id: null,

          totalDebit: {
            $sum: {
              $cond: [
                { $eq: ["$type", "DEBIT"] },
                "$amount",
                0,
              ],
            },
          },

          totalCredit: {
            $sum: {
              $cond: [
                { $eq: ["$type", "CREDIT"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          balance: {
            $subtract: ["$totalCredit", "$totalDebit"],
          },
        },
      },
    ]);

    if (!balanceData.length) {
      return 0;
    }

    return balanceData[0].balance;

  } catch (error) {
    console.log("Balance Calculation Error:", error);
    return 0;
  }
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;