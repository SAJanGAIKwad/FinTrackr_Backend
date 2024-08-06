import express from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add a new expense
router.post('/add', async (req, res) => {
  const { amount, category, description, userId } = req.body;
  try {
    const newExpense = new Expense({ amount, category, description, userId });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error });
  }
});

// Get all expenses for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const expenses = await Expense.find({ userId });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      console.error('Expense not found');
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Ensure user owns expense
    if (expense.userId.toString() !== req.user.id) {
      console.error('Not authorized');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Expense.deleteOne({ _id: req.params.id }); // Correct deletion method
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error('Error in delete route:', err); // Improved error logging
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { amount, category, description } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      console.error('Expense not found');
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Ensure user owns expense
    if (expense.userId.toString() !== req.user.id) {
      console.error('Not authorized');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    expense.amount = amount;
    expense.category = category;
    expense.description = description;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    console.error('Error in update route:', err);
    res.status(500).send('Server error');
  }
});

export default router;
