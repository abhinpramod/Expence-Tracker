const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");

exports.getMonthlyReport = async (req, res) => {

  try {
    const { month, year } = req.query;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month & year required" });
    }

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: new Date(yearNum, monthNum, 1),
        $lt: new Date(yearNum, monthNum + 1, 1)
      }
    }).populate("categoryId", "name");

    const budgets = await Budget.find({
      userId,
      month: monthNum,
      year: yearNum
    }).populate("categoryId", "name");

    const report = budgets.map(b => {
      const spent = expenses
        .filter(e =>
          e.categoryId &&
          b.categoryId &&
          e.categoryId._id &&
          b.categoryId._id &&
          e.categoryId._id.equals(b.categoryId._id)
        )
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        category: b.categoryId ? b.categoryId.name : "Unknown",
        budget: b.amount,
        spent,
        remaining: b.amount - spent
      };
    });

    res.status(200).json({ success: true, data: report });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch report" });
  }
};
