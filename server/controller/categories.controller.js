const Category = require("../models/category.model");
const Expense = require("../models/expense.model");
exports.list = async (req, res) => {
  const categories = await Category.find({ userId: req.user._id }).sort("name");
  res.json(categories);
};

exports.create = async (req, res) => {
  const { name, color } = req.body;
  const cat = new Category({ userId: req.user._id, name, color });
  await cat.save();
  res.status(201).json(cat);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  const cat = await Category.findOneAndUpdate({ _id: id, userId: req.user._id }, { name, color }, { new: true });
  res.json(cat);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  await Category.deleteOne({ _id: id, userId: req.user._id });
  res.json({ message: "Deleted" });
};


exports.getCategoryExpenses = async (req, res) => {
  const categoryId = req.params.id;
  const userId = req.user._id;

  const { month, year } = req.query;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await Expense.find({
    userId,
    categoryId,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 });

  res.json({ expenses });
};

