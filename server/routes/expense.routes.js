const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const { addExpense } = require("../controller/expense.controller");

router.post("/", protectRoute, addExpense);

module.exports = router;
