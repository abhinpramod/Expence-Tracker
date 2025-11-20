const Budget = require("../models/budget.model");

exports.setBudgets = async (req, res) => {
  // expects array: [{ categoryId, amount }]
  const userId = req.user._id;
  const { month, year, budgets } = req.body;
  // upsert each
  const ops = budgets.map(b => ({
    updateOne: {
      filter: { userId, categoryId: b.categoryId, month, year },
      update: { $set: { amount: b.amount } },
      upsert: true
    }
  }));
  await Budget.bulkWrite(ops);
  res.json({ message: "Budgets saved" });
};

exports.getBudgets = async (req, res) => {
  const userId = req.user._id;
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  const db = await Budget.find({ userId, month, year });
  res.json(db);
};
