import express from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';
import CurrencyConverter from 'currency-converter-lt';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Add a new expense
router.post('/add', async (req, res) => {
  const { amount, category, description, currency, userId } = req.body;
  try {
    let convertedAmount = parseFloat(amount);
    if (isNaN(convertedAmount)) {
      return res.status(400).json({ message: 'Amount must be a valid number' });
    }
    if (currency !== 'USD') {
      const currencyConverter = new CurrencyConverter();
      convertedAmount = await currencyConverter.from(currency).to('USD').amount(amount).convert();
    }
    const newExpense = new Expense({
      amount: convertedAmount,
      category,
      description,
      userId,
      currency,
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
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
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
});

// Export expenses as CSV
router.get('/:userId/export/csv', async (req, res) => {
  const { userId } = req.params;
  try {
    const expenses = await Expense.find({ userId });
    const fields = ['date', 'description', 'amount', 'currency'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting expenses as CSV:', error);
    res.status(500).json({ message: 'Error exporting expenses as CSV', error });
  }
});

// Export expenses as PDF
router.get('/:userId/export/pdf', async (req, res) => {
  const { userId } = req.params;
  try {
    const expenses = await Expense.find({ userId });

    const doc = new PDFDocument();
    let filename = 'expenses.pdf';
    filename = encodeURIComponent(filename);
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.text('Expense List', {
      align: 'center',
    });

    expenses.forEach((expense, index) => {
      doc.text(`${index + 1}. Date: ${expense.date}, Description: ${expense.description}, Amount: ${expense.amount} ${expense.currency}`, {
        align: 'left',
      });
    });

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error('Error exporting expenses as PDF:', error);
    res.status(500).json({ message: 'Error exporting expenses as PDF', error });
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      console.error('Expense not found');
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Ensure user owns the expense
    if (expense.userId.toString() !== req.user.id) {
      console.error('Not authorized');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Expense.deleteOne({ _id: req.params.id }); // Correct deletion method
    res.json({ msg: 'Expense removed' });
  } catch (error) {
    console.error('Error in delete route:', error); // Improved error logging
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update an expense
router.put('/:id', auth, async (req, res) => {
  const { amount, category, description, currency } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      console.error('Expense not found');
      return res.status(404).json({ msg: 'Expense not found' });
    }
    
    // Ensure user owns the expense
    if (expense.userId.toString() !== req.user.id) {
      console.error('Not authorized');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    let convertedAmount = parseFloat(amount);
    if (isNaN(convertedAmount)) {
      return res.status(400).json({ message: 'Amount must be a valid number' });
    }

    // Convert the amount to USD if the currency is different
    if (currency && currency !== expense.currency) {
      const currencyConverter = new CurrencyConverter();
      convertedAmount = await currencyConverter.from(currency).to('USD').amount(amount).convert();
    }

    expense.amount = convertedAmount;
    expense.category = category;
    expense.description = description;
    expense.currency = currency || expense.currency;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error in update route:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
