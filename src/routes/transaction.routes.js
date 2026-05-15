const {Router} = require("express");

const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controller/transaction.controller");   
const accountModel = require("../models/account.model");


const transactionRoutes = Router();


transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)
/**
 * - POST /api/transactions/ - Create a new transaction
 * - create initail fund transaction from system user
 */
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)



module.exports = transactionRoutes