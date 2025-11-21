const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");

exports.getMonthlyReport = async (req, res) => {
  console.log("in reports");
  
  try {
    const { month, year } = req.query;
    const userId = req.user._id; // 👈 Get logged in user

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month & year required" });
    }

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    // Fetch only this user's expenses for selected month
    const expenses = await Expense.find({
      userId, // 👈 filter by user
      date: {
        $gte: new Date(yearNum, monthNum, 1),
        $lt: new Date(yearNum, monthNum + 1, 1)
      }
    }).populate("categoryId", "name");

    // Fetch budgets only for this user
    const budgets = await Budget.find({ userId, month: monthNum, year: yearNum }).populate("categoryId", "name");

    const report = budgets.map(b => {
      const spent = expenses
        .filter(e => e.categoryId._id.equals(b.categoryId._id))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        category: b.categoryId.name,
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