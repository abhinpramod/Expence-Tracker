const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");
const mongoose = require("mongoose");

exports.addExpense = async (req, res) => {
  try {
    const { categoryId, amount, note, date } = req.body;
    const userId = req.user._id;
    const expenseDate = date ? new Date(date) : new Date();

    // 1️⃣ Save expense
    const exp = new Expense({
      userId,
      categoryId,
      amount,
      note,
      date: expenseDate,
    });

    await exp.save();

    // 2️⃣ Find budget for month + category
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth();

    const budget = await Budget.findOne({ userId, categoryId, year, month });
    const limit = budget ? budget.amount : 0;

    // 3️⃣ Calculate total spent this month for same category
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const agg = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),   // FIXED
          categoryId: new mongoose.Types.ObjectId(categoryId), // FIXED
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$categoryId", spent: { $sum: "$amount" } } },
    ]);

    const spent = agg.length ? agg[0].spent : 0;
    const over = limit > 0 ? spent > limit : false;

    // Response
    res.status(201).json({
      success: true,
      expense: exp,
      spent,
      limit,
      over,
    });
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
