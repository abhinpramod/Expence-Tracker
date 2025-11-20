const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const { setBudgets, getBudgets } = require("../controller/budget.controller");

router.get("/", protectRoute, getBudgets);
router.post("/", protectRoute, setBudgets);

module.exports = router;
