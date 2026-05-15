const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const transactionModel = require("../models/transaction.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

async function createTransaction(req, res) {

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Validate Request
    |--------------------------------------------------------------------------
    */

    const { fromAccount, toAccount, amount } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({
        message: "fromAccount, toAccount and amount are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Find Accounts
    |--------------------------------------------------------------------------
    */

    const fromUserAccount = await accountModel.findById(fromAccount);

    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Check Account Status
    |--------------------------------------------------------------------------
    */

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        message:
          "Both fromAccount and toAccount must be ACTIVE",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Check Balance
    |--------------------------------------------------------------------------
    */

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Available balance is ${balance}`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Start Mongo Transaction
    |--------------------------------------------------------------------------
    */

    const session = await mongoose.startSession();

    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | 6. Create Transaction
    |--------------------------------------------------------------------------
    */

    const transaction = await transactionModel.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount: toUserAccount._id,
          amount,
          status: "PENDING",
        },
      ],
      { session }
    );

    /*
    |--------------------------------------------------------------------------
    | 7. Debit Ledger Entry
    |--------------------------------------------------------------------------
    */

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          transaction: transaction[0]._id,
          amount,
          type: "DEBIT",
        },
      ],
      { session }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    /*
    |--------------------------------------------------------------------------
    | 8. Credit Ledger Entry
    |--------------------------------------------------------------------------
    */

    await ledgerModel.create(
      [
        {
          account: toUserAccount._id,
          transaction: transaction[0]._id,
          amount,
          type: "CREDIT",
        },
      ],
      { session }
    );

    /*
    |--------------------------------------------------------------------------
    | 9. Update Transaction Status
    |--------------------------------------------------------------------------
    */

    transaction[0].status = "COMPLETED";

    await transaction[0].save({ session });

    /*
    |--------------------------------------------------------------------------
    | 10. Commit Transaction
    |--------------------------------------------------------------------------
    */

    await session.commitTransaction();

    session.endSession();

    /*
    |--------------------------------------------------------------------------
    | 11. Send Email
    |--------------------------------------------------------------------------
    */

    await emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toUserAccount._id
    );

    /*
    |--------------------------------------------------------------------------
    | 12. Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      message: "Transaction processed successfully",
      transaction: transaction[0],
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });

  }
}

async function createInitialFundsTransaction(req, res) {

  const session = await mongoose.startSession();

  try {

    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }
    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
      return res.status(404).json({
        message: "Receiver account not found",
      });
    }

    const fromUserAccount = await accountModel.findOne({
      user: req.user._id,
      status: "ACTIVE",
    });

    if (!fromUserAccount) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Start Mongo Transaction
    |--------------------------------------------------------------------------
    */
    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | Create Transaction
    |--------------------------------------------------------------------------
    */
    const transaction = await transactionModel.create(
  [
    {
      fromAccount: fromUserAccount._id,
      toAccount: toUserAccount._id,
      amount,
      idempotencyKey: uuidv4(),
      status: "COMPLETED",
    },
  ],
  { session }
);

    /*
    |--------------------------------------------------------------------------
    | Debit Ledger Entry
    |--------------------------------------------------------------------------
    */
    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          transaction: transaction[0]._id,
          amount,
          type: "DEBIT",
        },
      ],
      { session }
    );

    /*
    |--------------------------------------------------------------------------
    | Credit Ledger Entry
    |--------------------------------------------------------------------------
    */
    await ledgerModel.create(
      [
        {
          account: toUserAccount._id,
          transaction: transaction[0]._id,
          amount,
          type: "CREDIT",
        },
      ],
      { session }
    );

    /*
    |--------------------------------------------------------------------------
    | Commit Transaction
    |--------------------------------------------------------------------------
    */
    await session.commitTransaction();

    return res.status(200).json({
      message: "Initial fund transaction processed successfully",
      transaction: transaction[0],
    });

  } catch (error) {

    console.log(error);

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });

  } finally {

    await session.endSession();

  }
}


module.exports = {
  createInitialFundsTransaction,
  createTransaction,
};