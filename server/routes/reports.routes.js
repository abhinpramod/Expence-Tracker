const express = require("express");
const router = express.Router();

const protectRoute = require("../middleware/protectroute");
const { getMonthlyReport } = require("../controller/reports.controller");

router.get("/", protectRoute, getMonthlyReport);
module.exports = router;
