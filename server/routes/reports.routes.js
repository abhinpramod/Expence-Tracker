const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const { monthlyReport } = require("../controller/reports.controller");

router.get("/monthly", protectRoute, monthlyReport);
module.exports = router;
